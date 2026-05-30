# Appointment Letter Generator

A React web application that reads employee data from an Excel (.xlsx) file and generates individual appointment letters as Word (.docx) documents, following the statutory format prescribed under the **Code on Wages, 2019** and **Code on Social Security, 2020**.

---

## Features

- **Upload Excel** — drag & drop or file picker; supports `.xlsx` and `.xls`
- **Live data preview** — shows a table of parsed employee records before generating
- **Bulk generation** — generates one `.docx` letter per employee row with progress tracking
- **Individual download** — download any single letter with one click
- **Download All as ZIP** — bundle all letters into a single `.zip` archive
- **Search/filter** — quickly find a specific employee in the generated list
- **Validation warnings** — highlights missing required fields before generation

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| xlsx (SheetJS) | Parse Excel files in the browser |
| docx | Generate Word `.docx` files |
| jszip | Bundle letters into a `.zip` archive |
| file-saver | Trigger browser downloads |
| lucide-react | Icons |

---

## Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app opens at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

Outputs to the `build/` folder — ready to deploy on any static host (Netlify, Vercel, S3, etc.).

---

## Excel File Format

The input Excel file must have the following **exact column headers** in the first sheet:

| Column Header | Description |
|---|---|
| Name of employee | Full name |
| Date of birth | DD/MM/YYYY or any date format |
| Father's / Mother's name | Parent name |
| Aadhaar number | 12-digit Aadhaar |
| Labour Identification Number (LIN) of the establishment | Establishment LIN |
| Universal Account Number (UAN) and / or Insurance Number (ESIC) (if available) | UAN / ESIC |
| Designation | Job title |
| Type of Employment | Regular / Fixed-term-employment / Contractual |
| Category of Skill | Skilled / Semi-skilled / Unskilled etc. |
| Date of Joining | Joining date |
| Basic Pay | Basic pay amount |
| Dearness Allowance | DA amount |
| Other Allowance | Any other allowance |
| Applicability of social security benefits | EPFO / ESIC applicability |
| Broad nature of duties performed | Duties description |
| Benefits available under chapter VI (Maternity Benefit) of Code on Social Security, 2020 (in case of women employee) | Maternity benefits |
| Any other information | Additional info |

A sample template (`Appt_letter.xlsx`) is included in the repository.

---

## Project Structure

```
src/
├── components/
│   ├── UploadZone.jsx          # Drag-and-drop file upload
│   ├── UploadZone.module.css
│   ├── DataPreview.jsx         # Table preview of parsed rows
│   ├── DataPreview.module.css
│   ├── GeneratePanel.jsx       # Generate button + progress bar
│   ├── GeneratePanel.module.css
│   ├── LettersList.jsx         # Generated letters with download options
│   └── LettersList.module.css
├── utils/
│   ├── excelParser.js          # XLSX parsing + column mapping
│   └── docxGenerator.js        # DOCX document builder
├── App.jsx                     # Root component + state machine
├── App.module.css
├── index.js                    # React entry point
└── index.css                   # Global styles + CSS variables
```

---

## App State Flow

```
idle  →  parsing  →  previewing  →  generating  →  done
 ↑                                                   |
 └──────────────── Start Over ──────────────────────┘
```

---

## Customizing the Letter Template

Edit `src/utils/docxGenerator.js` to change:

- **`FIELD_DEFINITIONS`** — the fields rendered in the letter body (label, roman numeral, data key)
- **Opening / closing paragraphs** — static text wrapping the fields
- **Page size** — currently A4; change DXA values for Letter size
- **Fonts / colors** — `FONT`, `BODY_SIZE`, `TITLE_SIZE` constants at the top

---

## License

MIT
