import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType,
  ShadingType, Header, Footer, PageNumber, convertInchesToTwip
} from "docx";
import { writeFileSync } from "fs";
import JSZip from "../node_modules/jszip/dist/jszip.js";

// Clean numbering.xml — uses proper Unicode bullet (U+2022) with no font dependency.
// The docx library generates this with garbled Wingdings characters that cause Word
// to reject the file; we replace it after generation.
const CLEAN_NUMBERING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\
<w:numbering xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" \
xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" \
xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" \
xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" \
xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" \
mc:Ignorable="w14 w15">\
<w:abstractNum w:abstractNumId="1" w15:restartNumberingAfterBreak="0">\
<w:multiLevelType w:val="hybridMultilevel"/>\
<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#x2022;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr></w:lvl>\
<w:lvl w:ilvl="1"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#x25E6;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="1440" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr></w:lvl>\
<w:lvl w:ilvl="2"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#x25AA;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="2160" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr></w:lvl>\
</w:abstractNum>\
<w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>\
</w:numbering>`;

async function patchAndWrite(buffer, outPath) {
  const zip = await JSZip.loadAsync(buffer);
  if (zip.files["word/numbering.xml"]) {
    zip.file("word/numbering.xml", CLEAN_NUMBERING_XML);
  }
  const patched = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  writeFileSync(outPath, patched);
}

const BRAND_BLUE = "1F3864";
const ACCENT_BLUE = "2E75B6";
const LIGHT_BLUE = "D6E4F0";
const LIGHT_GRAY = "F2F2F2";
const WHITE = "FFFFFF";
const DARK_TEXT = "1A1A1A";

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    run: { color: BRAND_BLUE, bold: true, size: 32 },
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: ACCENT_BLUE })],
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_BLUE, space: 4 } },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: BRAND_BLUE })],
    spacing: { before: 280, after: 120 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 21, color: DARK_TEXT })],
    spacing: { before: 80, after: 80 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bullet(text, level = 0) {
  const markers = ["\u2022", "\u25E6", "\u25AA"];
  const marker = markers[level] ?? "\u2022";
  return new Paragraph({
    children: [
      new TextRun({ text: marker, size: 21, color: DARK_TEXT }),
      new TextRun({ text: "\t" + text, size: 21, color: DARK_TEXT }),
    ],
    spacing: { before: 60, after: 60 },
    indent: { left: 360 + level * 360, hanging: 240 },
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 21, color: DARK_TEXT });
}

function note(text) {
  return new Paragraph({
    children: [new TextRun({ text: `Note: ${text}`, italics: true, size: 20, color: "666666" })],
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
  });
}

function spacer() {
  return new Paragraph({ text: "", spacing: { before: 80, after: 80 } });
}

function makeTable(headers, rows, headerBg = BRAND_BLUE, headerColor = WHITE) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: h, bold: true, color: headerColor, size: 20 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 80 },
        })],
        shading: { type: ShadingType.CLEAR, fill: headerBg },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      })
    ),
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: cell, size: 20, color: DARK_TEXT })],
            spacing: { before: 60, after: 60 },
          })],
          shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? LIGHT_GRAY : WHITE },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });
}

function callout(label, text, bg = LIGHT_BLUE, labelColor = BRAND_BLUE) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}  `, bold: true, size: 21, color: labelColor }),
      new TextRun({ text, size: 21, color: DARK_TEXT }),
    ],
    shading: { type: ShadingType.CLEAR, fill: bg },
    spacing: { before: 120, after: 120 },
    indent: { left: 240, right: 240 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: labelColor, space: 8 },
    },
  });
}

// ─── DOCUMENT ────────────────────────────────────────────────────────────────

const doc = new Document({
  numbering: { config: [] },
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 21, color: DARK_TEXT },
        paragraph: { spacing: { line: 276 } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.2),
            right: convertInchesToTwip(1.2),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "HRIS — Database Normalization Rationale", size: 18, color: "888888" }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "HRIS Development Team  •  April 2026  •  Page ", size: 18, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
                new TextRun({ text: " of ", size: 18, color: "888888" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "888888" }),
              ],
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
            }),
          ],
        }),
      },
      children: [

        // ── TITLE BLOCK ──────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: "Database Normalization", bold: true, size: 52, color: BRAND_BLUE })],
          spacing: { before: 0, after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Why We Need a New Table Structure", bold: true, size: 36, color: ACCENT_BLUE })],
          spacing: { before: 0, after: 200 },
        }),
        makeTable(
          [],
          [
            ["Prepared for", "HR Department / Management"],
            ["Date", "April 14, 2026"],
            ["Prepared by", "HRIS Development Team"],
            ["Subject", "Migration from flat employee_masterlist to normalized relational tables"],
          ]
        ),
        spacer(),
        spacer(),

        // ── SECTION 1 ────────────────────────────────────────────────────────
        h2("1.  The Problem with the Current System"),
        body(
          "The existing employee_masterlist table stores everything about every employee in a single, flat row — over 120 columns per employee. " +
          "Fields like DEPARTMENT, EMPPOSITION, JOB_TITLE, COMPANY, TEAM, and EMPSTATUS are stored as raw text (VARCHAR strings). " +
          "There is no link to any master reference table and no single authority that defines what a valid position, department, or job title is."
        ),
        spacer(),
        body("A typical row looks like this:"),
        spacer(),
        makeTable(
          ["EMPID", "EMPNAME", "EMPPOSITION", "DEPARTMENT", "JOB_TITLE"],
          [
            ["1001", "Juan Dela Cruz", "Team Leader", "Information Technology", "IT Team Leader"],
            ["1002", "Maria Santos", "Team Leader", "Information Technology", "IT Team Leader"],
            ["1003", "Pedro Reyes", "Team Leader", "Human Resources", "HR Team Leader"],
          ]
        ),
        spacer(),
        body(
          "These values are plain text — not numbers, not references, just typed words saved into the database. " +
          "Any connected system that reads or writes to this table must use that exact same text to find matching records."
        ),
        spacer(),

        // ── SECTION 2 ────────────────────────────────────────────────────────
        h2("2.  How Other Systems Write to the Masterlist Today"),
        body(
          "The HRIS does not operate alone. Multiple external systems — payroll, attendance, timekeeping, biometrics, and others — " +
          "read from and write to the employee_masterlist. Each of those systems stores its own copy of position, department, and job title names as text."
        ),
        spacer(),
        callout(
          "Critical Point:",
          "When a position or department name is changed in one system, no other system knows about it automatically. " +
          "Each system is simply comparing strings — if the strings don't match exactly, the systems no longer agree on who an employee is or what role they hold.",
          LIGHT_BLUE, ACCENT_BLUE
        ),
        spacer(),
        body("Consider this real-world scenario:"),
        spacer(),
        makeTable(
          ["System", "What it stores for the position", "After a rename in Payroll"],
          [
            ["Payroll System", "\"Team Leader\"", "\"Section Head\" ✓ Updated"],
            ["Attendance System", "\"Team Leader\"", "\"Team Leader\" ✗ Still old value"],
            ["Timekeeping System", "\"Team Leader\"", "\"Team Leader\" ✗ Still old value"],
            ["Biometrics System", "\"Team Leader\"", "\"Team Leader\" ✗ Still old value"],
            ["HRIS Masterlist", "\"Team Leader\"", "\"Team Leader\" ✗ Still old value"],
          ]
        ),
        spacer(),
        body(
          "After the rename, Payroll now describes these employees as \"Section Head\" but every other system still calls them \"Team Leader\". " +
          "Cross-system reports that try to match employees by position will produce wrong results or fail to match records entirely. " +
          "There is no automated way to fix this — someone must manually track down every system and update each one individually, " +
          "and there is no guarantee they will all be updated consistently."
        ),
        spacer(),
        callout(
          "Why this happens:",
          "Because the position name is stored as a VARCHAR string in every system independently, there is no shared reference. " +
          "Changing it in one place has zero effect on any other place.",
          "FFF3CD", "856404"
        ),
        spacer(),

        // ── SECTION 3 ────────────────────────────────────────────────────────
        h2("3.  The Five Real Problems This Creates"),

        h3("Problem 1 — Cross-System Data Becomes Inconsistent"),
        body(
          "When any external system updates a position or department name independently, all other systems immediately fall out of sync. " +
          "HR reports that pull from multiple systems will show conflicting data for the same employees. " +
          "There is no automated reconciliation — the inconsistency is silent and permanent until manually discovered and corrected."
        ),

        h3("Problem 2 — Typos and Variations Become Permanent"),
        body("Because there is no reference table enforcing valid values, data entry errors are saved as-is and treated as different values:"),
        bullet("\"Human Resource\"  vs  \"Human Resources\"  vs  \"HR\""),
        bullet("\"I.T.\"  vs  \"IT\"  vs  \"Information Technology\""),
        bullet("\"Regular\"  vs  \"Regularized\"  vs  \"regular\""),
        body(
          "Each variation is treated as a completely different department or status by any system reading the data. " +
          "A headcount report grouping by department will silently count these as separate departments."
        ),

        h3("Problem 3 — Renaming Requires Coordinated Manual Updates Across All Systems"),
        body(
          "If management renames \"Team Leader\" to \"Section Head\", the IT team must coordinate updates across every connected system — " +
          "HRIS, payroll, attendance, timekeeping, biometrics, and any future systems. " +
          "Each system must be updated separately. Any system that is missed continues showing the old name indefinitely. " +
          "This is not a one-time problem — it happens every time any position, department, or status name changes."
        ),

        h3("Problem 4 — Reports Are Unreliable"),
        body(
          "Any report that groups or filters employees by position, department, or status is vulnerable to string-matching errors. " +
          "Employees with slightly different spellings of the same value are counted separately. " +
          "Management receives headcount and analytics data that appears correct but contains silent errors."
        ),

        h3("Problem 5 — Integration with New Systems Is Expensive"),
        body(
          "Every new system that integrates with the HRIS must build its own mapping logic to reconcile the various text strings it encounters. " +
          "This adds development cost, maintenance burden, and ongoing risk of mapping errors to every integration project."
        ),
        spacer(),

        // ── SECTION 4 ────────────────────────────────────────────────────────
        h2("4.  What Normalization Means — In Plain Terms"),
        body(
          "Instead of storing the name of a department or position directly in each employee record, " +
          "we store a reference number (ID) that points to a single lookup table. " +
          "All systems — HRIS, payroll, attendance, timekeeping — reference the same ID."
        ),
        spacer(),
        h3("Before (flat — current state)"),
        makeTable(
          ["Table", "Column", "Stored Value"],
          [
            ["employee_masterlist", "DEPARTMENT", "\"Information Technology\""],
            ["payroll_employees", "department", "\"Information Technology\""],
            ["attendance_records", "dept_name", "\"Information Technology\""],
          ]
        ),
        spacer(),
        note(
          "Three separate text values. If one system renames the department, the others do not update automatically."
        ),
        spacer(),
        h3("After (normalized — proposed structure)"),
        makeTable(
          ["Table", "Column", "Stored Value"],
          [
            ["departments", "id = 5, name", "\"Information Technology\"  ← ONE place"],
            ["employee_work_details", "department_id", "5"],
            ["payroll_employees", "department_id", "5"],
            ["attendance_records", "department_id", "5"],
          ]
        ),
        spacer(),
        callout(
          "The result:",
          "If management renames the department, the name is changed once in the departments table. " +
          "Every system that references department_id = 5 automatically sees the new name. " +
          "No other system needs to be updated. No coordination required. No risk of inconsistency.",
          "D4EDDA", "155724"
        ),
        spacer(),

        // ── SECTION 5 ────────────────────────────────────────────────────────
        h2("5.  The New Normalized Structure"),
        body("The new system splits the masterlist into focused tables, each with a clear responsibility:"),
        spacer(),
        h3("Core Employee Tables"),
        makeTable(
          ["Table", "What It Stores"],
          [
            ["employee_details", "Personal info: name, birthday, civil status, contact, address"],
            ["employee_work_details", "Work info: position, department, company, status, hire/separation dates"],
            ["employee_family", "Family members: parents, spouse, children"],
            ["employee_government_ids", "SSS, TIN, PhilHealth, Pag-IBIG, bank account"],
            ["employee_education", "Educational attainment records"],
            ["employee_leave_credits", "Leave balances per type"],
            ["employee_hmo", "HMO membership and certificate details"],
          ]
        ),
        spacer(),
        h3("Shared Lookup Tables (used by all systems)"),
        makeTable(
          ["Table", "What It Defines"],
          [
            ["positions", "All valid positions — id + name"],
            ["job_titles", "All valid job titles — id + name"],
            ["departments", "All valid departments — id + name"],
            ["companies", "All valid companies — id + name"],
            ["employment_statuses", "Regular, Probationary, Contractual, etc."],
            ["employment_classes", "Rank & File, Supervisory, Managerial, etc."],
            ["shift_types", "Day shift, Night shift, Mid-shift, etc."],
          ]
        ),
        spacer(),
        body(
          "These lookup tables are the single source of truth. Any system that integrates with the HRIS reads the canonical name from these tables via the shared ID. " +
          "HR Administrators manage these tables through the Lookup Maintenance page — no developer intervention required for adding or renaming values."
        ),
        spacer(),

        // ── SECTION 6 ────────────────────────────────────────────────────────
        h2("6.  Scenario-by-Scenario Comparison"),

        h3("Scenario A — Renaming a Position Company-Wide"),
        makeTable(
          ["", "Current System", "New System"],
          [
            ["Who acts", "IT Developer", "HR Administrator"],
            ["What happens",
              "Developer runs a database update script across the HRIS masterlist. Then contacts payroll, attendance, timekeeping, and biometrics teams to do the same in their systems. Each system is updated on its own schedule.",
              "HR Administrator opens Lookup Maintenance → edits the position name → saves. Done."],
            ["Risk",
              "Any system not updated in time shows the old name. Cross-system reports break silently.",
              "No risk. All systems share the same ID and see the updated name instantly."],
            ["Time required", "Hours to days, across multiple teams", "Under one minute, by HR"],
          ]
        ),
        spacer(),

        h3("Scenario B — Renaming a Department"),
        makeTable(
          ["", "Current System", "New System"],
          [
            ["Who acts", "IT Developer (coordinates with all system owners)", "HR Administrator"],
            ["What happens",
              "Must update the string in every connected system's database. Risk of missed systems, typos, or partial updates.",
              "Update the name once in the departments lookup table. All systems reflect the change automatically."],
            ["Risk", "High — data inconsistency across systems is likely", "None — single source of truth"],
          ]
        ),
        spacer(),

        h3("Scenario C — Integrating a New System"),
        makeTable(
          ["", "Current System", "New System"],
          [
            ["Challenge",
              "New system must parse free-text strings and build its own mapping to understand what \"I.T.\" means vs \"IT\" vs \"Information Technology\".",
              "New system reads department_id from employee records and calls the HRIS lookup API to get the canonical name."],
            ["Result", "Fragile mapping that breaks whenever a name changes", "Reliable integration that always reflects current names"],
          ]
        ),
        spacer(),

        // ── SECTION 7 ────────────────────────────────────────────────────────
        h2("7.  What Happens to Existing Data"),
        body("The existing employee_masterlist data will be migrated — not deleted. The migration process:"),
        bullet("Extracts all unique values from VARCHAR columns and inserts them into the appropriate lookup tables"),
        bullet("Updates each employee record to store the corresponding ID instead of the text string"),
        bullet("Retains the original flat table as a read-only archive until the new system is fully validated"),
        bullet("All connected systems are updated to reference IDs instead of text strings as part of the migration"),
        spacer(),
        callout(
          "Assurance:",
          "No historical data is lost. The migration is planned and reversible during the transition period. " +
          "All connected systems will be updated in coordination to ensure zero downtime.",
          "D4EDDA", "155724"
        ),
        spacer(),

        // ── SECTION 8 ────────────────────────────────────────────────────────
        h2("8.  Summary"),
        makeTable(
          ["", "Old Flat Masterlist", "New Normalized Structure"],
          [
            ["Rename a position", "Update records in every system manually", "Change 1 row in lookup table — all systems update instantly"],
            ["Cross-system consistency", "Not guaranteed — systems can diverge silently", "Guaranteed — all systems share the same ID"],
            ["Data entry validation", "Any text accepted — typos persist permanently", "Only valid IDs accepted — enforced by the database"],
            ["Report accuracy", "String-matching errors produce wrong counts", "Exact ID-based grouping — always accurate"],
            ["Integration with new systems", "Each system builds its own text-mapping logic", "All systems reference the same lookup tables"],
            ["HR self-service", "Requires IT developer for any name change", "HR manages lookups directly via Maintenance page"],
            ["Performance", "120+ columns fetched per query", "Lean tables — queries fetch only what is needed"],
          ]
        ),
        spacer(),
        body(
          "The normalized structure is the industry-standard approach to managing employee data reliably. " +
          "It eliminates the cross-system inconsistency problem at its root by replacing free-text strings with shared reference IDs. " +
          "Every future integration — payroll, attendance, timekeeping, benefits, biometrics, and any new systems — " +
          "will work accurately and automatically, without manual coordination or reconciliation effort."
        ),
        spacer(),
        spacer(),
        new Paragraph({
          children: [new TextRun({ text: "For technical questions, contact the HRIS Development Team.", italics: true, size: 20, color: "888888" })],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 8 } },
          spacing: { before: 200, after: 0 },
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer =>
  patchAndWrite(buffer, "docs/HR_Database_Normalization_Rationale.docx")
).then(() => {
  console.log("Done: docs/HR_Database_Normalization_Rationale.docx");
});
