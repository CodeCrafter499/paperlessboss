import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { RefreshCw } from 'lucide-react';

import UploadZone from './components/UploadZone';
import DataPreview from './components/DataPreview';
import GeneratePanel from './components/GeneratePanel';
import LettersList from './components/LettersList';

import { parseExcelFile, validateRows } from './utils/excelParser';
import { generateDocxBlob, sanitizeFilename } from './utils/docxGenerator';
import { generatePdfBlob } from './utils/pdfGenerator';

import styles from './App.module.css';

export default function App() {
  const [state, setState]             = useState('idle');
  const [rows, setRows]               = useState([]);
  const [filename, setFilename]       = useState('');
  const [warnings, setWarnings]       = useState([]);
  const [parseError, setParseError]   = useState('');
  const [genProgress, setGenProgress] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [isZipping, setIsZipping]     = useState(false);
  const [format, setFormat]           = useState('both'); // 'docx' | 'pdf' | 'both'

  const handleFile = useCallback(async (file) => {
    setParseError('');
    setRows([]);
    setGeneratedFiles([]);
    setFilename(file.name);
    setState('parsing');
    try {
      const { rows: parsed } = await parseExcelFile(file);
      const warns = validateRows(parsed);
      setRows(parsed);
      setWarnings(warns);
      setState('previewing');
    } catch (err) {
      setParseError(err.message);
      setState('idle');
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    setState('generating');
    setGenProgress(0);
    const files = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const safeName = sanitizeFilename(row.employeeName);

      const entry = {
        name: row.employeeName || `Employee ${i + 1}`,
        designation: row.designation || '',
        dateOfJoining: row.dateOfJoining || '',
        safeName,
        docxBlob: null,
        pdfBlob: null,
        docxFilename: `Appointment_${safeName}.docx`,
        pdfFilename: `Appointment_${safeName}.pdf`,
      };

      if (format === 'docx' || format === 'both') {
        entry.docxBlob = await generateDocxBlob(row);
      }
      if (format === 'pdf' || format === 'both') {
        entry.pdfBlob = await generatePdfBlob(row);
      }

      files.push(entry);
      setGenProgress(i + 1);
      await new Promise(r => setTimeout(r, 0));
    }

    setGeneratedFiles(files);
    setState('done');
  }, [rows, format]);

  const handleDownloadOne = useCallback((index, type) => {
    const f = generatedFiles[index];
    if (type === 'docx' && f.docxBlob) saveAs(f.docxBlob, f.docxFilename);
    if (type === 'pdf'  && f.pdfBlob)  saveAs(f.pdfBlob,  f.pdfFilename);
  }, [generatedFiles]);

  const handleDownloadAll = useCallback(async (type) => {
    setIsZipping(true);
    const zip = new JSZip();
    const folder = zip.folder('Appointment_Letters');
    generatedFiles.forEach(f => {
      if (type !== 'pdf'  && f.docxBlob) folder.file(f.docxFilename, f.docxBlob);
      if (type !== 'docx' && f.pdfBlob)  folder.file(f.pdfFilename,  f.pdfBlob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    saveAs(zipBlob, `Appointment_Letters_${type === 'both' ? 'All' : type.toUpperCase()}.zip`);
    setIsZipping(false);
  }, [generatedFiles]);

  const handleReset = useCallback(() => {
    setState('idle');
    setRows([]); setFilename(''); setWarnings([]);
    setParseError(''); setGenProgress(0); setGeneratedFiles([]);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>AL</div>
            <span className={styles.brandName}>Appointment Letter Generator</span>
            <span className={styles.brandSub}>NLC India Renewables Limited</span>
          </div>
          {state !== 'idle' && (
            <button className={styles.resetBtn} onClick={handleReset} aria-label="Start over">
              <RefreshCw size={14} /> Start Over
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <StepIndicator current={state} />

          {(state === 'idle' || state === 'parsing') && (
            <UploadZone onFileParsed={handleFile} isParsing={state === 'parsing'} error={parseError} />
          )}

          {(state === 'previewing' || state === 'generating') && (
            <>
              <DataPreview rows={rows} filename={filename} warnings={warnings} />
              <GeneratePanel
                total={rows.length}
                progress={genProgress}
                isGenerating={state === 'generating'}
                format={format}
                onFormatChange={setFormat}
                onGenerate={handleGenerate}
              />
            </>
          )}

          {state === 'done' && (
            <>
              <DataPreview rows={rows} filename={filename} warnings={warnings} />
              <LettersList
                files={generatedFiles}
                format={format}
                onDownloadOne={handleDownloadOne}
                onDownloadAll={handleDownloadAll}
                isZipping={isZipping}
              />
            </>
          )}

          {state === 'idle' && <HelpCard />}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>NLC India Renewables Limited — Appointment Letter Generator &nbsp;|&nbsp; Code on Wages, 2019 &amp; Code on Social Security, 2020</p>
      </footer>
    </div>
  );
}

const STEPS = ['Upload', 'Preview', 'Generate', 'Download'];
const STATE_ORDER = { idle: 0, parsing: 0, previewing: 1, generating: 2, done: 3 };

function StepIndicator({ current }) {
  const ci = STATE_ORDER[current] ?? 0;
  return (
    <div className={styles.steps}>
      {STEPS.map((label, i) => {
        const done = i < ci, active = i === ci;
        return (
          <React.Fragment key={label}>
            <div className={`${styles.step} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}>
              <div className={styles.stepCircle}>{done ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function HelpCard() {
  return (
    <div className={styles.helpCard}>
      <h3 className={styles.helpTitle}>How it works</h3>
      <ol className={styles.helpList}>
        <li><strong>Prepare your Excel file</strong> — Use the provided template with all required employee columns.</li>
        <li><strong>Upload the file</strong> — Drag &amp; drop or click to browse. Preview data before generating.</li>
        <li><strong>Choose format</strong> — Generate as DOCX, PDF, or both — all on the NIRL letterhead.</li>
        <li><strong>Download</strong> — Individual files or all together as a .zip archive.</li>
      </ol>
      <div className={styles.helpColumns}>
        <div>
          <p className={styles.helpColTitle}>Required Excel columns</p>
          <ul className={styles.helpColList}>
            <li>Name of employee</li><li>Date of birth</li>
            <li>Father's / Mother's name</li><li>Aadhaar number</li>
            <li>Labour Identification Number (LIN)</li><li>Universal Account Number (UAN) / ESIC</li>
            <li>Designation</li><li>Type of Employment</li>
          </ul>
        </div>
        <div>
          <p className={styles.helpColTitle}>&nbsp;</p>
          <ul className={styles.helpColList}>
            <li>Category of Skill</li><li>Date of Joining</li>
            <li>Basic Pay</li><li>Dearness Allowance</li>
            <li>Other Allowance</li><li>Applicability of social security benefits</li>
            <li>Broad nature of duties performed</li><li>Maternity Benefit / Any other info</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
