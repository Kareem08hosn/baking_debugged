// Reading and writing CSV (comma-separated values), the plain-text format
// spreadsheets export. Used to import and export the bake log.
// Tested in lib/csv.test.js.
import { BAKE_FIELDS, validateBake } from "./bakes.js";

// Splits CSV text into rows of cells. Handles quoted cells ("a, b"),
// doubled quotes inside them (""), and Windows line endings. The separator
// is guessed from the first line: comma, semicolon (European spreadsheets)
// or tab.
export function parseCsv(text) {
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const separators = [",", ";", "\t"];
  const separator = separators.reduce((best, candidate) =>
    firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best
  );

  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  // Walk through the text one character at a time.
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'; // "" inside quotes is one quote character
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === separator) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1; // \r\n counts as one line break
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  // The last cell and row, if the text doesn't end with a line break
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  // Drop completely empty lines
  return rows.filter((cells) => cells.some((value) => value.trim() !== ""));
}

// Turns rows of cells into CSV text. A cell is quoted only if it needs to
// be (it contains a comma, a quote or a line break).
export function toCsv(rows) {
  const quote = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return rows.map((row) => row.map(quote).join(",")).join("\n");
}

// "Hydration_%" -> "hydration %": lowercase, underscores and runs of spaces
// become single spaces, so headings match however they were typed.
function normalizeHeading(heading) {
  return heading.toLowerCase().replace(/[_\s]+/g, " ").trim();
}

// Works out which bake field each spreadsheet column holds.
// Returns a list the same length as the headings: a field key, or null for
// a column that isn't recognised.
export function mapHeadings(headings) {
  return headings.map((heading) => {
    const wanted = normalizeHeading(heading);
    const field = BAKE_FIELDS.find(
      (candidate) =>
        candidate.key.toLowerCase() === wanted.replace(/ /g, "") ||
        normalizeHeading(candidate.column) === wanted ||
        candidate.csv.some((alias) => normalizeHeading(alias) === wanted)
    );
    return field ? field.key : null;
  });
}

// Reads a whole bake log spreadsheet (as CSV text). The first row must be
// the headings. Returns:
//   rows      [{ line, bake }] for good rows, [{ line, error }] for bad ones
//   ignored   headings that weren't recognised
//   missing   true if there's no column saying what was baked
export function readBakeCsv(text) {
  const [headings = [], ...dataRows] = parseCsv(text);
  const keys = mapHeadings(headings);
  const ignored = headings.filter((heading, index) => keys[index] === null && heading.trim() !== "");
  const missing = !keys.includes("title");

  const rows = dataRows.map((cells, index) => {
    const input = {};
    keys.forEach((key, column) => {
      if (key) {
        input[key] = cells[column] ?? "";
      }
    });
    // +2: the headings are line 1, and people count from 1, not 0
    const line = index + 2;
    const { bake, error } = validateBake(input);
    return error ? { line, error } : { line, bake };
  });

  return { rows, ignored, missing };
}

// The bake log as CSV text, with one column per field (database names, so
// pandas in Phase 4 gets tidy column names).
export function bakesToCsv(bakes) {
  const header = ["id", "recipe_id", ...BAKE_FIELDS.map((field) => field.column)];
  const rows = bakes.map((bake) => [bake.id, bake.recipeId, ...BAKE_FIELDS.map((field) => bake[field.key])]);
  return toCsv([header, ...rows]);
}
