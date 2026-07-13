import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileSpreadsheet, Upload, Download, History, RefreshCw, 
  CheckCircle2, AlertTriangle, FileText, ArrowRight, Loader2,
  Plus, X
} from 'lucide-react';
import { wagesApi } from '../utils/authApi';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ExcelEditor from './ExcelEditor';
import UploadZone from './UploadZone';
import ValidationErrors from './ValidationErrors';
import { WAGE_COLUMN_MAP, parseWageExcelFile } from '../utils/excelParser';
import styles from '../App.module.css'; // Use the main App styles for exact visual parity!

const WAGE_COLS = [
  { key: 'employeeName',            label: 'Employee Name' },
  { key: 'fatherMotherSpouseName',  label: "Father/Mother/Spouse" },
  { key: 'designation',             label: 'Designation' },
  { key: 'uan',                     label: 'UAN' },
  { key: 'bankAccountNumber',       label: 'Bank Account' },
  { key: 'wageMonth',               label: 'Wage Month' },
  { key: 'wageYear',                label: 'Wage Year' },
  { key: 'rateBasic',               label: 'Basic Rate' },
  { key: 'rateDa',                  label: 'DA Rate' },
  { key: 'rateAllowances',          label: 'Allowances Rate' },
  { key: 'totalAttendance',         label: 'Attendance' },
  { key: 'overtimeWages',           label: 'Overtime Wages' },
  { key: 'grossWages',              label: 'Gross Wages' },
  { key: 'deductionPf',             label: 'PF Deduction' },
  { key: 'deductionEsi',            label: 'ESI Deduction' },
  { key: 'deductionOthers',         label: 'Other Deductions' },
  { key: 'netWages',                label: 'Net Wages' }
];

const STEPS = ['Upload', 'Validate', 'Preview', 'Generate', 'Download'];
const STATE_ORDER = { idle: 0, validating: 1, invalid: 1, previewing: 2, generating: 3, done: 4 };

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

export default function WagePanel() {
  const [state, setState] = useState('idle');
  const [rows, setRows] = useState([]);
  const [filename, setFilename] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [parseError, setParseError] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await wagesApi.getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFile = useCallback(async (file) => {
    setParseError('');
    setRows([]);
    setValidationResult(null);
    setFilename(file.name);
    setState('validating');

    try {
      const { rows: parsed } = await parseWageExcelFile(file);
      setRows(parsed);

      const result = await wagesApi.validateExcel(file);
      setValidationResult(result);

      if (!result.success) {
        setState('invalid');
        return;
      }
      setState('previewing');
    } catch (err) {
      setParseError(err.message || 'Validation failed. Please try again.');
      setState('idle');
    }
  }, []);

  const handleCreateBlank = useCallback(() => {
    setParseError('');
    setValidationResult(null);
    setFilename('New_Wage_List.xlsx');
    
    const blankRow = {
      _rowIndex: 2,
      employeeName: '',
      fatherMotherSpouseName: '',
      designation: '',
      uan: '',
      bankAccountNumber: '',
      wageMonth: '',
      wageYear: '',
      rateBasic: '',
      rateDa: '',
      rateAllowances: '',
      totalAttendance: '',
      overtimeWages: '',
      grossWages: '',
      deductionPf: '',
      deductionEsi: '',
      deductionOthers: '',
      netWages: ''
    };
    
    setRows([blankRow]);
    setState('previewing');
  }, []);

  const handleRevalidate = useCallback(async (updatedRows) => {
    setParseError('');
    setValidationResult(null);

    try {
      const reverseMap = {};
      for (const [excelCol, fieldKey] of Object.entries(WAGE_COLUMN_MAP)) {
        reverseMap[fieldKey] = excelCol;
      }

      const rawData = updatedRows.map(row => {
        const rawRow = {};
        for (const [fieldKey, val] of Object.entries(row)) {
          if (fieldKey === '_rowIndex') continue;
          const excelCol = reverseMap[fieldKey];
          if (excelCol) {
            rawRow[excelCol] = val;
          }
        }
        return rawRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(rawData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Wages');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const fileBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const file = new File([fileBlob], filename || 'edited_wages.xlsx', { type: fileBlob.type });

      const result = await wagesApi.validateExcel(file);
      setValidationResult(result);
      setRows(updatedRows);

      if (result.success) {
        setState('previewing');
      } else {
        setState('invalid');
      }
    } catch (err) {
      setParseError(err.message || 'Validation failed. Please try again.');
      setState('invalid');
    }
  }, [filename]);

  const handleGenerate = async () => {
    setState('generating');
    setIsGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      await fetchHistory();
      setProgress(100);
      setTimeout(() => {
        setState('done');
        setIsGenerating(false);
      }, 500);
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
      setState('previewing');
      setIsGenerating(false);
    } finally {
      clearInterval(interval);
    }
  };

  const handleReset = () => {
    setState('idle');
    setRows([]);
    setFilename('');
    setValidationResult(null);
    setParseError('');
  };

  const handleDownload = async (wageId, empName) => {
    try {
      const blob = await wagesApi.downloadPdf(wageId);
      saveAs(blob, `Wage_Slip_${empName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Step Indicators */}
      <StepIndicator current={state} />

      {state === 'idle' && (
        <>
          <div className={styles.selectionGrid}>
            <UploadZone
              onFileParsed={handleFile}
              isParsing={false}
              isValidating={false}
              error={parseError}
            />
            
            <div 
              className={styles.blankCard}
              onClick={handleCreateBlank}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBlank()}
            >
              <div className={styles.blankIconWrap}>
                <Plus size={28} />
              </div>
              <h3 className={styles.blankTitle}>Start with Blank Sheet</h3>
              <p className={styles.blankText}>
                Write and edit wage details from scratch directly in the web editor without uploading.
              </p>
              <button type="button" className={styles.blankAction}>
                <Plus size={14} />
                <span>Create Blank Sheet</span>
              </button>
            </div>
          </div>

          {/* Help Card / Columns description at bottom */}
          <div className={styles.helpCard}>
            <h3 className={styles.helpTitle}>How it works</h3>
            <ol className={styles.helpList}>
              <li><strong>Prepare your Excel file</strong> — Use the provided template with all required wage columns.</li>
              <li><strong>Upload the file</strong> — Drag &amp; drop or click to browse. Preview data before generating.</li>
              <li><strong>Generate Wage Slips</strong> — Creates compliance Form V Wage Slips for each record.</li>
              <li><strong>Download</strong> — Individual PDF files.</li>
            </ol>
            <div className={styles.helpColumns}>
              <div>
                <p className={styles.helpColTitle}>Required Excel columns</p>
                <ul className={styles.helpColList}>
                  <li>1. Name of employee</li>
                  <li>2. Father's/Mother's/Spouse Name</li>
                  <li>6a. Wage month</li>
                  <li>6b. Wage Year</li>
                  <li>7a. Rate of Basic</li>
                  <li>8. Total attendance</li>
                  <li>10. Gross wages payable</li>
                  <li>12. Net wages paid</li>
                </ul>
              </div>
              <div>
                <p className={styles.helpColTitle}>Optional / Deductions</p>
                <ul className={styles.helpColList}>
                  <li>3. Designation</li>
                  <li>4. UAN</li>
                  <li>5. Bank Account Number</li>
                  <li>7b. Rate of DA / Allowances</li>
                  <li>9. Overtime wages</li>
                  <li>11a. PF / ESI / Others</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {state === 'validating' && (
        <UploadZone
          onFileParsed={handleFile}
          isParsing={true}
          isValidating={true}
          error={parseError}
        />
      )}

      {state === 'invalid' && (
        <>
          {validationResult && (
            <ValidationErrors
              result={validationResult}
              filename={filename}
              onReupload={handleReset}
            />
          )}
          <ExcelEditor
            rows={rows}
            setRows={setRows}
            filename={filename}
            validationResult={validationResult}
            onRevalidate={handleRevalidate}
            columns={WAGE_COLS}
            columnMap={WAGE_COLUMN_MAP}
          />
        </>
      )}

      {state === 'previewing' && (
        <>
          {/* Generation Action Panel */}
          <div className={`${styles.card} ${styles.cardCol}`} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={20} className={styles.icon} />
              <div>
                <p className={styles.title} style={{ margin: 0, fontWeight: 600 }}>
                  Generate Form V Wage Slips ({rows.length} records ready)
                </p>
                <p className={styles.sub} style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  Wage Slips will be generated based on the spreadsheet records below.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleReset}
                className={styles.secondaryBtn || styles.btn}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e0',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                Start Over
              </button>
              <button 
                onClick={handleGenerate}
                style={{
                  padding: '8px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3182ce, #2b6cb0)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={16} /> Generate Wage Slips
              </button>
            </div>
          </div>

          <ExcelEditor
            rows={rows}
            setRows={setRows}
            filename={filename}
            validationResult={validationResult}
            onRevalidate={handleRevalidate}
            columns={WAGE_COLS}
            columnMap={WAGE_COLUMN_MAP}
          />
        </>
      )}

      {state === 'generating' && (
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <Loader2 size={40} className={styles.spin} style={{ margin: '0 auto 16px auto', color: '#3182ce' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Generating compliance PDFs...</h3>
          <div style={{ width: '300px', height: '6px', background: '#e2e8f0', borderRadius: '3px', margin: '0 auto 16px auto', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#3182ce', transition: 'width 0.2s' }} />
          </div>
          <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>Saving wage records and compiling PDFs.</p>
        </div>
      )}

      {state === 'done' && (
        <div style={{
          background: '#fff',
          padding: '45px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <CheckCircle2 size={48} color="#48bb78" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Wage Slips Generated Successfully!</h3>
          <p style={{ color: '#718096', fontSize: '15px', margin: '0 0 24px 0' }}>
            All wage slip documents are compiled and ready. You can find them in the log below.
          </p>
          <button 
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#3182ce',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Generate Another Sheet
          </button>
        </div>
      )}

      {/* Generated Wage Slips Log / History */}
      {state !== 'generating' && (
        <div style={{
          background: 'var(--color-bg-surface, #ffffff)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--color-border, #e2e8f0)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Generated Wage Slips Log</h3>
              <p style={{ color: '#718096', fontSize: '14px', margin: '4px 0 0 0' }}>Download individual PDFs for compliance and distribution.</p>
            </div>
            <button 
              onClick={fetchHistory}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px'
              }}
            >
              <RefreshCw size={13} className={loadingHistory ? styles.spin : ''} /> Refresh List
            </button>
          </div>

          {loadingHistory && history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a0aec0' }}>Loading history...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a0aec0', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
              No wage slips generated yet. Upload an Excel file to get started!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #edf2f7', color: '#4a5568', fontWeight: 600 }}>
                    <th style={{ padding: '12px 8px' }}>Employee Name</th>
                    <th style={{ padding: '12px 8px' }}>Designation</th>
                    <th style={{ padding: '12px 8px' }}>UAN</th>
                    <th style={{ padding: '12px 8px' }}>Period</th>
                    <th style={{ padding: '12px 8px' }}>Net Paid</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((slip) => (
                    <tr key={slip.id} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>{slip.employee_name}</td>
                      <td style={{ padding: '12px 8px', color: '#718096' }}>{slip.designation || '—'}</td>
                      <td style={{ padding: '12px 8px', color: '#718096' }}>{slip.uan || '—'}</td>
                      <td style={{ padding: '12px 8px', color: '#718096' }}>{slip.wage_month} {slip.wage_year}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: '#2b6cb0' }}>₹{(slip.net_wages || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDownload(slip.id, slip.employee_name)}
                          style={{
                            background: 'linear-gradient(135deg, #48bb78, #38a169)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={12} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
