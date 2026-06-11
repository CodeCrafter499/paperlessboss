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
  AlertCircle
} from 'lucide-react';
import { offerLetterApi } from '../utils/authApi';
import { saveAs } from 'file-saver';
import styles from './GenerationHistory.module.css';

export default function GenerationHistory({ active }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyData, setHistoryData] = useState({ unique_employees_count: 0, logs: [] });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await offerLetterApi.getGenerationHistory();
      setHistoryData(data || { unique_employees_count: 0, logs: [] });
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

  const handleDownloadFile = async (employeeId, format) => {
    try {
      const blob = await offerLetterApi.downloadFile(employeeId, format);
      const filename = `Appointment_${format === 'pdf' ? 'Letter' : 'Template'}_${employeeId}.${format}`;
      saveAs(blob, filename);
      // Wait a moment and fetch updated history to show marked as downloaded
      setTimeout(() => {
        fetchHistory();
      }, 800);
    } catch (err) {
      alert(`Redownload failed: ${err.message}`);
    }
  };

  const filteredLogs = (historyData.logs || []).filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.employee_name.toLowerCase().includes(q) ||
      (log.lin_number || '').toLowerCase().includes(q) ||
      (log.designation || '').toLowerCase().includes(q)
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

  return (
    <div className={styles.wrapper}>
      {/* Top statistics summary row */}
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

      {/* Filter and Refresh Bar */}
      <div className={styles.actionHeader}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by name, LIN number, or designation..." 
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
        {loading && historyData.logs?.length === 0 ? (
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
        ) : filteredLogs.length === 0 ? (
          <div className={styles.emptyState}>
            <HelpCircle size={32} className={styles.emptyIcon} />
            <h3>No Records Found</h3>
            <p>
              {searchQuery 
                ? `No records matching "${searchQuery}" found in your generation history.`
                : 'You have not generated any appointment letters yet.'}
            </p>
          </div>
        ) : (
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
                {filteredLogs.map((log) => {
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
        )}
      </div>
    </div>
  );
}
