import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  FileSpreadsheet, 
  Users, 
  FileText, 
  Clock, 
  Download, 
  RefreshCw, 
  HelpCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Archive,
  Copy,
  Check,
  Layers,
  FileCheck,
  Briefcase
} from 'lucide-react';
import JSZip from 'jszip';
import { offerLetterApi, wagesApi, profileApi } from '../utils/authApi';
import { saveAs } from 'file-saver';
import styles from './GenerationHistory.module.css';

// Helper to format date & time into combination filename (PAN + Timestamp)
function generateBatchFileName(pan, timestampStr, type) {
  const panStr = (pan || 'COMPANY').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const dateObj = new Date(timestampStr);
  const pad = (n) => String(n).padStart(2, '0');
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());
  const hours = pad(dateObj.getHours());
  const mins = pad(dateObj.getMinutes());
  const secs = pad(dateObj.getSeconds());
  const dateFormatted = `${year}${month}${day}_${hours}${mins}${secs}`;
  
  if (type === 'offer_letter') {
    return `${panStr}_${dateFormatted}_Appointment_Letters.zip`;
  } else {
    return `${panStr}_${dateFormatted}_Wage_Slips.zip`;
  }
}

// Group sequential logs generated within a batch window (within 90s)
function groupLogsIntoBatches(logs, type, companyPan) {
  if (!logs || logs.length === 0) return [];
  
  // Sort descending by timestamp
  const sorted = [...logs].sort((a, b) => {
    const dateA = new Date(type === 'offer_letter' ? a.generated_at : a.created_at);
    const dateB = new Date(type === 'offer_letter' ? b.generated_at : b.created_at);
    return dateB - dateA;
  });

  const batches = [];
  let currentBatch = null;

  for (const log of sorted) {
    const dateStr = type === 'offer_letter' ? log.generated_at : log.created_at;
    const logTime = new Date(dateStr).getTime();

    if (!currentBatch || Math.abs(currentBatch.timestamp - logTime) > 90 * 1000) {
      const pan = log.company_pan || companyPan || 'COMPANY';
      const fileName = generateBatchFileName(pan, dateStr, type);
      currentBatch = {
        id: `batch_${type}_${log.id || logTime}_${batches.length}`,
        type,
        typeName: type === 'offer_letter' ? 'Appointment Letters' : 'Wage Slips (Form V)',
        timestamp: logTime,
        dateStr: dateStr,
        pan,
        fileName,
        records: [log]
      };
      batches.push(currentBatch);
    } else {
      currentBatch.records.push(log);
    }
  }

  return batches;
}

function GenerationHistory({ active, hasDocxAddon = false }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'offer_letter', 'wage_slip'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyData, setHistoryData] = useState({ unique_employees_count: 0, logs: [] });
  const [wageLogs, setWageLogs] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBatches, setExpandedBatches] = useState(new Set());
  const [zippingBatchId, setZippingBatchId] = useState(null);
  const [copiedFileName, setCopiedFileName] = useState(null);
  const [batchSearchMap, setBatchSearchMap] = useState({});

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [offerRes, wageRes, compRes] = await Promise.all([
        offerLetterApi.getGenerationHistory().catch(e => { console.error(e); return { unique_employees_count: 0, logs: [] }; }),
        wagesApi.getHistory().catch(e => { console.error(e); return []; }),
        profileApi.getCompany().catch(() => null)
      ]);

      setHistoryData(offerRes || { unique_employees_count: 0, logs: [] });
      setWageLogs(wageRes || []);
      if (compRes) setCompanyProfile(compRes);
    } catch (err) {
      console.error('Failed to fetch generation history:', err);
      setError(err.message || 'Failed to load generation history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      fetchHistory();
    }
  }, [active, fetchHistory]);

  const companyPan = companyProfile?.pan || historyData.company_pan || '';

  // Group raw logs into batches
  const offerBatches = useMemo(() => {
    return groupLogsIntoBatches(historyData.logs || [], 'offer_letter', companyPan);
  }, [historyData.logs, companyPan]);

  const wageBatches = useMemo(() => {
    return groupLogsIntoBatches(wageLogs || [], 'wage_slip', companyPan);
  }, [wageLogs, companyPan]);

  // Combine and sort all batches
  const allBatches = useMemo(() => {
    const combined = [...offerBatches, ...wageBatches];
    combined.sort((a, b) => b.timestamp - a.timestamp);
    return combined;
  }, [offerBatches, wageBatches]);

  // Filter batches based on type and global search query
  const filteredBatches = useMemo(() => {
    let list = allBatches;
    if (filterType !== 'all') {
      list = list.filter(b => b.type === filterType);
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(batch => {
      // Check batch attributes
      if (batch.fileName.toLowerCase().includes(q)) return true;
      if (batch.typeName.toLowerCase().includes(q)) return true;
      if (batch.pan.toLowerCase().includes(q)) return true;

      // Check date format
      const dateStr = formatDateTime(batch.dateStr).toLowerCase();
      if (dateStr.includes(q)) return true;

      // Check inner employee records
      return batch.records.some(r => {
        const name = (r.employee_name || '').toLowerCase();
        const uan = (r.uan_number || r.uan || '').toLowerCase();
        const desig = (r.designation || '').toLowerCase();
        const lin = (r.lin_number || '').toLowerCase();
        return name.includes(q) || uan.includes(q) || desig.includes(q) || lin.includes(q);
      });
    });
  }, [allBatches, filterType, searchQuery]);

  // Toggle single batch expansion
  const toggleBatch = (batchId) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedBatches(new Set(filteredBatches.map(b => b.id)));
  };

  const collapseAll = () => {
    setExpandedBatches(new Set());
  };

  // Copy filename to clipboard
  const handleCopyFileName = (fileName, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fileName);
    setCopiedFileName(fileName);
    setTimeout(() => setCopiedFileName(null), 2000);
  };

  // Download entire batch as a ZIP
  const handleDownloadBatchZip = async (batch, e) => {
    if (e) e.stopPropagation();
    setZippingBatchId(batch.id);

    try {
      if (batch.type === 'offer_letter') {
        const empIds = batch.records.map(r => r.employee_id).filter(Boolean);
        const format = hasDocxAddon ? 'both' : 'pdf';
        const blob = await offerLetterApi.downloadZip(format, empIds.length > 0 ? empIds : null);
        saveAs(blob, batch.fileName);
      } else {
        const wageIds = batch.records.map(r => r.id).filter(Boolean);
        const blob = await wagesApi.downloadZip(wageIds.length > 0 ? wageIds : null);
        saveAs(blob, batch.fileName);
      }
      setTimeout(() => fetchHistory(), 800);
    } catch (err) {
      alert(`Batch ZIP download failed: ${err.message}`);
    } finally {
      setZippingBatchId(null);
    }
  };

  // Individual record download handlers
  const handleDownloadSingleOffer = async (employeeId, format, empName, e) => {
    if (e) e.stopPropagation();
    try {
      const blob = await offerLetterApi.downloadFile(employeeId, format);
      const safeName = (empName || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
      saveAs(blob, `Appointment_${format.toUpperCase()}_${safeName}.${format}`);
      setTimeout(() => fetchHistory(), 800);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const handleDownloadSingleWage = async (wageId, empName, e) => {
    if (e) e.stopPropagation();
    try {
      const blob = await wagesApi.downloadPdf(wageId);
      const safeName = (empName || 'Employee').replace(/[^a-zA-Z0-9_-]/g, '_');
      saveAs(blob, `Wage_Slip_${safeName}.pdf`);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '—';
    try {
      const d = new Date(dateTimeStr);
      return d.toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateTimeStr;
    }
  }

  const totalLettersGenerated = (historyData.logs?.length || 0) + wageLogs.length;

  return (
    <div className={styles.wrapper}>
      
      {/* ── Top statistics summary row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.pinkIcon}`}>
            <Layers size={22} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Upload Batches</div>
            <div className={styles.statValue}>{allBatches.length}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blueIcon}`}>
            <FileSpreadsheet size={22} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Documents Generated</div>
            <div className={styles.statValue}>{totalLettersGenerated}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.plumIcon}`}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Unique Employees (by UAN)</div>
            <div className={styles.statValue}>{historyData.unique_employees_count || 0}</div>
          </div>
        </div>
      </div>

      {/* ── Type Filter Tabs & Search Controls ── */}
      <div className={styles.controlSection}>
        <div className={styles.tabSelector}>
          <button
            onClick={() => setFilterType('all')}
            className={`${styles.tabBtn} ${filterType === 'all' ? styles.tabActive : ''}`}
          >
            All Uploads ({allBatches.length})
          </button>
          <button
            onClick={() => setFilterType('offer_letter')}
            className={`${styles.tabBtn} ${filterType === 'offer_letter' ? styles.tabActive : ''}`}
          >
            Appointment Letters ({offerBatches.length})
          </button>
          <button
            onClick={() => setFilterType('wage_slip')}
            className={`${styles.tabBtn} ${filterType === 'wage_slip' ? styles.tabActive : ''}`}
          >
            Wage Slips (Form V) ({wageBatches.length})
          </button>
        </div>

        <div className={styles.actionHeader}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by file name (PAN/date), employee name, UAN, or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className={styles.headerButtons}>
            {filteredBatches.length > 0 && (
              <div className={styles.expandToggleGroup}>
                <button className={styles.textBtn} onClick={expandAll}>Expand All</button>
                <span className={styles.divider}>|</span>
                <button className={styles.textBtn} onClick={collapseAll}>Collapse All</button>
              </div>
            )}
            <button 
              onClick={fetchHistory} 
              disabled={loading} 
              className={styles.refreshBtn}
              title="Refresh generation history"
            >
              <RefreshCw size={14} className={loading ? styles.spinning : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Upload Batches List ── */}
      <div className={styles.batchesContainer}>
        {loading && allBatches.length === 0 ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading generation upload history...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertCircle size={24} className={styles.errorIcon} />
            <p>{error}</p>
            <button onClick={fetchHistory} className={styles.retryBtn}>Retry</button>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className={styles.emptyState}>
            <HelpCircle size={36} className={styles.emptyIcon} />
            <h3>No Upload Records Found</h3>
            <p>
              {searchQuery 
                ? `No generation uploads matching "${searchQuery}" found.`
                : filterType === 'offer_letter'
                  ? 'No appointment letter batches generated yet.'
                  : filterType === 'wage_slip'
                    ? 'No wage slip batches generated yet.'
                    : 'No documents have been generated yet. Upload an Excel sheet to start.'}
            </p>
          </div>
        ) : (
          <div className={styles.batchList}>
            {filteredBatches.map((batch, bIdx) => {
              const isExpanded = expandedBatches.has(batch.id);
              const isOfferLetter = batch.type === 'offer_letter';
              const isZippingThis = zippingBatchId === batch.id;
              const innerSearch = (batchSearchMap[batch.id] || '').toLowerCase().trim();

              // Filter inner records if inner search is active
              const displayedRecords = innerSearch 
                ? batch.records.filter(r => {
                    const name = (r.employee_name || '').toLowerCase();
                    const uan = (r.uan_number || r.uan || '').toLowerCase();
                    const desig = (r.designation || '').toLowerCase();
                    return name.includes(innerSearch) || uan.includes(innerSearch) || desig.includes(innerSearch);
                  })
                : batch.records;

              const downloadedCount = batch.records.filter(r => r.downloaded).length;

              return (
                <div key={batch.id} className={`${styles.batchCard} ${isExpanded ? styles.batchCardExpanded : ''}`}>
                  {/* ── Batch Header Row ── */}
                  <div className={styles.batchHeader} onClick={() => toggleBatch(batch.id)}>
                    <div className={styles.batchLeftInfo}>
                      <button 
                        type="button"
                        className={styles.chevronBtn}
                        aria-label={isExpanded ? 'Collapse batch details' : 'Expand batch details'}
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      <div className={styles.batchTitleBlock}>
                        <div className={styles.fileNameRow}>
                          <span className={styles.fileIconWrap}>
                            <Archive size={16} />
                          </span>
                          <span className={styles.batchFileName} title={batch.fileName}>
                            {batch.fileName}
                          </span>
                          <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={(e) => handleCopyFileName(batch.fileName, e)}
                            title="Copy file name"
                          >
                            {copiedFileName === batch.fileName ? <Check size={12} className={styles.copySuccess} /> : <Copy size={12} />}
                          </button>
                        </div>

                        <div className={styles.batchMetaRow}>
                          <div className={styles.metaChip}>
                            <Clock size={12} className={styles.chipIcon} />
                            <span>{formatDateTime(batch.dateStr)}</span>
                          </div>

                          <span className={`${styles.typeBadge} ${isOfferLetter ? styles.typeOffer : styles.typeWage}`}>
                            {isOfferLetter ? 'Appointment Letters' : 'Wage Slips (Form V)'}
                          </span>

                          <div className={styles.countBadge}>
                            <Users size={12} />
                            <span><strong>{batch.records.length}</strong> {batch.records.length === 1 ? 'Employee' : 'Employees'}</span>
                          </div>

                          {isOfferLetter && (
                            <span className={`${styles.downloadStatusChip} ${downloadedCount === batch.records.length ? styles.statusAllDone : styles.statusPartial}`}>
                              <FileCheck size={12} />
                              {downloadedCount === batch.records.length ? 'All Downloaded' : `${downloadedCount} / ${batch.records.length} Downloaded`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Batch Right Action Buttons ── */}
                    <div className={styles.batchActions} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={styles.viewDetailsBtn}
                        onClick={() => toggleBatch(batch.id)}
                      >
                        {isExpanded ? 'Hide Details' : 'View Employees'}
                      </button>

                      <button
                        type="button"
                        className={styles.downloadZipBtn}
                        onClick={(e) => handleDownloadBatchZip(batch, e)}
                        disabled={isZippingThis}
                        title={`Download all ${batch.records.length} files as ZIP`}
                      >
                        {isZippingThis ? (
                          <>
                            <div className={styles.miniSpinner} />
                            <span>Zipping…</span>
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            <span>Download ZIP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded Employee Table Drawer ── */}
                  {isExpanded && (
                    <div className={styles.batchDrawer}>
                      <div className={styles.drawerHeader}>
                        <div className={styles.drawerSearchBox}>
                          <Search size={14} className={styles.searchIcon} />
                          <input 
                            type="text" 
                            placeholder={`Filter ${batch.records.length} employees in this upload...`}
                            value={batchSearchMap[batch.id] || ''}
                            onChange={(e) => setBatchSearchMap({ ...batchSearchMap, [batch.id]: e.target.value })}
                            className={styles.drawerSearchInput}
                          />
                          {batchSearchMap[batch.id] && (
                            <button 
                              className={styles.clearSearchBtn}
                              onClick={() => setBatchSearchMap({ ...batchSearchMap, [batch.id]: '' })}
                            >✕</button>
                          )}
                        </div>
                        <span className={styles.drawerRecordCount}>
                          Showing {displayedRecords.length} of {batch.records.length} employees
                        </span>
                      </div>

                      <div className={styles.tableResponsive}>
                        <table className={styles.innerTable}>
                          <thead>
                            <tr>
                              <th>Employee Name</th>
                              <th>UAN / Identifier</th>
                              <th>Designation</th>
                              {isOfferLetter ? (
                                <>
                                  <th>Date of Joining</th>
                                  <th>Format</th>
                                  <th>Status</th>
                                </>
                              ) : (
                                <>
                                  <th>Wage Period</th>
                                  <th>Net Wages</th>
                                </>
                              )}
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedRecords.length === 0 ? (
                              <tr>
                                <td colSpan={isOfferLetter ? 7 : 6} className={styles.noInnerRecords}>
                                  No employees matching filter "{batchSearchMap[batch.id]}"
                                </td>
                              </tr>
                            ) : isOfferLetter ? (
                              displayedRecords.map((log) => {
                                const initials = log.employee_name
                                  ? log.employee_name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                  : 'EE';

                                return (
                                  <tr key={log.id} className={styles.innerTr}>
                                    <td>
                                      <div className={styles.empCol}>
                                        <div className={styles.avatar}>{initials}</div>
                                        <span className={styles.empName}>{log.employee_name}</span>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={styles.linBadge}>{log.uan_number || log.lin_number || '—'}</span>
                                    </td>
                                    <td>{log.designation || '—'}</td>
                                    <td>
                                      <div className={styles.dateCell}>
                                        <Calendar size={12} className={styles.cellIcon} />
                                        <span>{formatDate(log.date_of_joining)}</span>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`${styles.formatBadge} ${styles[log.format]}`}>
                                        {(log.format || 'BOTH').toUpperCase()}
                                      </span>
                                    </td>
                                    <td>
                                      {log.downloaded ? (
                                        <span className={`${styles.statusBadge} ${styles.downloaded}`}>
                                          Downloaded
                                        </span>
                                      ) : (
                                        <span className={`${styles.statusBadge} ${styles.pending}`}>
                                          Pending
                                        </span>
                                      )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      {log.employee_id ? (
                                        <div className={styles.actionGroup}>
                                          {(log.format === 'pdf' || log.format === 'both') && (
                                            <button 
                                              type="button"
                                              onClick={(e) => handleDownloadSingleOffer(log.employee_id, 'pdf', log.employee_name, e)}
                                              className={`${styles.actionDlBtn} ${styles.pdfAction}`}
                                              title="Download Appointment Letter PDF"
                                            >
                                              <FileText size={12} />
                                              <span>PDF</span>
                                            </button>
                                          )}
                                          {(log.format === 'docx' || log.format === 'both') && hasDocxAddon && (
                                            <button 
                                              type="button"
                                              onClick={(e) => handleDownloadSingleOffer(log.employee_id, 'docx', log.employee_name, e)}
                                              className={`${styles.actionDlBtn} ${styles.docxAction}`}
                                              title="Download Appointment Letter DOCX"
                                            >
                                              <Download size={12} />
                                              <span>DOCX</span>
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <span className={styles.localOnly}>Generated</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              displayedRecords.map((log) => {
                                const initials = log.employee_name
                                  ? log.employee_name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                  : 'EE';

                                return (
                                  <tr key={log.id} className={styles.innerTr}>
                                    <td>
                                      <div className={styles.empCol}>
                                        <div className={styles.avatar} style={{ background: '#ebeeef', color: '#2b6cb0' }}>{initials}</div>
                                        <span className={styles.empName}>{log.employee_name}</span>
                                      </div>
                                    </td>
                                    <td>
                                      <span className={styles.linBadge}>{log.uan || log.bank_account_number || '—'}</span>
                                    </td>
                                    <td>{log.designation || '—'}</td>
                                    <td>{log.wage_month} {log.wage_year}</td>
                                    <td>
                                      <strong style={{ color: '#10b981' }}>₹{(log.net_wages || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <button 
                                        type="button"
                                        onClick={(e) => handleDownloadSingleWage(log.id, log.employee_name, e)}
                                        className={`${styles.actionDlBtn} ${styles.pdfAction}`}
                                        title="Download Wage Slip PDF"
                                      >
                                        <Download size={12} />
                                        <span>PDF</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(GenerationHistory);
