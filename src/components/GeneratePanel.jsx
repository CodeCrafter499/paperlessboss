import React from 'react';
import { FileText, Loader2, FileType, Server } from 'lucide-react';
import styles from './GeneratePanel.module.css';

const FORMAT_OPTIONS = [
  { value: 'both', label: 'DOCX + PDF', desc: 'Both formats' },
  { value: 'docx', label: 'DOCX only', desc: 'Word document' },
  { value: 'pdf',  label: 'PDF only',  desc: 'PDF document' },
];

export default function GeneratePanel({ 
  total, 
  progress, 
  isGenerating, 
  format, 
  onFormatChange, 
  onGenerate, 
  validationPassed,
  genMode = 'client',
  onGenModeChange
}) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className={`${styles.card} ${styles.cardCol}`}>
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
              : <p className={styles.sub}>
                  {genMode === 'server'
                    ? "Letters will be generated server-side on your uploaded company letterhead"
                    : "Each employee gets a separate letter generated in your browser using local templates"}
                </p>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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

          {onGenModeChange && (
            <div className={styles.formatRow} style={{ marginTop: '8px', borderTop: 'none', paddingTop: 0 }}>
              <span className={styles.formatLabel}><Server size={13} /> Generation Mode:</span>
              <div className={styles.formatGroup}>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${genMode === 'client' ? styles.formatActive : ''}`}
                  onClick={() => onGenModeChange('client')}
                >
                  Local (Client-Side)
                </button>
                <button
                  type="button"
                  className={`${styles.formatBtn} ${genMode === 'server' ? styles.formatActive : ''}`}
                  onClick={() => onGenModeChange('server')}
                >
                  Cloud (Server-Side)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

