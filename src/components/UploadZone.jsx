import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import styles from './UploadZone.module.css';

export default function UploadZone({ onFileParsed, isParsing, isValidating, error }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileParsed(file);
    },
    [onFileParsed]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) onFileParsed(file);
      e.target.value = '';
    },
    [onFileParsed]
  );

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.zone} ${isDragging ? styles.dragging : ''} ${(isParsing || isValidating) ? styles.loading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload Excel file"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.iconWrap}>
          {isParsing ? (
            <div className={styles.spinner} aria-label="Parsing file" />
          ) : (
            <FileSpreadsheet size={40} strokeWidth={1.5} className={styles.icon} />
          )}
        </div>

        <h3 className={styles.title}>
          {isValidating ? 'Validating your file…' : isParsing ? 'Reading your file…' : 'Upload Excel File'}
        </h3>
        <p className={styles.subtitle}>
          {isValidating
            ? 'Checking employee records against statutory requirements…'
            : isParsing
              ? 'Please wait while we parse the employee data'
              : 'Drag & drop your .xlsx file here, or click to browse'}
        </p>

        {!isParsing && !isValidating && (
          <div className={styles.browseBtn}>
            <Upload size={14} />
            <span>Choose File</span>
          </div>
        )}

        <p className={styles.hint}>Supports .xlsx and .xls formats</p>
      </div>

      {error && (
        <div className={styles.errorBox} role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
