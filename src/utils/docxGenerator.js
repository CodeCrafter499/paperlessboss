import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle, UnderlineType,
  Header, Footer, ImageRun,
} from 'docx';
import { HEADER_B64, FOOTER_B64 } from './letterheadImages';

const FONT        = 'Arial';
const BODY_SIZE   = 20;   // 10pt
const TITLE_SIZE  = 28;   // 14pt
const HEADING_SIZE = 22;  // 11pt

export const FIELD_DEFINITIONS = [
  { roman: 'i',    label: 'Name of employee',                                                                                        key: 'employeeName' },
  { roman: 'ii',   label: 'Date of birth',                                                                                           key: 'dateOfBirth' },
  { roman: 'iii',  label: "Father's / Mother's name",                                                                                key: 'parentName' },
  { roman: 'iv',   label: 'Aadhaar number (after obtaining consent)',                                                                key: 'aadhaarNumber' },
  { roman: 'v',    label: 'Labour Identification Number (LIN) of the establishment',                                                 key: 'linNumber' },
  { roman: 'vi',   label: 'Universal Account Number (UAN) and / or Insurance Number (ESIC) (if available)',                         key: 'uanEsic' },
  { roman: 'vii',  label: 'Designation',                                                                                             key: 'designation' },
  { roman: 'viii', label: 'Type of Employment (Regular/Fixed-term-employment/Contractual)',                                          key: 'employmentType' },
  { roman: 'ix',   label: 'Category of skill',                                                                                      key: 'skillCategory' },
  { roman: 'x',    label: 'Date of joining',                                                                                         key: 'dateOfJoining' },
  { roman: 'xi',   label: 'Wages/Basic Pay and Dearness Allowance',                                                                  key: null, composite: ['basicPay', 'dearnessAllowance'] },
  { roman: 'xii',  label: 'Other allowance including accommodation whichever is/are applicable',                                     key: 'otherAllowance' },
  { roman: 'xiii', label: 'Applicability of social security [EPFO and ESIC] benefits',                                              key: 'socialSecurity' },
  { roman: 'xiv',  label: 'Broad Nature of duties to be performed',                                                                  key: 'duties' },
  { roman: 'xv',   label: 'Benefits under chapter VI (Maternity Benefit) of Code on Social Security, 2020',                         key: 'maternityBenefits' },
  { roman: 'xvi',  label: 'Any other information',                                                                                   key: 'otherInfo' },
];

function getFieldValue(field, row) {
  if (field.composite) {
    const vals = field.composite.map(k => row[k] || '').filter(Boolean);
    return vals.join(' / ') || '';
  }
  return row[field.key] || '';
}

function b64ToUint8(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function hrPara() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2E7D32', space: 1 } },
    children: [],
  });
}

function spacer(before = 200) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [new TextRun('')] });
}

export async function generateDocxBlob(row) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const refNo = `APT/${new Date().getFullYear()}/${String(row._rowIndex || 1).padStart(4, '0')}`;

  // A4 content width at 1.8cm margins each side ≈ 9026 DXA
  const PAGE_W = 11906;
  const MARGIN = 1020; // ~1.8cm
  const CONTENT_W = PAGE_W - MARGIN * 2; // ~9866

  // Header image: 1191px wide at 2x = actual 595.5pt wide = full page width in EMU
  const headerImgW = CONTENT_W * 914400 / 1440; // EMU
  const headerImgH = Math.round(headerImgW * (410 / 1191));

  const footerImgW = CONTENT_W * 914400 / 1440;
  const footerImgH = Math.round(footerImgW * (114 / 1786));

  const headerSection = new Header({
    children: [
      new Paragraph({
        spacing: { before: 0, after: 80 },
        children: [
          new ImageRun({
            data: b64ToUint8(HEADER_B64),
            transformation: { width: Math.round(headerImgW / 914400 * 96), height: Math.round(headerImgH / 914400 * 96) },
            type: 'jpg',
          }),
        ],
      }),
    ],
  });

  const footerSection = new Footer({
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            data: b64ToUint8(FOOTER_B64),
            transformation: { width: Math.round(footerImgW / 914400 * 96), height: Math.round(footerImgH / 914400 * 96) },
            type: 'jpg',
          }),
        ],
      }),
    ],
  });

  const body = [
    // Date + ref
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({ text: 'Date: ', bold: true, size: BODY_SIZE, font: FONT }),
        new TextRun({ text: today, size: BODY_SIZE, font: FONT }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 280 },
      children: [
        new TextRun({ text: 'Ref: ', bold: true, size: BODY_SIZE, font: FONT }),
        new TextRun({ text: refNo, size: BODY_SIZE, font: FONT }),
      ],
    }),

    // Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: 'APPOINTMENT LETTER', bold: true, size: TITLE_SIZE, font: FONT, underline: { type: UnderlineType.SINGLE } })],
    }),
    hrPara(),

    // Salutation
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [new TextRun({ text: `Dear ${row.employeeName || 'Employee'},`, size: BODY_SIZE, font: FONT })],
    }),

    // Subject
    new Paragraph({
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({ text: 'Sub: ', bold: true, size: BODY_SIZE, font: FONT }),
        new TextRun({ text: `Appointment as ${row.designation || 'Employee'} – reg.`, bold: true, size: BODY_SIZE, font: FONT, underline: { type: UnderlineType.SINGLE } }),
      ],
    }),

    // Opening
    new Paragraph({
      spacing: { before: 0, after: 200 },
      children: [new TextRun({
        text: `We are pleased to appoint you in our organisation on the terms and conditions stated below, in accordance with the Code on Wages, 2019 and the Code on Social Security, 2020. Please retain this letter for your records.`,
        size: BODY_SIZE, font: FONT,
      })],
    }),

    // Terms heading
    new Paragraph({
      spacing: { before: 160, after: 100 },
      children: [new TextRun({ text: 'TERMS OF APPOINTMENT', bold: true, size: HEADING_SIZE, font: FONT })],
    }),
    hrPara(),

    // Fields
    ...FIELD_DEFINITIONS.map(field => {
      const value = getFieldValue(field, row);
      return new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [
          new TextRun({ text: `${field.roman}. `, bold: true, size: BODY_SIZE, font: FONT }),
          new TextRun({ text: `${field.label}: `, bold: true, size: BODY_SIZE, font: FONT }),
          new TextRun({ text: value || '________________________', size: BODY_SIZE, font: FONT }),
        ],
      });
    }),

    spacer(360),
    hrPara(),

    // Closing
    new Paragraph({
      spacing: { before: 160, after: 200 },
      children: [new TextRun({
        text: 'Please sign and return a copy of this letter as acknowledgement of your acceptance of the above terms and conditions.',
        size: BODY_SIZE, font: FONT,
      })],
    }),

    spacer(280),

    // Employer signature
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: 'For NLC India Renewables Limited', bold: true, size: BODY_SIZE, font: FONT })] }),
    spacer(500),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: 'Authorised Signatory', bold: true, size: BODY_SIZE, font: FONT })] }),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: 'Name & Designation: ', bold: true, size: BODY_SIZE, font: FONT })] }),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: 'Date: ', bold: true, size: BODY_SIZE, font: FONT })] }),

    spacer(400),

    // Employee acknowledgement
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'ACKNOWLEDGEMENT BY EMPLOYEE', bold: true, size: HEADING_SIZE, font: FONT })],
    }),
    hrPara(),
    new Paragraph({
      spacing: { before: 160, after: 200 },
      children: [new TextRun({
        text: `I, ${row.employeeName || '______________________'}, acknowledge receipt of this Appointment Letter and confirm my acceptance of all terms and conditions stated above.`,
        size: BODY_SIZE, font: FONT,
      })],
    }),
    spacer(360),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: 'Signature of Employee: ', bold: true, size: BODY_SIZE, font: FONT })] }),
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: 'Date: ', bold: true, size: BODY_SIZE, font: FONT })] }),
  ];

  const doc = new Document({
    creator: 'NLC India Renewables Limited',
    title: `Appointment Letter – ${row.employeeName || 'Employee'}`,
    sections: [{
      headers: { default: headerSection },
      footers: { default: footerSection },
      properties: {
        page: {
          size: { width: PAGE_W, height: 16838 },
          margin: { top: 1800, right: MARGIN, bottom: 1200, left: MARGIN },
        },
      },
      children: body,
    }],
  });

  return Packer.toBlob(doc);
}

export function sanitizeFilename(name) {
  return (name || 'Employee')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 60);
}
