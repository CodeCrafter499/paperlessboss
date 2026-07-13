import * as XLSX from 'xlsx';

// Maps Excel column headers to internal field keys
export const COLUMN_MAP = {
  'Name of employee':                                                                               'employeeName',
  'Date of birth':                                                                                  'dateOfBirth',
  "Father's / Mother's name":                                                                       'parentName',
  'Aadhaar number':                                                                                 'aadhaarNumber',
  'Labour Identification Number (LIN) of the establishment':                                        'linNumber',
  'Universal Account Number (UAN) and / or Insurance Number (ESIC) (if available)':                'uanEsic',
  'Designation':                                                                                    'designation',
  'Type of Employment ':                                                                            'employmentType',
  'Category of Skill':                                                                              'skillCategory',
  'Date of Joining':                                                                                'dateOfJoining',
  'Basic Pay':                                                                                      'basicPay',
  'Dearness Allowance':                                                                             'dearnessAllowance',
  'Other Allowance':                                                                                'otherAllowance',
  'Applicability of social security benefits':                                                      'socialSecurity',
  'Broad nature of duties performed':                                                               'duties',
  'Benefits available under chapter VI (Maternity Benefit) of Code on Social Security, 2020 (in case of women employee)': 'maternityBenefits',
  'Any other information':                                                                          'otherInfo',
};

export function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return String(val);
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData.length) {
          reject(new Error('No data rows found in the Excel file. Please add employee data rows.'));
          return;
        }

        // Normalize rows using COLUMN_MAP
        const rows = rawData.map((rawRow, index) => {
          const row = { _rowIndex: index + 2 }; // 1-indexed, +1 for header
          for (const [excelCol, fieldKey] of Object.entries(COLUMN_MAP)) {
            const raw = rawRow[excelCol];
            // Auto-format date fields
            if (fieldKey === 'dateOfBirth' || fieldKey === 'dateOfJoining') {
              row[fieldKey] = formatDate(raw);
            } else {
              row[fieldKey] = raw !== undefined ? String(raw) : '';
            }
          }
          return row;
        });

        resolve({ rows, sheetName: firstSheetName, totalColumns: Object.keys(rawData[0] || {}).length });
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function validateRows(rows) {
  const warnings = [];
  rows.forEach((row, i) => {
    if (!row.employeeName || !row.employeeName.trim()) {
      warnings.push(`Row ${row._rowIndex}: Missing employee name`);
    }
  });
  return warnings;
}

export const WAGE_COLUMN_MAP = {
  '1. Name of employee': 'employeeName',
  "2. Father's/Mother's/Spouse Name": 'fatherMotherSpouseName',
  '3. Designation': 'designation',
  '4. UAN': 'uan',
  '5. Bank Account Number': 'bankAccountNumber',
  '6a. Wage month': 'wageMonth',
  '6b. Wage Year': 'wageYear',
  '7a.Rate of Basic': 'rateBasic',
  '7b. Rate of DA': 'rateDa',
  '7c. Rate of Allowances': 'rateAllowances',
  '8. Total attendance/unit of work done': 'totalAttendance',
  '9. Overtime wages': 'overtimeWages',
  '10. Gross wages payable': 'grossWages',
  '11a. PF': 'deductionPf',
  '11b. ESI': 'deductionEsi',
  '11c. Others': 'deductionOthers',
  '12. Net wages paid': 'netWages'
};

export function parseWageExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawData.length) {
          reject(new Error('No data rows found in the Excel file. Please add wage data rows.'));
          return;
        }

        const rows = rawData.map((rawRow, index) => {
          const row = { _rowIndex: index + 2 };
          for (const [excelCol, fieldKey] of Object.entries(WAGE_COLUMN_MAP)) {
            let raw = undefined;
            const matchKey = Object.keys(rawRow).find(k => 
              k.trim().toLowerCase().replace(/\s+/g, '') === excelCol.trim().toLowerCase().replace(/\s+/g, '') ||
              k.trim().toLowerCase().includes(excelCol.trim().toLowerCase()) ||
              excelCol.trim().toLowerCase().includes(k.trim().toLowerCase())
            );
            if (matchKey) {
              raw = rawRow[matchKey];
            }

            row[fieldKey] = raw !== undefined ? String(raw) : '';
          }
          return row;
        });

        resolve({ rows, sheetName: firstSheetName });
      } catch (err) {
        reject(new Error(`Failed to parse Wage Excel: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

