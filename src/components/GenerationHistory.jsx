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
  Coins, 
  ChevronDown, 
  ChevronUp, 
  FolderArchive, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { offerLetterApi, wagesApi } from '../utils/authApi';
import { saveAs } from 'file-saver';
import styles from './GenerationHistory.module.css';

function GenerationHistory({ active }) {
  const [historyType, setHistoryType] = useState('offer_letter'); // 'offer_letter' or 'wage_slip'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyData, setHistoryData] = useState({ unique_employees_count: 0, logs: [] });
  const [wageLogs, setWageLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track open accordion batches
  const [expandedBatches, setExpandedBatches] = useState({});
  // Track ZIP download in progress
  const [downloadingZip, setDownloadingZip] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (historyType === 'offer_letter') {
        const data = await offerLetterApi.getGenerationHistory();
        setHistoryData(data || { unique_employees_count: 0, logs: [] });
      } else {
        const data = await wagesApi.getHistory();
        setWageLogs(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch generation history:', err);
      setError(err.message || 'Failed to load generation history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [historyType]);

  useEffect(() => {
    if (active) {
      fetchHistory();
    }
  }, [active, fetchHistory]);

  // Individual file redownload
  const handleDownloadFile = async (employeeId, format) => {
    try {
      const blob = await offerLetterApi.downloadFile(employeeId, format);
      const filename = `Appointment_${format === 'pdf' ? 'Letter' : 'Template'}_${employeeId}.${format}`;
      saveAs(blob, filename);
      setTimeout(() => {
        fetchHistory();
      }, 800);
    } catch (err) {
      alert(`Redownload failed: ${err.message}`);
    }
  };

  const handleDownloadWage = async (wageId, empName) => {
    try {
      const blob = await wagesApi.downloadPdf(wageId);
      saveAs(blob, `Wage_Slip_${empName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  // Group offer letter logs into generation batches (clustered within 10-minute intervals)
  const offerBatches = useMemo(() => {
    const logs = historyData.logs || [];
    if (logs.length === 0) return [];

    const sorted = [...logs].sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
    const batches = [];
    let currentBatch = null;

    for (const log of sorted) {
      const logTime = new Date(log.generated_at).getTime();
      if (!currentBatch) {
        currentBatch = {
          id: `batch-${logTime}`,
          timestamp: log.generated_at,
          logs: [log]
        };
      } else {
        const firstTime = new Date(currentBatch.timestamp).getTime();
        if (Math.abs(firstTime - logTime) <= 10 * 60 * 1000) {
          currentBatch.logs.push(log);
        } else {
          batches.push(currentBatch);
          currentBatch = {
            id: `batch-${logTime}`,
            timestamp: log.generated_at,
            logs: [log]
          };
        }
      }
    }
    if (currentBatch) {
      batches.push(currentBatch);
    }

    const total = batches.length;
    return batches.map((batch, index) => {
      const employeeIds = Array.from(new Set(batch.logs.map(l => l.employee_id).filter(Boolean)));
      const downloadedCount = batch.logs.filter(l => l.downloaded).length;
      const formats = Array.from(new Set(batch.logs.map(l => l.format)));
      return {
        ...batch,
        batchNumber: total - index,
        isLatest: index === 0,
        employeeIds,
        totalCount: batch.logs.length,
        downloadedCount,
        formats
      };
    });
  }, [historyData.logs]);

  // Group wage slips by period (month & year)
  const wageBatches = useMemo(() => {
    if (!wageLogs || wageLogs.length === 0) return [];

    const map = new Map();
    for (const log of wageLogs) {
      const month = log.wage_month || 'General';
      const year = log.wage_year || '';
      const key = `${month} ${year}`.trim();
      if (!map.has(key)) {
        map.set(key, {
          id: `wage-batch-${key.replace(/\s+/g, '_')}`,
          period: key,
          wage_month: log.wage_month,
          wage_year: log.wage_year,
          logs: [],
          totalNetWages: 0,
          latestDate: log.created_at
        });
      }
      const group = map.get(key);
      group.logs.push(log);
      group.totalNetWages += (log.net_wages || 0);
      if (new Date(log.created_at).getTime() > new Date(group.latestDate).getTime()) {
        group.latestDate = log.created_at;
      }
    }

    const sortedGroups = Array.from(map.values()).sort(
      (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
    );

    return sortedGroups.map((group, index) => ({
      ...group,
      isLatest: index === 0
    }));
  }, [wageLogs]);

  // Expand latest batch by default on initial load
  useEffect(() => {
    if (historyType === 'offer_letter' && offerBatches.length > 0 && Object.keys(expandedBatches).length === 0) {
      setExpandedBatches({ [offerBatches[0].id]: true });
    } else if (historyType === 'wage_slip' && wageBatches.length > 0 && Object.keys(expandedBatches).length === 0) {
      setExpandedBatches({ [wageBatches[0].id]: true });
    }
  }, [historyType, offerBatches, wageBatches]);

  // Auto-expand all batches if user is searching
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const allOpen = {};
      if (historyType === 'offer_letter') {
        offerBatches.forEach(b => { allOpen[b.id] = true; });
      } else {
        wageBatches.forEach(b => { allOpen[b.id] = true; });
      }
      setExpandedBatches(allOpen);
    }
  }, [searchQuery, historyType, offerBatches, wageBatches]);

  const toggleBatch = (batchId) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchId]: !prev[batchId]
    }));
  };

  const toggleAllBatches = (expand) => {
    const nextState = {};
    const targetList = historyType === 'offer_letter' ? offerBatches : wageBatches;
    targetList.forEach(b => { nextState[b.id] = expand; });
    setExpandedBatches(nextState);
  };

  // Backend ZIP download handlers
  const handleDownloadOfferZip = async (format, batch = null) => {
    const downloadKey = batch ? `batch-${batch.id}-${format}` : `latest-${format}`;
    setDownloadingZip(downloadKey);
    try {
      const empIds = batch ? batch.employeeIds : null;
      const blob = await offerLetterApi.downloadZip(format, empIds);
      const dateTag = new Date().toISOString().slice(0, 10);
      const batchTag = batch ? `_Batch${batch.batchNumber}` : '_All';
      const filename = `Appointment_Letters${batchTag}_${format.toUpperCase()}_${dateTag}.zip`;
      saveAs(blob, filename);
      setTimeout(() => {
        fetchHistory();
      }, 1200);
    } catch (err) {
      console.error('Download ZIP failed:', err);
      alert(`Failed to download ZIP: ${err.message || 'Server error'}`);
    } finally {
      setDownloadingZip(null);
    }
  };

  const handleDownloadWageZip = async (batch = null) => {
    const downloadKey = batch ? `wage-${batch.id}` : 'wage-all';
    setDownloadingZip(downloadKey);
    try {
      const month = batch ? batch.wage_month : null;
      const year = batch ? batch.wage_year : null;
      const blob = await wagesApi.downloadZip(month, year);
      const periodTag = batch ? `_${batch.period.replace(/\s+/g, '_')}` : '_All';
      const filename = `Wage_Slips${periodTag}.zip`;
      saveAs(blob, filename);
    } catch (err) {
      console.error('Download Wages ZIP failed:', err);
      alert(`Failed to download Wage Slips ZIP: ${err.message || 'Server error'}`);
    } finally {
      setDownloadingZip(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateTime = (dateTimeStr) => {
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
  };

  const totalWagesDisbursed = wageLogs.reduce((acc, curr) => acc + (curr.net_wages || 0), 0);

  const allBatchesCollapsed = useMemo(() => {
    const list = historyType === 'offer_letter' ? offerBatches : wageBatches;
    if (list.length === 0) return true;
    return list.every(b => !expandedBatches[b.id]);
  }, [expandedBatches, historyType, offerBatches, wageBatches]);

  return (
    <div className={styles.wrapper}>
      
      {/* Sub-tab Selector */}
      <div className={styles.tabSelector}>
        <button
          onClick={() => { setHistoryType('offer_letter'); setSearchQuery(''); }}
          className={`${styles.tabButton} ${historyType === 'offer_letter' ? styles.tabButtonActive : ''}`}
        >
          <FileText size={16} />
          <span>Offer Letters</span>
          <span className={styles.tabBadge}>{offerBatches.length} Batches</span>
        </button>
        <button
          onClick={() => { setHistoryType('wage_slip'); setSearchQuery(''); }}
          className={`${styles.tabButton} ${historyType === 'wage_slip' ? styles.tabButtonActive : ''}`}
        >
          <Coins size={16} />
          <span>Wage Slips (Form V)</span>
          <span className={styles.tabBadge}>{wageBatches.length} Periods</span>
        </button>
      </div>

      {/* Top Statistics & Quick Download Center (Template 1 Header) */}
      <div className={styles.statsRow}>
        
        {/* Metric 1 */}
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.pinkIcon}`}>
            <FileSpreadsheet size={24} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>
              {historyType === 'offer_letter' ? 'Total Letters Generated' : 'Total Wage Slips'}
            </div>
            <div className={styles.statValue}>
              {historyType === 'offer_letter' ? (historyData.logs?.length || 0) : wageLogs.length}
            </div>
            <div className={styles.statSubtext}>
              {historyType === 'offer_letter' 
                ? `Across ${offerBatches.length} generation runs` 
                : `Across ${wageBatches.length} monthly payrolls`}
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.plumIcon}`}>
            {historyType === 'offer_letter' ? <Users size={24} /> : <Coins size={24} />}
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>
              {historyType === 'offer_letter' ? 'Unique Staff (by LIN)' : 'Net Wages Disbursed'}
            </div>
            <div className={styles.statValue}>
              {historyType === 'offer_letter' 
                ? `${historyData.unique_employees_count || 0} Staff`
                : `₹${totalWagesDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </div>
            <div className={styles.statSubtext}>
              {historyType === 'offer_letter' ? 'Active in roster' : 'Total disbursed in DB'}
            </div>
          </div>
        </div>

        {/* Quick Download Action Hub Card */}
        <div className={`${styles.statCard} ${styles.quickActionCard}`}>
          <div className={styles.quickActionHeader}>
            <div className={styles.quickActionTitle}>
              <Sparkles size={16} className={styles.sparkleIcon} />
              <span>Bulk Download Center (ZIP)</span>
            </div>
            <span className={styles.liveBadge}>Backend Fast Stream</span>
          </div>

          <div className={styles.quickActionButtons}>
            {historyType === 'offer_letter' ? (
              <>
                <button
                  onClick={() => handleDownloadOfferZip('pdf')}
                  disabled={downloadingZip !== null || (historyData.logs?.length || 0) === 0}
                  className={`${styles.zipBtn} ${styles.zipBtnPrimary}`}
                  title="Download all generated offer letters as PDF in a single ZIP file"
                >
                  <Download size={14} className={downloadingZip === 'latest-pdf' ? styles.spinning : ''} />
                  <span>{downloadingZip === 'latest-pdf' ? 'Creating ZIP...' : 'Download PDF (ZIP)'}</span>
                </button>
                <button
                  onClick={() => handleDownloadOfferZip('docx')}
                  disabled={downloadingZip !== null || (historyData.logs?.length || 0) === 0}
                  className={`${styles.zipBtn} ${styles.zipBtnSecondary}`}
                  title="Download all generated offer letters as DOCX in a single ZIP file"
                >
                  <Download size={14} className={downloadingZip === 'latest-docx' ? styles.spinning : ''} />
                  <span>{downloadingZip === 'latest-docx' ? 'Creating ZIP...' : 'Download DOCX (ZIP)'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleDownloadWageZip(wageBatches[0] || null)}
                  disabled={downloadingZip !== null || wageLogs.length === 0}
                  className={`${styles.zipBtn} ${styles.zipBtnPrimary}`}
                  title="Download latest month wage slips as ZIP"
                >
                  <Download size={14} className={downloadingZip?.startsWith('wage-') ? styles.spinning : ''} />
                  <span>
                    {downloadingZip?.startsWith('wage-') 
                      ? 'Creating ZIP...' 
                      : `Download ${wageBatches[0]?.period || 'Latest'} (ZIP)`}
                  </span>
                </button>
                <button
                  onClick={() => handleDownloadWageZip(null)}
                  disabled={downloadingZip !== null || wageLogs.length === 0}
                  className={`${styles.zipBtn} ${styles.zipBtnSecondary}`}
                  title="Download all wage slips from all periods in a single ZIP"
                >
                  <FolderArchive size={14} />
                  <span>Download All Slips (ZIP)</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Filter and Control Bar */}
      <div className={styles.actionHeader}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={
              historyType === 'offer_letter' 
                ? "Filter batch staff by name, LIN, or designation..." 
                : "Filter slips by name, designation, or UAN..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={styles.clearSearchBtn}>✕</button>
          )}
        </div>

        <div className={styles.headerRightControls}>
          <button 
            onClick={() => toggleAllBatches(allBatchesCollapsed)}
            className={styles.expandCollapseBtn}
            title={allBatchesCollapsed ? "Expand all batches" : "Collapse all batches"}
          >
            {allBatchesCollapsed ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{allBatchesCollapsed ? 'Expand All' : 'Collapse All'}</span>
          </button>

          <button 
            onClick={fetchHistory} 
            disabled={loading} 
            className={styles.refreshBtn}
            title="Refresh history logs from database"
          >
            <RefreshCw size={14} className={loading ? styles.spinning : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading && (historyType === 'offer_letter' ? offerBatches.length === 0 : wageBatches.length === 0) ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading generation history from database...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <AlertCircle size={28} className={styles.errorIcon} />
          <p>{error}</p>
          <button onClick={fetchHistory} className={styles.retryBtn}>Retry</button>
        </div>
      ) : (historyType === 'offer_letter' ? offerBatches.length === 0 : wageBatches.length === 0) ? (
        <div className={styles.emptyState}>
          <HelpCircle size={36} className={styles.emptyIcon} />
          <h3>No Records Found</h3>
          <p>
            {historyType === 'offer_letter' 
              ? 'You have not generated any appointment letters yet. Upload an employee excel file to get started.' 
              : 'You have not generated any wage slips yet. Upload a wage register excel file to get started.'}
          </p>
        </div>
      ) : historyType === 'offer_letter' ? (
        
        /* ══════════════════════════════════════════════════════════════════════
           TEMPLATE 1: OFFER LETTER GENERATION BATCHES
           ══════════════════════════════════════════════════════════════════════ */
        <div className={styles.batchListContainer}>
          {offerBatches.map((batch) => {
            const isExpanded = !!expandedBatches[batch.id];
            
            // Filter records inside this batch if search query exists
            const filteredBatchLogs = batch.logs.filter(log => {
              const q = searchQuery.toLowerCase().trim();
              if (!q) return true;
              return (
                (log.employee_name || '').toLowerCase().includes(q) ||
                (log.lin_number || '').toLowerCase().includes(q) ||
                (log.designation || '').toLowerCase().includes(q)
              );
            });

            // If there's an active query and no matching rows in this batch, hide the card
            if (searchQuery.trim() && filteredBatchLogs.length === 0) {
              return null;
            }

            const isPdfLoading = downloadingZip === `batch-${batch.id}-pdf`;
            const isDocxLoading = downloadingZip === `batch-${batch.id}-docx`;

            return (
              <div key={batch.id} className={`${styles.batchCard} ${batch.isLatest ? styles.latestBatchCard : ''}`}>
                
                {/* Batch Card Header */}
                <div className={styles.batchHeader} onClick={() => toggleBatch(batch.id)}>
                  
                  <div className={styles.batchHeaderLeft}>
                    <div className={styles.batchBadge}>
                      <Layers size={14} />
                      <span>Batch #{batch.batchNumber}</span>
                      {batch.isLatest && <span className={styles.latestPill}>Latest</span>}
                    </div>

                    <div className={styles.batchMetaInfo}>
                      <div className={styles.batchDate}>
                        <Clock size={13} className={styles.metaIcon} />
                        <span>{formatDateTime(batch.timestamp)}</span>
                      </div>
                      <div className={styles.batchDot}>•</div>
                      <div className={styles.batchCountBadge}>
                        <Users size={13} className={styles.metaIcon} />
                        <span><strong>{batch.totalCount}</strong> Employees</span>
                      </div>
                      <div className={styles.batchDot}>•</div>
                      <div className={styles.batchFormats}>
                        {batch.formats.map(fmt => (
                          <span key={fmt} className={`${styles.formatBadge} ${styles[fmt]}`}>
                            {fmt.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Batch Action Buttons */}
                  <div className={styles.batchHeaderRight} onClick={(e) => e.stopPropagation()}>
                    
                    <button
                      onClick={() => handleDownloadOfferZip('pdf', batch)}
                      disabled={downloadingZip !== null}
                      className={`${styles.batchActionBtn} ${styles.pdfBtn}`}
                      title={`Download PDF (.zip) for all ${batch.totalCount} staff in Batch #${batch.batchNumber}`}
                    >
                      <Download size={13} className={isPdfLoading ? styles.spinning : ''} />
                      <span>{isPdfLoading ? 'Zipping...' : 'Download PDF (ZIP)'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadOfferZip('docx', batch)}
                      disabled={downloadingZip !== null}
                      className={`${styles.batchActionBtn} ${styles.docxBtn}`}
                      title={`Download DOCX (.zip) for all ${batch.totalCount} staff in Batch #${batch.batchNumber}`}
                    >
                      <Download size={13} className={isDocxLoading ? styles.spinning : ''} />
                      <span>{isDocxLoading ? 'Zipping...' : 'Download DOCX (ZIP)'}</span>
                    </button>

                    <button
                      onClick={() => toggleBatch(batch.id)}
                      className={styles.batchToggleBtn}
                      title={isExpanded ? "Collapse staff list" : "Expand staff list"}
                    >
                      <span>{isExpanded ? 'Hide Staff' : `View Staff (${batch.totalCount})`}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                  </div>

                </div>

                {/* Batch Collapsible Employee Table */}
                {isExpanded && (
                  <div className={styles.batchContent}>
                    <div className={styles.tableResponsive}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Employee Details</th>
                            <th>LIN Number</th>
                            <th>Designation</th>
                            <th>Date of Joining</th>
                            <th>Format</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Direct Download</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBatchLogs.map((log) => {
                            const initials = log.employee_name
                              ? log.employee_name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                              : 'EE';

                            return (
                              <tr key={log.id} className={styles.tr}>
                                <td>
                                  <div className={styles.empCol}>
                                    <div className={styles.avatar}>{initials}</div>
                                    <div className={styles.empName}>{log.employee_name}</div>
                                  </div>
                                </td>
                                <td>
                                  <span className={styles.linBadge}>{log.lin_number || '—'}</span>
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
                                    {log.format.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  {log.downloaded ? (
                                    <div className={styles.downloadStatus}>
                                      <span className={`${styles.statusBadge} ${styles.downloaded}`}>
                                        <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                                        Downloaded
                                      </span>
                                      {log.downloaded_by_email && (
                                        <div className={styles.downloadByInfo} title={`Downloaded at ${formatDateTime(log.downloaded_at)}`}>
                                          by {log.downloaded_by_email}
                                        </div>
                                      )}
                                    </div>
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
                                          onClick={() => handleDownloadFile(log.employee_id, 'pdf')}
                                          className={`${styles.actionDlBtn} ${styles.pdfAction}`}
                                          title="Download individual PDF"
                                        >
                                          <FileText size={12} />
                                          <span>PDF</span>
                                        </button>
                                      )}
                                      {(log.format === 'docx' || log.format === 'both') && (
                                        <button 
                                          onClick={() => handleDownloadFile(log.employee_id, 'docx')}
                                          className={`${styles.actionDlBtn} ${styles.docxAction}`}
                                          title="Download individual DOCX"
                                        >
                                          <Download size={12} />
                                          <span>DOCX</span>
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className={styles.localOnly} title="Generated client-side only">
                                      Local-Only
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      ) : (

        /* ══════════════════════════════════════════════════════════════════════
           TEMPLATE 1: WAGE SLIPS MONTHLY BATCHES
           ══════════════════════════════════════════════════════════════════════ */
        <div className={styles.batchListContainer}>
          {wageBatches.map((batch) => {
            const isExpanded = !!expandedBatches[batch.id];

            const filteredBatchLogs = batch.logs.filter(log => {
              const q = searchQuery.toLowerCase().trim();
              if (!q) return true;
              return (
                (log.employee_name || '').toLowerCase().includes(q) ||
                (log.designation || '').toLowerCase().includes(q) ||
                (log.uan || '').toLowerCase().includes(q)
              );
            });

            if (searchQuery.trim() && filteredBatchLogs.length === 0) {
              return null;
            }

            const isZipLoading = downloadingZip === `wage-${batch.id}`;

            return (
              <div key={batch.id} className={`${styles.batchCard} ${batch.isLatest ? styles.latestBatchCard : ''}`}>
                
                {/* Wage Batch Header */}
                <div className={styles.batchHeader} onClick={() => toggleBatch(batch.id)}>
                  
                  <div className={styles.batchHeaderLeft}>
                    <div className={styles.batchBadge} style={{ background: '#064e3b', color: '#6ee7b7' }}>
                      <Calendar size={14} />
                      <span>{batch.period} Batch</span>
                      {batch.isLatest && <span className={styles.latestPill} style={{ background: '#059669' }}>Latest Month</span>}
                    </div>

                    <div className={styles.batchMetaInfo}>
                      <div className={styles.batchCountBadge}>
                        <Users size={13} className={styles.metaIcon} />
                        <span><strong>{batch.logs.length}</strong> Wage Slips</span>
                      </div>
                      <div className={styles.batchDot}>•</div>
                      <div className={styles.batchWagesTotal}>
                        <Coins size={13} className={styles.metaIcon} color="#10b981" />
                        <span>Total Paid: <strong>₹{batch.totalNetWages.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Wage Batch Actions */}
                  <div className={styles.batchHeaderRight} onClick={(e) => e.stopPropagation()}>
                    
                    <button
                      onClick={() => handleDownloadWageZip(batch)}
                      disabled={downloadingZip !== null}
                      className={`${styles.batchActionBtn} ${styles.pdfBtn}`}
                      style={{
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        borderColor: '#10b981'
                      }}
                      title={`Download all ${batch.logs.length} wage slips for ${batch.period} as a single ZIP file`}
                    >
                      <Download size={13} className={isZipLoading ? styles.spinning : ''} />
                      <span>{isZipLoading ? 'Zipping...' : `Download ${batch.period} (ZIP)`}</span>
                    </button>

                    <button
                      onClick={() => toggleBatch(batch.id)}
                      className={styles.batchToggleBtn}
                      title={isExpanded ? "Collapse wage slips" : "Expand wage slips"}
                    >
                      <span>{isExpanded ? 'Hide Slips' : `View Slips (${batch.logs.length})`}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                  </div>

                </div>

                {/* Wage Collapsible Table */}
                {isExpanded && (
                  <div className={styles.batchContent}>
                    <div className={styles.tableResponsive}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Employee Details</th>
                            <th>Designation</th>
                            <th>UAN</th>
                            <th>Wage Period</th>
                            <th>Net Wages Paid</th>
                            <th>Generated At</th>
                            <th style={{ textAlign: 'right' }}>Direct Download</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBatchLogs.map((log) => {
                            const initials = log.employee_name
                              ? log.employee_name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                              : 'EE';

                            return (
                              <tr key={log.id} className={styles.tr}>
                                <td>
                                  <div className={styles.empCol}>
                                    <div className={styles.avatar} style={{ background: '#064e3b', color: '#6ee7b7' }}>{initials}</div>
                                    <div className={styles.empName}>{log.employee_name}</div>
                                  </div>
                                </td>
                                <td>{log.designation || '—'}</td>
                                <td>
                                  <span className={styles.linBadge}>{log.uan || '—'}</span>
                                </td>
                                <td>{log.wage_month} {log.wage_year}</td>
                                <td>
                                  <strong style={{ color: '#10b981' }}>₹{(log.net_wages || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                </td>
                                <td className={styles.timeCell}>
                                  <Clock size={12} className={styles.cellIcon} />
                                  <span>{formatDateTime(log.created_at)}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button 
                                    onClick={() => handleDownloadWage(log.id, log.employee_name)}
                                    className={`${styles.actionDlBtn} ${styles.pdfAction}`}
                                    title="Download individual Wage Slip PDF"
                                  >
                                    <Download size={12} />
                                    <span>PDF</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
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
  );
}

export default React.memo(GenerationHistory);
