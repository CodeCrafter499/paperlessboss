import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  XCircle, RefreshCw, FileSpreadsheet, Filter,
} from 'lucide-react';
import styles from './ValidationErrors.module.css';

export default function ValidationErrors({ result, filename, onReupload }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filterField, setFilterField]   = useState('all');

  const success = result.success;
  const totalRecords = result.totalRecords !== undefined ? result.totalRecords : result.total_records;
  const validRecords = result.validRecords !== undefined ? result.validRecords : result.valid_records;
  const invalidRecords = result.invalidRecords !== undefined ? result.invalidRecords : result.invalid_records;
  
  const errors = useMemo(() => {
    const rawErrors = result.errors || [];
    return rawErrors.map(e => ({
      recId: e.recId !== undefined ? e.recId : e.rec_id,
      fieldName: e.fieldName !== undefined ? e.fieldName : e.field_name,
      errorMessage: e.errorMessage !== undefined ? e.errorMessage : e.error_message
    }));
  }, [result.errors]);

  // Group errors by recId
  const errorsByRow = useMemo(() => {
    const map = {};
    errors.forEach(e => {
      if (!map[e.recId]) map[e.recId] = [];
      map[e.recId].push(e);
    });
    return map;
  }, [errors]);

  // All unique field names for filter dropdown
  const uniqueFields = useMemo(() => {
    const fields = [...new Set(errors.map(e => e.fieldName))];
    return fields;
  }, [errors]);

  // Filtered error rows based on selected field
  const filteredRowIds = useMemo(() => {
    if (filterField === 'all') return Object.keys(errorsByRow).map(Number);
    return Object.keys(errorsByRow)
      .map(Number)
      .filter(id => errorsByRow[id].some(e => e.fieldName === filterField));
  }, [filterField, errorsByRow]);

  function toggleRow(id) {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function expandAll()   { setExpandedRows(new Set(filteredRowIds)); }
  function collapseAll() { setExpandedRows(new Set()); }

  return (
    <div className={styles.wrapper}>

      {/* ── Summary bar ─────────────────────────────────────────────── */}
      <div className={`${styles.summary} ${success ? styles.summarySuccess : styles.summaryError}`}>
        <div className={styles.summaryLeft}>
          {success
            ? <CheckCircle2 size={20} className={styles.iconSuccess} />
            : <XCircle      size={20} className={styles.iconError}   />
          }
          <div>
            <p className={styles.summaryTitle}>
              {success
                ? 'Validation passed — ready to generate letters'
                : `Validation failed — ${invalidRecords} of ${totalRecords} records have errors`
              }
            </p>
            <p className={styles.summaryFile}>{filename}</p>
          </div>
        </div>

        <div className={styles.summaryStats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{totalRecords}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.stat} ${styles.statGreen}`}>
            <span className={styles.statNum}>{validRecords}</span>
            <span className={styles.statLabel}>Valid</span>
          </div>
          {invalidRecords > 0 && (
            <div className={`${styles.stat} ${styles.statRed}`}>
              <span className={styles.statNum}>{invalidRecords}</span>
              <span className={styles.statLabel}>Invalid</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Error table ──────────────────────────────────────────────── */}
      {!success && errors.length > 0 && (
        <>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <AlertTriangle size={14} className={styles.warnIcon} />
              <span className={styles.toolbarTitle}>
                {errors.length} error{errors.length !== 1 ? 's' : ''} across {Object.keys(errorsByRow).length} row{Object.keys(errorsByRow).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className={styles.toolbarRight}>
              {/* Field filter */}
              <div className={styles.filterWrap}>
                <Filter size={13} />
                <select
                  className={styles.filterSelect}
                  value={filterField}
                  onChange={e => setFilterField(e.target.value)}
                  aria-label="Filter by field"
                >
                  <option value="all">All fields</option>
                  {uniqueFields.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <button className={styles.toolBtn} onClick={expandAll}>Expand all</button>
              <button className={styles.toolBtn} onClick={collapseAll}>Collapse all</button>
            </div>
          </div>

          {/* Error rows */}
          <ul className={styles.errorList} aria-label="Validation errors">
            {filteredRowIds.map(rowId => {
              const rowErrors = errorsByRow[rowId];
              const visibleErrors = filterField === 'all'
                ? rowErrors
                : rowErrors.filter(e => e.fieldName === filterField);
              const isOpen = expandedRows.has(rowId);

              return (
                <li key={rowId} className={styles.errorRow}>
                  <button
                    className={styles.rowHeader}
                    onClick={() => toggleRow(rowId)}
                    aria-expanded={isOpen}
                  >
                    <div className={styles.rowHeaderLeft}>
                      <span className={styles.rowBadge}>Row {rowId}</span>
                      <span className={styles.rowErrCount}>
                        {visibleErrors.length} error{visibleErrors.length !== 1 ? 's' : ''}
                      </span>
                      {!isOpen && (
                        <span className={styles.rowPreview}>
                          {visibleErrors[0].fieldName}: {visibleErrors[0].errorMessage}
                          {visibleErrors.length > 1 && ` +${visibleErrors.length - 1} more`}
                        </span>
                      )}
                    </div>
                    {isOpen
                      ? <ChevronUp   size={15} className={styles.chevron} />
                      : <ChevronDown size={15} className={styles.chevron} />
                    }
                  </button>

                  {isOpen && (
                    <ul className={styles.fieldErrors}>
                      {visibleErrors.map((e, i) => (
                        <li key={i} className={styles.fieldError}>
                          <AlertTriangle size={13} className={styles.fieldErrIcon} />
                          <div>
                            <span className={styles.fieldName}>{e.fieldName}</span>
                            <span className={styles.fieldErrMsg}>{e.errorMessage}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* ── Action footer ────────────────────────────────────────────── */}
      {!success && (
        <div className={styles.footer}>
          <div className={styles.footerNote}>
            <FileSpreadsheet size={14} />
            <span>Fix the errors in your Excel file, then re-upload to validate again.</span>
          </div>
          <button className={styles.reuploadBtn} onClick={onReupload}>
            <RefreshCw size={14} />
            Re-upload Excel
          </button>
        </div>
      )}
    </div>
  );
}
