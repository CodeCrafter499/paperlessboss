import React, { useState } from 'react';
import { Archive, CheckCircle2, Briefcase, Calendar, Search, FileText, FileType2 } from 'lucide-react';
import styles from './LettersList.module.css';

export default function LettersList({ files, format, onDownloadOne, onDownloadAll, isZipping }) {
  const [search, setSearch] = useState('');

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.designation || '').toLowerCase().includes(search.toLowerCase())
  );

  const hasBoth = format === 'both';
  const hasDocx = format === 'docx' || format === 'both';
  const hasPdf  = format === 'pdf'  || format === 'both';

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <CheckCircle2 size={18} className={styles.successIcon} />
          <div>
            <h2 className={styles.title}>{files.length} Letter{files.length !== 1 ? 's' : ''} Generated</h2>
            <p className={styles.sub}>
              Format: <strong>{format === 'both' ? 'DOCX + PDF' : format.toUpperCase()}</strong> &nbsp;·&nbsp; Download individually or as a ZIP
            </p>
          </div>
        </div>
        <div className={styles.dlAllGroup}>
          {hasDocx && (
            <button className={`${styles.dlAllBtn} ${styles.docxBtn}`} onClick={() => onDownloadAll('docx')} disabled={isZipping}>
              <Archive size={14} /> {hasBoth ? 'DOCX ZIP' : 'Download All (.zip)'}
            </button>
          )}
          {hasPdf && (
            <button className={`${styles.dlAllBtn} ${styles.pdfBtn}`} onClick={() => onDownloadAll('pdf')} disabled={isZipping}>
              {isZipping ? <><div className={styles.miniSpinner} /> Zipping…</> : <><Archive size={14} /> {hasBoth ? 'PDF ZIP' : 'Download All (.zip)'}</>}
            </button>
          )}
          {hasBoth && (
            <button className={`${styles.dlAllBtn} ${styles.allBtn}`} onClick={() => onDownloadAll('both')} disabled={isZipping}>
              <Archive size={14} /> All ZIP
            </button>
          )}
        </div>
      </div>

      {files.length > 4 && (
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input type="text" className={styles.searchInput} placeholder="Search by name or designation…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      <ul className={styles.list}>
        {filtered.length === 0 && <li className={styles.noResults}>No results for "{search}"</li>}
        {filtered.map((file, i) => (
          <li key={i} className={styles.item}>
            <div className={styles.avatar}>{(file.name[0] || '?').toUpperCase()}</div>
            <div className={styles.info}>
              <p className={styles.name}>{file.name}</p>
              <div className={styles.meta}>
                {file.designation && <span className={styles.metaItem}><Briefcase size={11}/>{file.designation}</span>}
                {file.dateOfJoining && <span className={styles.metaItem}><Calendar size={11}/>{file.dateOfJoining}</span>}
              </div>
            </div>
            <div className={styles.dlBtns}>
              {hasDocx && (
                <button className={`${styles.dlBtn} ${styles.docxDl}`} onClick={() => onDownloadOne(i, 'docx')}>
                  <FileText size={13}/> DOCX
                </button>
              )}
              {hasPdf && (
                <button className={`${styles.dlBtn} ${styles.pdfDl}`} onClick={() => onDownloadOne(i, 'pdf')}>
                  <FileType2 size={13}/> PDF
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
