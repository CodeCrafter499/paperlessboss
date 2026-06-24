import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Play, Eye } from 'lucide-react';
import { profileApi, BASE_API, tokenStore } from '../utils/authApi';
import styles from './ProfileForms.module.css';

export default function LetterheadUpload({ active }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingPrereqs, setCheckingPrereqs] = useState(true);
  const [prereqError, setPrereqError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Versioning state
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedPreviewId, setSelectedPreviewId] = useState(null); // ID currently selected for preview
  const [activatingId, setActivatingId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pdfUrl) return;

    let isMounted = true;
    let script = document.getElementById('pdfjs-script');
    
    const renderPdf = (pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      
      pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
        if (!isMounted) return;
        pdf.getPage(1).then(page => {
          if (!isMounted) return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext('2d');
          
          const viewport = page.getViewport({ scale: 1.0 });
          // Target fixed dimensions matching the 750px height preview frame
          const containerWidth = 520;
          const containerHeight = 730;
          
          const scaleX = containerWidth / viewport.width;
          const scaleY = containerHeight / viewport.height;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledViewport = page.getViewport({ scale: scale * 1.5 }); // Render at 1.5x resolution for crispness
          
          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;
          
          // CSS scale fits the high-dpi canvas to the container (overridden by max-width/max-height for responsiveness)
          canvas.style.width = `${scaledViewport.width / 1.5}px`;
          canvas.style.height = `${scaledViewport.height / 1.5}px`;
          
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport
          };
          page.render(renderContext);
        });
      }).catch(err => {
        console.error('Error rendering PDF via pdf.js:', err);
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = 'pdfjs-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        if (isMounted) {
          const pdfjsLib = window['pdfjs-dist/build/pdf'];
          renderPdf(pdfjsLib);
        }
      };
      document.body.appendChild(script);
    } else {
      if (window['pdfjs-dist/build/pdf']) {
        renderPdf(window['pdfjs-dist/build/pdf']);
      } else {
        const oldOnload = script.onload;
        script.onload = () => {
          if (oldOnload) oldOnload();
          if (isMounted) {
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            renderPdf(pdfjsLib);
          }
        };
      }
    }

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Fetch list of letterhead versions
  const fetchVersions = useCallback(async (autoSelectActive = false) => {
    setLoadingVersions(true);
    try {
      const list = await profileApi.listLetterheads();
      setVersions(list || []);
      
      // Auto-select the active version for preview if requested or if none selected yet
      if (list && list.length > 0) {
        const activeVer = list.find(v => v.is_active);
        if (activeVer && (autoSelectActive || !selectedPreviewId)) {
          setSelectedPreviewId(activeVer.id);
        }
      }
    } catch (err) {
      console.error('Failed to load letterhead versions:', err);
    } finally {
      setLoadingVersions(false);
    }
  }, [selectedPreviewId]);

  // Fetch specific PDF blob and convert to Object URL
  const fetchPdf = useCallback(async (id) => {
    if (!id) {
      setPdfUrl('');
      return;
    }
    setLoadingPdf(true);
    try {
      const response = await fetch(`${BASE_API}/api/v1/profile/company/letterheads/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${tokenStore.get()}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } else {
        console.error('Failed to fetch letterhead PDF');
      }
    } catch (err) {
      console.error('Error fetching letterhead PDF:', err);
    } finally {
      setLoadingPdf(false);
    }
  }, []);

  // Verify prerequisites: user must have completed Company profile
  useEffect(() => {
    if (!active) return;

    async function checkProfiles() {
      try {
        await profileApi.getCompany();
        setPrereqError('');
        fetchVersions(true);
      } catch (err) {
        if (err.message && err.message.includes('not been filled')) {
          setPrereqError('You must set up your Company Profile first before uploading a letterhead.');
        } else {
          setPrereqError(err.message || 'Failed to verify profile prerequisites.');
        }
      } finally {
        setCheckingPrereqs(false);
      }
    }
    
    checkProfiles();
  }, [active]); // Only run on mount or active change

  // Fetch PDF whenever the selectedPreviewId changes
  useEffect(() => {
    if (active && !prereqError && !checkingPrereqs && selectedPreviewId) {
      fetchPdf(selectedPreviewId);
    }
  }, [selectedPreviewId, active, prereqError, checkingPrereqs, fetchPdf]);

  // Cleanup Object URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleUpload = async (file) => {
    if (!file) return;
    setStatus({ type: '', message: '' });

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus({ type: 'error', message: 'Invalid file format. Only PDF templates are accepted for letterheads.' });
      return;
    }

    setUploading(true);
    try {
      const newVer = await profileApi.uploadLetterhead(file);
      setStatus({ type: 'success', message: 'New letterhead version uploaded and activated successfully.' });
      if (newVer && newVer.id) {
        setSelectedPreviewId(newVer.id);
      }
      await fetchVersions(false);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to upload letterhead template.' });
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id) => {
    setActivatingId(id);
    setStatus({ type: '', message: '' });
    try {
      await profileApi.activateLetterhead(id);
      setStatus({ type: 'success', message: 'Letterhead version activated successfully.' });
      await fetchVersions(false);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to activate letterhead version.' });
    } finally {
      setActivatingId(null);
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

  const activeVersion = versions.find(v => v.is_active);
  const previewedVersion = versions.find(v => v.id === selectedPreviewId);

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', width: '100%' }}>
      {prereqError ? (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Company Letterhead Template</h2>
          </div>
          <div className={`${styles.statusMessage} ${styles.statusInfo}`} style={{ marginBottom: 0 }}>
            <AlertCircle size={16} />
            <span>{prereqError}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left panel: Upload and Versions */}
          <div className={styles.card} style={{ margin: 0, maxWidth: '100%' }}>
            <div className={styles.cardHeader}>
              <h2 className={styles.title}>Company Letterhead Template</h2>
              <p className={styles.subtitle}>
                Upload a PDF letterhead template. The backend will overlay appointment details on top of the active template when generating letters.
              </p>
            </div>

            {status.message && (
              <div className={`${styles.statusMessage} ${
                status.type === 'success' ? styles.statusSuccess : styles.statusError
              }`}>
                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{status.message}</span>
              </div>
            )}

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
                  {uploading ? 'Uploading letterhead…' : 'Upload New Letterhead PDF'}
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

            {/* Version History */}
            <div style={{ marginTop: '32px' }}>
              <h3 className={styles.title} style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Letterhead Version History</span>
                {loadingVersions && <Loader2 className={styles.loadingSpinner} style={{ width: 14, height: 14, borderTopColor: 'var(--color-primary)' }} />}
              </h3>
              
              {versions.length === 0 ? (
                <p className={styles.subtitle} style={{ fontStyle: 'italic', padding: '12px 0' }}>
                  No letterhead templates uploaded yet. Upload one above to begin.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {versions.map((ver) => {
                    const uploadDate = new Date(ver.created_at).toLocaleString();
                    const isPreviewed = ver.id === selectedPreviewId;
                    return (
                      <div
                        key={ver.id}
                        onClick={() => setSelectedPreviewId(ver.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: isPreviewed 
                            ? 'rgba(232, 65, 154, 0.08)' 
                            : ver.is_active 
                              ? 'rgba(232, 65, 154, 0.02)' 
                              : 'rgba(255,255,255,0.01)',
                          border: isPreviewed 
                            ? '1px solid var(--color-primary)' 
                            : ver.is_active 
                              ? '1px dashed var(--color-primary)' 
                              : '1px solid var(--color-gray-200)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Version {ver.version} 
                            {ver.is_active && (
                              <span style={{ fontSize: '9px', padding: '1px 6px', background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', fontWeight: 'bold' }}>
                                ACTIVE
                              </span>
                            )}
                            {isPreviewed && (
                              <span style={{ fontSize: '9px', padding: '1px 6px', background: '#2e7d4f', color: '#fff', borderRadius: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Eye size={10} /> VIEWING
                              </span>
                            )}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', wordBreak: 'break-all' }}>
                            {ver.filename}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--color-gray-400)' }}>
                            Uploaded: {uploadDate}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                          {!ver.is_active && (
                            <button
                              onClick={() => handleActivate(ver.id)}
                              disabled={activatingId !== null || uploading}
                              className={styles.btn}
                              style={{
                                padding: '6px 12px',
                                fontSize: '11px',
                                background: 'transparent',
                                border: '1px solid var(--color-primary)',
                                color: 'var(--color-primary)',
                                boxShadow: 'none'
                              }}
                            >
                              {activatingId === ver.id ? (
                                <Loader2 className={styles.loadingSpinner} style={{ borderTopColor: 'var(--color-primary)' }} />
                              ) : (
                                <>
                                  <Play size={10} style={{ marginRight: '2px' }} />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Live Preview */}
          <div className={styles.card} style={{ margin: 0, maxWidth: '100%', minHeight: '820px', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={16} className={styles.icon} />
                  <span>
                    {previewedVersion 
                      ? `Previewing Version ${previewedVersion.version}`
                      : 'Letterhead Preview'}
                  </span>
                </h2>
                <p className={styles.subtitle}>
                  {previewedVersion 
                    ? `${previewedVersion.filename} (${previewedVersion.is_active ? 'Currently Active' : 'Inactive Version'})`
                    : 'Showing local default/fallback letterhead template.'}
                </p>
              </div>

              {previewedVersion && !previewedVersion.is_active && (
                <button
                  onClick={() => handleActivate(previewedVersion.id)}
                  disabled={activatingId !== null || uploading}
                  className={styles.btn}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {activatingId === previewedVersion.id ? (
                    <Loader2 className={styles.loadingSpinner} />
                  ) : (
                    <>
                      <Play size={12} />
                      <span>Set Active</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '750px', background: '#1e1e1e', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-gray-200)' }}>
              {loadingPdf ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Loader2 className={styles.loadingSpinner} style={{ width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
                </div>
              ) : pdfUrl ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', padding: '10px', boxSizing: 'border-box' }}>
                  <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '4px', backgroundColor: '#fff' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-gray-400)' }}>
                  <span>No letterhead template selected for preview</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
