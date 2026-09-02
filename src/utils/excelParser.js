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

// ── Download Sample Appointment Letters Template (.xlsx) ──
export function downloadAppointmentTemplate() {
  const headers = [
    'Name of employee',
    'Date of birth',
    "Father's / Mother's name",
    'Aadhaar number',
    'Labour Identification Number (LIN) of the establishment',
    'Universal Account Number (UAN) and / or Insurance Number (ESIC) (if available)',
    'Designation',
    'Type of Employment ',
    'Category of Skill',
    'Date of Joining',
    'Basic Pay',
    'Dearness Allowance',
    'Other Allowance',
    'Applicability of social security benefits',
    'Broad nature of duties performed',
    'Benefits available under chapter VI (Maternity Benefit) of Code on Social Security, 2020 (in case of women employee)',
    'Any other information'
  ];

  const sampleRows = [
    {
      'Name of employee': 'Rahul Sharma',
      'Date of birth': '15/08/1992',
      "Father's / Mother's name": 'Suresh Sharma',
      'Aadhaar number': '123456789012',
      'Labour Identification Number (LIN) of the establishment': 'LIN-1001',
      'Universal Account Number (UAN) and / or Insurance Number (ESIC) (if available)': '100123456789',
      'Designation': 'Software Engineer',
      'Type of Employment ': 'Permanent',
      'Category of Skill': 'Highly Skilled',
      'Date of Joining': '01/04/2026',
      'Basic Pay': '45000',
      'Dearness Allowance': '5000',
      'Other Allowance': '3000',
      'Applicability of social security benefits': 'PF, ESIC, Gratuity',
      'Broad nature of duties performed': 'Software development & code analysis',
      'Benefits available under chapter VI (Maternity Benefit) of Code on Social Security, 2020 (in case of women employee)': 'Applicable',
      'Any other information': 'Standard probation period 6 months'
    },
    {
      'Name of employee': 'Pooja Pillai',
      'Date of birth': '27/05/1995',
      "Father's / Mother's name": 'Krishnamurthy Nair',
      'Aadhaar number': '779979955271',
      'Labour Identification Number (LIN) of the establishment': 'LIN-8682',
      'Universal Account Number (UAN) and / or Insurance Number (ESIC) (if available)': '100876543210',
      'Designation': 'HR Executive',
      'Type of Employment ': 'Permanent',
      'Category of Skill': 'Skilled',
      'Date of Joining': '15/04/2026',
      'Basic Pay': '35000',
      'Dearness Allowance': '4000',
      'Other Allowance': '2000',
      'Applicability of social security benefits': 'PF, ESIC, Insurance',
      'Broad nature of duties performed': 'Talent management & HR operations',
      'Benefits available under chapter VI (Maternity Benefit) of Code on Social Security, 2020 (in case of women employee)': 'Applicable as per Maternity Benefit Act',
      'Any other information': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointment_Letters');
  XLSX.writeFile(workbook, 'Sample_Appointment_Letters_Format.xlsx');
}

// ── Download Sample Form V Wage Slips Template (.xlsx) ──
export function downloadWageTemplate() {
  const headers = [
    '1. Name of employee',
    "2. Father's/Mother's/Spouse Name",
    '3. Designation',
    '4. UAN',
    '5. Bank Account Number',
    '6a. Wage month',
    '6b. Wage Year',
    '7a.Rate of Basic',
    '7b. Rate of DA',
    '7c. Rate of Allowances',
    '8. Total attendance/unit of work done',
    '9. Overtime wages',
    '10. Gross wages payable',
    '11a. PF',
    '11b. ESI',
    '11c. Others',
    '12. Net wages paid'
  ];

  const sampleRows = [
    {
      '1. Name of employee': 'Rajesh Kumar',
      "2. Father's/Mother's/Spouse Name": 'Ramesh Kumar',
      '3. Designation': 'Senior Technician',
      '4. UAN': '100987654321',
      '5. Bank Account Number': '918273645012',
      '6a. Wage month': 'August',
      '6b. Wage Year': '2026',
      '7a.Rate of Basic': '25000',
      '7b. Rate of DA': '3000',
      '7c. Rate of Allowances': '2000',
      '8. Total attendance/unit of work done': '26',
      '9. Overtime wages': '1500',
      '10. Gross wages payable': '31500',
      '11a. PF': '1800',
      '11b. ESI': '250',
      '11c. Others': '0',
      '12. Net wages paid': '29450'
    },
    {
      '1. Name of employee': 'Sneha Patel',
      "2. Father's/Mother's/Spouse Name": 'Dinesh Patel',
      '3. Designation': 'Accountant',
      '4. UAN': '100456789123',
      '5. Bank Account Number': '564738291023',
      '6a. Wage month': 'August',
      '6b. Wage Year': '2026',
      '7a.Rate of Basic': '30000',
      '7b. Rate of DA': '4000',
      '7c. Rate of Allowances': '2500',
      '8. Total attendance/unit of work done': '25',
      '9. Overtime wages': '0',
      '10. Gross wages payable': '36500',
      '11a. PF': '2160',
      '11b. ESI': '275',
      '11c. Others': '0',
      '12. Net wages paid': '34065'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Wage_Slips');
  XLSX.writeFile(workbook, 'Sample_Form_V_Wage_Slips_Format.xlsx');
}

