import React, { useState, useEffect, useCallback } from 'react';
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
  Coins
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

  // Filter lists based on type
  const filteredOfferLogs = (historyData.logs || []).filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.employee_name.toLowerCase().includes(q) ||
      (log.lin_number || '').toLowerCase().includes(q) ||
      (log.designation || '').toLowerCase().includes(q)
    );
  });

  const filteredWageLogs = (wageLogs || []).filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.employee_name.toLowerCase().includes(q) ||
      (log.designation || '').toLowerCase().includes(q) ||
      (log.uan || '').toLowerCase().includes(q)
    );
  });

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

  return (
    <div className={styles.wrapper}>
      
      {/* Dynamic Sub-tab Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => { setHistoryType('offer_letter'); setSearchQuery(''); }}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            background: historyType === 'offer_letter' ? 'var(--color-primary)' : 'transparent',
            color: historyType === 'offer_letter' ? '#fff' : '#4a5568',
            transition: 'background 0.2s, color 0.2s'
          }}
          className={historyType === 'offer_letter' ? styles.tabActiveButton : ''}
        >
          Offer Letters
        </button>
        <button
          onClick={() => { setHistoryType('wage_slip'); setSearchQuery(''); }}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            background: historyType === 'wage_slip' ? 'var(--color-primary)' : 'transparent',
            color: historyType === 'wage_slip' ? '#fff' : '#4a5568',
            transition: 'background 0.2s, color 0.2s'
          }}
          className={historyType === 'wage_slip' ? styles.tabActiveButton : ''}
        >
          Wage Slips (Form V)
        </button>
      </div>

      {/* Top statistics summary row */}
      {historyType === 'offer_letter' ? (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.pinkIcon}`}>
              <FileSpreadsheet size={22} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Letters Generated</div>
              <div className={styles.statValue}>{historyData.logs?.length || 0}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.plumIcon}`}>
              <Users size={22} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Unique Employees (by LIN)</div>
              <div className={styles.statValue}>{historyData.unique_employees_count || 0}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.pinkIcon}`}>
              <FileSpreadsheet size={22} />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Wage Slips Generated</div>
              <div className={styles.statValue}>{wageLogs.length}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.plumIcon}`} style={{ backgroundColor: '#ebeeef' }}>
              <Coins size={22} color="#2b6cb0" />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Total Net Wages Disbursed</div>
              <div className={styles.statValue}>₹{totalWagesDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Refresh Bar */}
      <div className={styles.actionHeader}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder={historyType === 'offer_letter' ? "Search by name, LIN, or designation..." : "Search by name, UAN, or designation..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button 
          onClick={fetchHistory} 
          disabled={loading} 
          className={styles.refreshBtn}
          title="Refresh history logs"
        >
          <RefreshCw size={14} className={loading ? styles.spinning : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Logs Table */}
      <div className={styles.tableCard}>
        {loading && (historyType === 'offer_letter' ? historyData.logs?.length === 0 : wageLogs.length === 0) ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading history records...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertCircle size={24} className={styles.errorIcon} />
            <p>{error}</p>
            <button onClick={fetchHistory} className={styles.retryBtn}>Retry</button>
          </div>
        ) : (historyType === 'offer_letter' ? filteredOfferLogs.length === 0 : filteredWageLogs.length === 0) ? (
          <div className={styles.emptyState}>
            <HelpCircle size={32} className={styles.emptyIcon} />
            <h3>No Records Found</h3>
            <p>
              {searchQuery 
                ? `No records matching "${searchQuery}" found in your generation history.`
                : historyType === 'offer_letter' 
                  ? 'You have not generated any appointment letters yet.' 
                  : 'You have not generated any wage slips yet.'}
            </p>
          </div>
        ) : historyType === 'offer_letter' ? (
          /* Offer Letters Table */
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee Details</th>
                  <th>LIN Number</th>
                  <th>Designation</th>
                  <th>Date of Joining</th>
                  <th>Format</th>
                  <th>Generated At</th>
                  <th>Download Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfferLogs.map((log) => {
                  const initials = log.employee_name
                    ? log.employee_name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'EE';
                  
                  return (
                    <tr key={log.id} className={styles.tr}>
                      <td>
                        <div className={styles.empCol}>
                          <div className={styles.avatar}>{initials}</div>
                          <div>
                            <div className={styles.empName}>{log.employee_name}</div>
                          </div>
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
                      <td className={styles.timeCell}>
                        <Clock size={12} className={styles.cellIcon} />
                        <span>{formatDateTime(log.generated_at)}</span>
                      </td>
                      <td>
                        {log.downloaded ? (
                          <div className={styles.downloadStatus}>
                            <span className={`${styles.statusBadge} ${styles.downloaded}`}>
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
                                title="Download PDF"
                              >
                                <FileText size={12} />
                                <span>PDF</span>
                              </button>
                            )}
                            {(log.format === 'docx' || log.format === 'both') && (
                              <button 
                                onClick={() => handleDownloadFile(log.employee_id, 'docx')}
                                className={`${styles.actionDlBtn} ${styles.docxAction}`}
                                title="Download DOCX"
                              >
                                <Download size={12} />
                                <span>DOCX</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className={styles.localOnly} title="Generated client-side only. Files are not saved on server.">
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
        ) : (
          /* Wage Slips Table */
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWageLogs.map((log) => {
                  const initials = log.employee_name
                    ? log.employee_name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'EE';
                  
                  return (
                    <tr key={log.id} className={styles.tr}>
                      <td>
                        <div className={styles.empCol}>
                          <div className={styles.avatar} style={{ background: '#ebeeef', color: '#2b6cb0' }}>{initials}</div>
                          <div>
                            <div className={styles.empName}>{log.employee_name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{log.designation || '—'}</td>
                      <td>
                        <span className={styles.linBadge} style={{ background: '#edf2f7', color: '#4a5568' }}>{log.uan || '—'}</span>
                      </td>
                      <td>{log.wage_month} {log.wage_year}</td>
                      <td>
                        <strong style={{ color: '#2f855a' }}>₹{(log.net_wages || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </td>
                      <td className={styles.timeCell}>
                        <Clock size={12} className={styles.cellIcon} />
                        <span>{formatDateTime(log.created_at)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDownloadWage(log.id, log.employee_name)}
                          className={`${styles.actionDlBtn} ${styles.pdfAction}`}
                          style={{
                            background: 'linear-gradient(135deg, #48bb78, #38a169)',
                            borderColor: 'transparent',
                            color: '#fff',
                            padding: '6px 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Download Wage Slip PDF"
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
        )}
      </div>
    </div>
  );
}

export default React.memo(GenerationHistory);
