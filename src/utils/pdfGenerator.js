import { HEADER_B64, FOOTER_B64 } from './letterheadImages';
import { FIELD_DEFINITIONS } from './docxGenerator';

// Uses jsPDF (loaded via CDN-style dynamic import fallback, bundled via npm)
// We'll use the browser's canvas + jsPDF approach

function b64ToDataUrl(b64, mime = 'image/jpeg') {
  return `data:${mime};base64,${b64}`;
}

function getFieldValue(field, row) {
  if (field.composite) {
    const vals = field.composite.map(k => row[k] || '').filter(Boolean);
    return vals.join(' / ') || '';
  }
  return row[field.key] || '';
}

export async function generatePdfBlob(row) {
  const { jsPDF } = await import('jspdf');

  // A4 in mm: 210 x 297
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN_X = 12;
  const CONTENT_W = PAGE_W - MARGIN_X * 2;

  // ── Header image ────────────────────────────────────────────────────────
  // Original aspect: 1191 x 410 px  → ratio 410/1191 ≈ 0.3443
  const headerH = CONTENT_W * (410 / 1191);
  doc.addImage(b64ToDataUrl(HEADER_B64), 'JPEG', MARGIN_X, 6, CONTENT_W, headerH);

  // ── Footer image (on every page) ─────────────────────────────────────────
  const footerH = CONTENT_W * (114 / 1786);

  function addFooter() {
    doc.addImage(b64ToDataUrl(FOOTER_B64), 'JPEG', MARGIN_X, PAGE_H - footerH - 4, CONTENT_W, footerH);
  }
  addFooter();

  // ── Helpers ─────────────────────────────────────────────────────────────
  const FONT_NORMAL = 'helvetica';
  const BODY_PT  = 9;
  const LABEL_PT = 8.5;
  const TITLE_PT = 13;
  const SEC_PT   = 10;
  const LINE_H   = 5.2;

  let y = 6 + headerH + 6; // start just below header
  const BOTTOM_LIMIT = PAGE_H - footerH - 8;

  function checkPage(needed = 8) {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage();
      // Re-draw header & footer on new page
      doc.addImage(b64ToDataUrl(HEADER_B64), 'JPEG', MARGIN_X, 6, CONTENT_W, headerH);
      addFooter();
      y = 6 + headerH + 6;
    }
  }

  function writeLine(text, opts = {}) {
    const { bold = false, size = BODY_PT, align = 'left', color = [0, 0, 0], indent = 0 } = opts;
    checkPage(LINE_H);
    doc.setFont(FONT_NORMAL, bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const x = MARGIN_X + indent;
    const maxW = CONTENT_W - indent;
    if (align === 'center') {
      doc.text(text, PAGE_W / 2, y, { align: 'center', maxWidth: maxW });
    } else {
      doc.text(text, x, y, { maxWidth: maxW });
    }
    // Measure wrapped height
    const lines = doc.splitTextToSize(text, maxW);
    y += lines.length * LINE_H;
  }

  function writeHr(color = [180, 180, 180]) {
    checkPage(4);
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, y, MARGIN_X + CONTENT_W, y);
    y += 3;
  }

  function writeFieldRow(roman, label, value) {
    // Write label bold + value normal on same line, with wrapping
    const fullLabel = `${roman}. ${label}: `;
    const fullText  = fullLabel + (value || '________________________');
    const lines = doc.splitTextToSize(fullText, CONTENT_W);
    checkPage(lines.length * LINE_H + 1);

    // Bold prefix
    doc.setFont(FONT_NORMAL, 'bold');
    doc.setFontSize(LABEL_PT);
    doc.setTextColor(0, 0, 0);
    const labelWidth = doc.getTextWidth(fullLabel);

    if (labelWidth < CONTENT_W * 0.55) {
      // Label fits on one line — write label bold, then value normal inline
      doc.text(fullLabel, MARGIN_X, y);
      doc.setFont(FONT_NORMAL, 'normal');
      const remaining = CONTENT_W - labelWidth;
      const valueLines = doc.splitTextToSize(value || '________________________', remaining);
      doc.text(valueLines[0], MARGIN_X + labelWidth, y);
      y += LINE_H;
      for (let i = 1; i < valueLines.length; i++) {
        checkPage(LINE_H);
        doc.text(valueLines[i], MARGIN_X + labelWidth, y);
        y += LINE_H;
      }
    } else {
      // Long label — wrap entire text together
      doc.text(doc.splitTextToSize(fullText, CONTENT_W), MARGIN_X, y);
      y += lines.length * LINE_H;
    }
    y += 1;
  }

  // ── Content ──────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const refNo = `APT/${new Date().getFullYear()}/${String(row._rowIndex || 1).padStart(4, '0')}`;

  writeLine(`Date: ${today}`, { bold: false, size: BODY_PT });
  y += 1;
  writeLine(`Ref: ${refNo}`, { bold: false, size: BODY_PT });
  y += 4;

  // Title
  writeLine('APPOINTMENT LETTER', { bold: true, size: TITLE_PT, align: 'center' });
  y += 1;
  writeHr([46, 125, 50]); // green line

  y += 3;
  writeLine(`Dear ${row.employeeName || 'Employee'},`, { size: BODY_PT });
  y += 2;
  writeLine('Sub: ', { bold: true, size: BODY_PT });
  // Write subject on same line
  y -= LINE_H;
  doc.setFont(FONT_NORMAL, 'bold');
  doc.setFontSize(BODY_PT);
  const subLabel = 'Sub: ';
  const subLabelW = doc.getTextWidth(subLabel);
  doc.setFont(FONT_NORMAL, 'normal');
  const subText = `Appointment as ${row.designation || 'Employee'} – reg.`;
  doc.text(subText, MARGIN_X + subLabelW, y, { maxWidth: CONTENT_W - subLabelW });
  y += LINE_H + 3;

  writeLine(
    'We are pleased to appoint you in our organisation on the terms and conditions stated below, in accordance with the Code on Wages, 2019 and the Code on Social Security, 2020. Please retain this letter for your records.',
    { size: BODY_PT }
  );
  y += 4;

  writeLine('TERMS OF APPOINTMENT', { bold: true, size: SEC_PT });
  y += 1;
  writeHr([100, 100, 100]);
  y += 2;

  FIELD_DEFINITIONS.forEach(field => {
    const value = getFieldValue(field, row);
    writeFieldRow(field.roman, field.label, value);
  });

  y += 6;
  writeHr([100, 100, 100]);
  y += 4;

  writeLine(
    'Please sign and return a copy of this letter as acknowledgement of your acceptance of the above terms and conditions.',
    { size: BODY_PT }
  );
  y += 8;

  writeLine('For NLC India Renewables Limited', { bold: true, size: BODY_PT });
  y += 14;
  writeLine('Authorised Signatory', { bold: true, size: BODY_PT });
  writeLine('Name & Designation: ___________________________', { size: BODY_PT });
  y += 1;
  writeLine('Date: _____________________', { size: BODY_PT });

  y += 10;

  writeLine('ACKNOWLEDGEMENT BY EMPLOYEE', { bold: true, size: SEC_PT });
  y += 1;
  writeHr([100, 100, 100]);
  y += 3;

  writeLine(
    `I, ${row.employeeName || '______________________'}, acknowledge receipt of this Appointment Letter and confirm my acceptance of all terms and conditions stated above.`,
    { size: BODY_PT }
  );
  y += 8;
  writeLine('Signature of Employee: ___________________________', { size: BODY_PT });
  y += 1;
  writeLine('Date: _____________________', { size: BODY_PT });

  // Return as blob
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}
