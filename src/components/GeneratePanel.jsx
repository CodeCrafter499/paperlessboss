import React from 'react';
import { FileText, Loader2, FileType, ShieldCheck } from 'lucide-react';
import styles from './GeneratePanel.module.css';

const FORMAT_OPTIONS = [
  { value: 'both', label: 'DOCX + PDF', desc: 'Both formats' },
  { value: 'docx', label: 'DOCX only', desc: 'Word document' },
  { value: 'pdf',  label: 'PDF only',  desc: 'PDF document' },
];

export default function GeneratePanel({ total, progress, isGenerating, format, onFormatChange, onGenerate, validationPassed }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.left}>
          <FileText size={20} className={styles.icon} />
          <div>
            <p className={styles.title}>
              {isGenerating
                ? `Generating letters… (${progress} / ${total})`
                : `Generate ${total} appointment letter${total !== 1 ? 's' : ''}`}
            </p>
            {isGenerating
              ? <div className={styles.progressWrap} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className={styles.progressBar} style={{ width: `${pct}%` }} />
                </div>
              : <p className={styles.sub}>Each employee gets a separate letter on the Company's or Vendor's letterhead</p>
            }
          </div>
        </div>

        <button className={styles.btn} onClick={onGenerate} disabled={isGenerating}>
          {isGenerating
            ? <><Loader2 size={16} className={styles.spin} /> Generating…</>
            : <><FileText size={16} /> Generate Letters</>
          }
        </button>
      </div>

      {!isGenerating && (
        <div className={styles.formatRow}>
          <span className={styles.formatLabel}><FileType size={13} /> Output format:</span>
          <div className={styles.formatGroup}>
            {FORMAT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`${styles.formatBtn} ${format === opt.value ? styles.formatActive : ''}`}
                onClick={() => onFormatChange(opt.value)}
                aria-pressed={format === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
