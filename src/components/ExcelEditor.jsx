import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Plus, Trash2, Check, Download, AlertTriangle, Keyboard,
  Undo, Redo, Printer, Paintbrush, Bold, Italic, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, Type, ChevronDown, ListFilter,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { COLUMN_MAP } from '../utils/excelParser';
import styles from './ExcelEditor.module.css';

const COLS = [
  { key: 'employeeName',      label: 'Employee Name' },
  { key: 'dateOfBirth',       label: 'Date of Birth' },
  { key: 'parentName',        label: 'Father/Mother Name' },
  { key: 'aadhaarNumber',     label: 'Aadhaar Number' },
  { key: 'linNumber',         label: 'LIN Number' },
  { key: 'uanEsic',           label: 'UAN / ESIC' },
  { key: 'designation',       label: 'Designation' },
  { key: 'employmentType',    label: 'Employment Type' },
  { key: 'skillCategory',     label: 'Skill Category' },
  { key: 'dateOfJoining',     label: 'Date of Joining' },
  { key: 'basicPay',          label: 'Basic Pay' },
  { key: 'dearnessAllowance', label: 'DA' },
  { key: 'otherAllowance',    label: 'Other Allowance' },
  { key: 'socialSecurity',    label: 'Social Security' },
  { key: 'duties',            label: 'Duties Nature' },
  { key: 'maternityBenefits', label: 'Maternity Benefits' },
  { key: 'otherInfo',         label: 'Other Info' }
];

// Excel Column Letter Generator (0 -> A, 1 -> B, etc.)
const getColLetter = (idx) => String.fromCharCode(65 + idx);

export default function ExcelEditor({
  rows,
  setRows,
  filename,
  warnings,
  validationResult,
  onRevalidate,
  isGenerating = false,
  isReadOnly = false
}) {
  const [selectedCell, setSelectedCell] = useState(null); // { rowIndex, colIndex }
  const [editingCell, setEditingCell] = useState(null);   // { rowIndex, colIndex }
  const [editValue, setEditValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Map server validation errors to grid cells
  const cellErrors = useMemo(() => {
    const map = {};
    if (validationResult && validationResult.errors) {
      validationResult.errors.forEach(err => {
        const recId = err.recId !== undefined ? err.recId : err.rec_id;
        const fieldName = err.fieldName !== undefined ? err.fieldName : err.field_name;
        const errorMessage = err.errorMessage !== undefined ? err.errorMessage : err.error_message;

        const row = rows.find(r => r._rowIndex === recId);
        if (row) {
          const fieldKey = COLUMN_MAP[fieldName];
          if (fieldKey) {
            const rowIndex = rows.indexOf(row);
            const colIndex = COLS.findIndex(c => c.key === fieldKey);
            if (colIndex !== -1) {
              map[`${rowIndex}_${colIndex}`] = errorMessage;
            }
          }
        }
      });
    }
    return map;
  }, [validationResult, rows]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Commits active edits
  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const { rowIndex, colIndex } = editingCell;
    const fieldKey = COLS[colIndex].key;
    
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [fieldKey]: editValue
    };
    setRows(updatedRows);
    setEditingCell(null);
  }, [editingCell, editValue, rows, setRows]);

  // Enters edit mode
  const startEditing = (rowIndex, colIndex) => {
    if (isReadOnly || isGenerating) return;
    setEditingCell({ rowIndex, colIndex });
    setEditValue(rows[rowIndex][COLS[colIndex].key] || '');
  };

  // Selection/Focus click
  const handleCellClick = (rowIndex, colIndex, e) => {
    e.stopPropagation();
    if (selectedCell && selectedCell.rowIndex === rowIndex && selectedCell.colIndex === colIndex) {
      // Double click effect: edit cell
      startEditing(rowIndex, colIndex);
    } else {
      commitEdit();
      setSelectedCell({ rowIndex, colIndex });
    }
  };

  // Formula bar value updates cell content directly
  const handleFormulaBarChange = (val) => {
    if (!selectedCell || isReadOnly || isGenerating) return;
    const { rowIndex, colIndex } = selectedCell;
    const fieldKey = COLS[colIndex].key;

    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [fieldKey]: val
    };
    setRows(updatedRows);
  };

  // Keyboard navigation & editing triggers
  const handleKeyDown = (e) => {
    if (!selectedCell) return;
    const { rowIndex, colIndex } = selectedCell;

    // Handle Edit Mode inputs
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        // Move selection down if possible
        if (rowIndex < rows.length - 1) {
          setSelectedCell({ rowIndex: rowIndex + 1, colIndex });
        }
        containerRef.current.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditingCell(null);
        containerRef.current.focus();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        // Move selection right
        if (colIndex < COLS.length - 1) {
          setSelectedCell({ rowIndex, colIndex: colIndex + 1 });
        } else if (rowIndex < rows.length - 1) {
          setSelectedCell({ rowIndex: rowIndex + 1, colIndex: 0 });
        }
        containerRef.current.focus();
      }
      return;
    }

    // Handle Grid Navigation Mode
    let moved = false;
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        if (rowIndex > 0) {
          nextRow = rowIndex - 1;
          moved = true;
        }
        break;
      case 'ArrowDown':
        if (rowIndex < rows.length - 1) {
          nextRow = rowIndex + 1;
          moved = true;
        }
        break;
      case 'ArrowLeft':
        if (colIndex > 0) {
          nextCol = colIndex - 1;
          moved = true;
        }
        break;
      case 'ArrowRight':
        if (colIndex < COLS.length - 1) {
          nextCol = colIndex + 1;
          moved = true;
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          if (colIndex > 0) {
            nextCol = colIndex - 1;
          } else if (rowIndex > 0) {
            nextRow = rowIndex - 1;
            nextCol = COLS.length - 1;
          }
        } else {
          if (colIndex < COLS.length - 1) {
            nextCol = colIndex + 1;
          } else if (rowIndex < rows.length - 1) {
            nextRow = rowIndex + 1;
            nextCol = 0;
          }
        }
        moved = true;
        break;
      case 'Enter':
        e.preventDefault();
        startEditing(rowIndex, colIndex);
        break;
      case 'Backspace':
      case 'Delete':
        if (isReadOnly || isGenerating) return;
        e.preventDefault();
        const clearedRows = [...rows];
        clearedRows[rowIndex] = {
          ...clearedRows[rowIndex],
          [COLS[colIndex].key]: ''
        };
        setRows(clearedRows);
        break;
      default:
        // Type directly to start editing
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          if (isReadOnly || isGenerating) return;
          e.preventDefault();
          setEditingCell({ rowIndex, colIndex });
          setEditValue(e.key);
        }
        break;
    }

    if (moved) {
      e.preventDefault();
      setSelectedCell({ rowIndex: nextRow, colIndex: nextCol });
    }
  };

  // Handle clipboard paste command (TSV formatted data)
  const handlePaste = useCallback((e) => {
    if (editingCell) return; // Allow normal single-cell paste inside active text input
    if (!selectedCell || isReadOnly || isGenerating) return;

    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const text = clipboardData.getData('text');
    if (!text) return;

    // Parse Tab-Separated Values (TSV) from clipboard
    const rowsData = text.split(/\r?\n/).map(row => row.split('\t'));
    
    // Clean up empty trailing row if copied from excel (which usually appends newline)
    if (rowsData.length > 1 && rowsData[rowsData.length - 1].length === 1 && rowsData[rowsData.length - 1][0] === '') {
      rowsData.pop();
    }

    const { rowIndex: startRow, colIndex: startCol } = selectedCell;
    const updatedRows = [...rows];

    // Append rows if paste block extends past grid limits
    const endRowIndex = startRow + rowsData.length - 1;
    if (endRowIndex >= updatedRows.length) {
      const neededRows = endRowIndex - updatedRows.length + 1;
      let nextIndex = updatedRows.length > 0 ? Math.max(...updatedRows.map(r => r._rowIndex)) + 1 : 2;
      for (let i = 0; i < neededRows; i++) {
        const newRow = { _rowIndex: nextIndex + i };
        COLS.forEach(c => { newRow[c.key] = ''; });
        updatedRows.push(newRow);
      }
    }

    // Populate parsed clipboard cells into rows
    for (let rIdx = 0; rIdx < rowsData.length; rIdx++) {
      const rowVals = rowsData[rIdx];
      const targetRowIdx = startRow + rIdx;
      
      for (let cIdx = 0; cIdx < rowVals.length; cIdx++) {
        const targetColIdx = startCol + cIdx;
        if (targetColIdx < COLS.length) {
          const fieldKey = COLS[targetColIdx].key;
          updatedRows[targetRowIdx] = {
            ...updatedRows[targetRowIdx],
            [fieldKey]: rowVals[cIdx]
          };
        }
      }
    }

    setRows(updatedRows);
  }, [selectedCell, editingCell, rows, setRows, isReadOnly, isGenerating]);

  // Add row action
  const handleAddRow = () => {
    if (isReadOnly || isGenerating) return;
    const nextIndex = rows.length > 0 ? Math.max(...rows.map(r => r._rowIndex)) + 1 : 2;
    const newRow = { _rowIndex: nextIndex };
    COLS.forEach(c => { newRow[c.key] = ''; });
    setRows([...rows, newRow]);
    setSelectedCell({ rowIndex: rows.length, colIndex: 0 });
  };

  // Delete row action
  const handleDeleteRow = (index, e) => {
    if (e) e.stopPropagation();
    if (isReadOnly || isGenerating) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    
    // Clear selection if boundary exceeded
    if (selectedCell && selectedCell.rowIndex >= updated.length) {
      setSelectedCell(null);
    }
    setEditingCell(null);
  };

  // Export updated grid to XLSX local file
  const handleExport = () => {
    const reverseMap = {};
    for (const [excelCol, fieldKey] of Object.entries(COLUMN_MAP)) {
      reverseMap[fieldKey] = excelCol;
    }

    const rawData = rows.map(row => {
      const rawRow = {};
      for (const [fieldKey, val] of Object.entries(row)) {
        if (fieldKey === '_rowIndex') continue;
        const excelCol = reverseMap[fieldKey];
        if (excelCol) {
          rawRow[excelCol] = val;
        }
      }
      return rawRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(rawData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, filename ? `edited_${filename}` : 'edited_employees.xlsx');
  };

  // Revalidate handler
  const handleRevalidateClick = async () => {
    if (!onRevalidate) return;
    setIsValidating(true);
    await onRevalidate(rows);
    setIsValidating(false);
  };

  // Clear selections when clicking outside grid
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // Don't commit edit or clear selection if clicking inside grid or formula bar/toolbar
      if (containerRef.current && containerRef.current.contains(e.target)) {
        return;
      }
      const clickedToolbar = e.target.closest(`.${styles.sheetsToolbar}`);
      const clickedFormula = e.target.closest(`.${styles.formulaBar}`);
      const clickedMenu = e.target.closest(`.${styles.menuBar}`);
      const clickedBottom = e.target.closest(`.${styles.bottomTabBar}`);
      if (clickedToolbar || clickedFormula || clickedMenu || clickedBottom) {
        return;
      }
      commitEdit();
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [commitEdit]);

  const totalErrors = Object.keys(cellErrors).length;

  return (
    <div className={styles.container}>
      {/* ── Toolbar (Google Sheets style) ─────────────────────────── */}
      <div className={styles.sheetsToolbar}>
        <div className={styles.toolbarSection}>
          <button className={styles.toolbarIconButton} title="Undo"><Undo size={14} /></button>
          <button className={styles.toolbarIconButton} title="Redo"><Redo size={14} /></button>
          <button className={styles.toolbarIconButton} title="Print"><Printer size={14} /></button>
          <button className={styles.toolbarIconButton} title="Paint format"><Paintbrush size={14} /></button>
        </div>
        
        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarSection}>
          <span className={styles.toolbarSelect}>100% <ChevronDown size={10} /></span>
          <div className={styles.toolbarDivider} />
          <span className={styles.toolbarSelect}>Arial <ChevronDown size={10} /></span>
          <div className={styles.toolbarDivider} />
          <span className={styles.toolbarSelect}>10 <ChevronDown size={10} /></span>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarSection}>
          <button className={styles.toolbarIconButton} title="Bold"><Bold size={14} /></button>
          <button className={styles.toolbarIconButton} title="Italic"><Italic size={14} /></button>
          <button className={styles.toolbarIconButton} title="Strikethrough"><Strikethrough size={14} /></button>
          <button className={styles.toolbarIconButton} title="Text Color" style={{color: '#3c4043'}}><Type size={14} /></button>
          <button className={styles.toolbarIconButton} title="Fill Color"><span style={{width: 12, height: 12, background: '#fff', border: '1px solid #c4c7c5', display: 'inline-block', borderRadius: 2}} /></button>
        </div>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarSection}>
          <button className={styles.toolbarIconButton} title="Align"><AlignLeft size={14} /></button>
        </div>
        
        <div className={styles.toolbarDivider} />
        
        <div className={styles.sheetsActions}>
          {!isReadOnly && !isGenerating && (
            <button 
              type="button" 
              className={styles.sheetsActionBtn} 
              onClick={handleAddRow}
              title="Add Row"
            >
              <Plus size={14} />
              <span>Add Row</span>
            </button>
          )}

          {!isReadOnly && !isGenerating && selectedCell && (
            <button 
              type="button" 
              className={`${styles.sheetsActionBtn} ${styles.dangerAction}`} 
              onClick={() => handleDeleteRow(selectedCell.rowIndex)}
              title="Delete Selected Row"
            >
              <Trash2 size={14} />
              <span>Delete Row</span>
            </button>
          )}

          <button 
            type="button" 
            className={styles.sheetsActionBtn} 
            onClick={handleExport}
            title="Export Excel"
          >
            <Download size={14} />
            <span>Export Excel</span>
          </button>

          {!isReadOnly && !isGenerating && onRevalidate && (
            <button 
              type="button" 
              className={`${styles.sheetsValidateBtn} ${totalErrors > 0 ? styles.validateWarning : ''}`}
              onClick={handleRevalidateClick}
              disabled={isValidating}
            >
              <Check size={14} />
              <span>{isValidating ? 'Validating...' : 'Validate & Save'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Formula Bar (Google Sheets style) ──────────────────────── */}
      <div className={styles.formulaBar}>
        <div className={styles.cellAddress}>
          {selectedCell ? `${getColLetter(selectedCell.colIndex)}${rows[selectedCell.rowIndex]?._rowIndex || selectedCell.rowIndex + 2}` : ''}
        </div>
        <div className={styles.formulaDivider} />
        <div className={styles.fxIcon}>fx</div>
        <input
          type="text"
          className={styles.formulaInput}
          value={selectedCell ? (rows[selectedCell.rowIndex]?.[COLS[selectedCell.colIndex].key] || '') : ''}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          disabled={!selectedCell || isReadOnly || isGenerating}
          placeholder={selectedCell ? "" : "Select a cell to enter data"}
        />
      </div>

      {/* ── Grid Canvas ────────────────────────────────────────────── */}
      <div 
        ref={containerRef}
        className={styles.gridWrapper}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        tabIndex={0}
        aria-label="Spreadsheet editor grid"
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.rowNumTh} ${styles.cornerHeader}`}>
                <div className={styles.cornerDiagonal} />
              </th>
              {COLS.map((col, idx) => {
                const isColActive = selectedCell && selectedCell.colIndex === idx;
                return (
                  <th 
                    key={col.key} 
                    className={`${styles.th} ${isColActive ? styles.activeHeader : ''}`}
                  >
                    <div className={styles.colLetter}>{getColLetter(idx)}</div>
                    <div className={styles.colLabel}>{col.label}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const isRowActive = selectedCell && selectedCell.rowIndex === rIdx;
              return (
                <tr key={rIdx} className={styles.row}>
                  {/* Row Number */}
                  <td className={`${styles.td} ${styles.rowNumTd} ${isRowActive ? styles.activeHeader : ''}`}>
                    {row._rowIndex || rIdx + 2}
                  </td>
                  
                  {COLS.map((col, cIdx) => {
                    const fieldKey = col.key;
                    const isSelected = selectedCell && selectedCell.rowIndex === rIdx && selectedCell.colIndex === cIdx;
                    const isEditing = editingCell && editingCell.rowIndex === rIdx && editingCell.colIndex === cIdx;
                    const errorMsg = cellErrors[`${rIdx}_${cIdx}`];
                    const value = row[fieldKey] || '';

                    let cellClassName = styles.td;
                    if (isSelected) cellClassName += ` ${styles.selectedCell}`;
                    if (errorMsg) cellClassName += ` ${styles.errorCell}`;

                    return (
                      <td 
                        key={fieldKey}
                        className={cellClassName}
                        onClick={(e) => handleCellClick(rIdx, cIdx, e)}
                      >
                        {/* Red validation triangle in top right */}
                        {errorMsg && <div className={styles.errorTriangle} title={errorMsg} />}

                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            className={styles.cellInput}
                          />
                        ) : (
                          <div className={styles.cellValueContainer}>
                            <span className={value ? styles.valText : styles.emptyVal}>
                              {value}
                            </span>
                            {errorMsg && (
                              <div className={styles.tooltip}>{errorMsg}</div>
                            )}
                          </div>
                        )}
                        {/* Selected cell selection outline corner handles */}
                        {isSelected && <div className={styles.selectionCornerHandle} />}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* ── Bottom Sheets Tab Bar ──────────────────────────────────── */}
      <div className={styles.bottomTabBar}>
        <div className={styles.tabList}>
          <div className={`${styles.tabItem} ${styles.tabItemActive}`}>
            <span className={styles.tabName}>Employees</span>
            <ChevronDown size={12} className={styles.tabChevron} />
          </div>
        </div>
        <div className={styles.tabBarRight}>
          {totalErrors > 0 ? (
            <div className={styles.tabErrorText}>
              <AlertTriangle size={12} />
              <span>{totalErrors} issue{totalErrors !== 1 ? 's' : ''} detected. Resolve cells with red triangles.</span>
            </div>
          ) : (
            <span className={styles.tabStatusText}>All changes saved to memory</span>
          )}
        </div>
      </div>
    </div>
  );
}
