import React, { useState } from 'react';
import { FileSpreadsheet, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import styles from './DataPreview.module.css';

const PREVIEW_COLS = [
  { key: 'employeeName',   label: 'Employee Name' },
  { key: 'designation',    label: 'Designation' },
  { key: 'dateOfJoining',  label: 'Date of Joining' },
  { key: 'employmentType', label: 'Employment Type' },
  { key: 'basicPay',       label: 'Basic Pay' },
];

const MAX_VISIBLE = 5;

export default function DataPreview({ rows, filename, warnings }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, MAX_VISIBLE);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FileSpreadsheet size={18} className={styles.headerIcon} />
          <div>
            <p className={styles.filename}>{filename}</p>
            <p className={styles.rowCount}>
              {rows.length} employee record{rows.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <span className={styles.badge}>{rows.length} rows</span>
      </div>

      {warnings.length > 0 && (
        <div className={styles.warnings}>
          <AlertTriangle size={14} />
          <div>
            <strong>Warnings ({warnings.length}):</strong>
            <ul className={styles.warnList}>
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>#</th>
              {PREVIEW_COLS.map((c) => (
                <th key={c.key} className={styles.th}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} className={styles.row}>
                <td className={`${styles.td} ${styles.numCell}`}>{i + 1}</td>
                {PREVIEW_COLS.map((c) => (
                  <td key={c.key} className={styles.td}>
                    {row[c.key] || <span className={styles.empty}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > MAX_VISIBLE && (
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Show all {rows.length} rows
            </>
          )}
        </button>
      )}
    </div>
  );
}
