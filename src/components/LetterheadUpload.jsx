import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { profileApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

export default function LetterheadUpload({ active }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingPrereqs, setCheckingPrereqs] = useState(true);
  const [prereqError, setPrereqError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Verify prerequisites: user must have completed both Company and Signatory profiles
  useEffect(() => {
    if (!active) return;
    
    // If already validated successfully, skip redundant API check
    if (!checkingPrereqs && !prereqError) return;

    async function checkProfiles() {
      try {
        await profileApi.getCompany();
        await profileApi.getSignatory();
        setPrereqError('');
      } catch (err) {
        if (err.message && (err.message.includes('not been filled') || err.message.includes('signatory details'))) {
          setPrereqError('You must set up both your Company Profile and Authorised Signatory details first before uploading a letterhead.');
        } else {
          setPrereqError(err.message || 'Failed to verify profile prerequisites.');
        }
      } finally {
        setCheckingPrereqs(false);
      }
    }
    
    checkProfiles();
  }, [active, checkingPrereqs, prereqError]);


  const handleUpload = async (file) => {
    if (!file) return;
    setStatus({ type: '', message: '' });

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus({ type: 'error', message: 'Invalid file format. Only PDF templates are accepted for letterheads.' });
      return;
    }

    setUploading(true);
    try {
      const res = await profileApi.uploadLetterhead(file);
      setStatus({ type: 'success', message: res.message || 'Letterhead template uploaded and configured successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to upload letterhead template.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (prereqError || uploading) return;
    setIsDragging(true);
  }, [prereqError, uploading]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (prereqError || uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [prereqError, uploading]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
    e.target.value = '';
  }, []);

  if (checkingPrereqs) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Loader2 className={styles.loadingSpinner} style={{ width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Company Letterhead Template</h2>
        <p className={styles.subtitle}>Upload a PDF letterhead template. The backend will superimpose appointment details on top of this template when generating server-side letters.</p>
      </div>

      {status.message && (
        <div className={`${styles.statusMessage} ${
          status.type === 'success' ? styles.statusSuccess : styles.statusError
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {prereqError ? (
        <div className={`${styles.statusMessage} ${styles.statusInfo}`}>
          <AlertCircle size={16} />
          <span>{prereqError}</span>
        </div>
      ) : (
        <div className={styles.uploadWrapper}>
          <div
            className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${uploading ? styles.loading : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload Letterhead PDF"
            onKeyDown={(e) => e.key === 'Enter' && !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className={styles.hiddenInput}
              aria-hidden="true"
              tabIndex={-1}
              disabled={uploading}
            />

            <div className={styles.iconWrap}>
              {uploading ? (
                <Loader2 className={styles.loadingSpinner} style={{ width: 32, height: 32, borderTopColor: 'var(--color-primary)' }} />
              ) : (
                <FileText size={36} strokeWidth={1.5} className={styles.icon} />
              )}
            </div>

            <h3 className={styles.title}>
              {uploading ? 'Uploading letterhead…' : 'Upload Letterhead PDF'}
            </h3>
            <p className={styles.subtitle} style={{ maxWidth: '400px', margin: '8px auto 0' }}>
              {uploading
                ? 'Processing and uploading your template to secure storage…'
                : 'Drag & drop your .pdf letterhead file here, or click to browse.'}
            </p>

            {!uploading && (
              <div className={styles.browseBtn}>
                <Upload size={14} />
                <span>Choose PDF File</span>
              </div>
            )}

            <p className={styles.hint}>Supports PDF formats only. Max size 5MB.</p>
          </div>
        </div>
      )}
    </div>
  );
}
