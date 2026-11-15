"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importBakes } from "@/app/bakes/actions";
import { BAKE_FIELDS } from "@/lib/bakes";
import { readBakeCsv, toCsv } from "@/lib/csv";

// The headings a spreadsheet can use, offered as a template file.
const TEMPLATE_HEADINGS = [
  "date", "recipe", "flour_g", "water_g", "sugar_g", "fat_g", "leavener",
  "hydration_%", "oven_temp", "bake_time", "rise/spread", "texture",
  "rating 1-5", "what went wrong", "notes",
];

// Saves text as a file in the browser (see ExportButton.js).
function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Import a bake log from a CSV file (or pasted text): read it, show what
// will be added and what's wrong, then add everything in one go.
export default function ImportBakes() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // "idle", "saving" or an error

  // Worked out again whenever the text changes
  const result = text.trim() === "" ? null : readBakeCsv(text);
  const goodRows = result ? result.rows.filter((row) => row.bake) : [];
  const badRows = result ? result.rows.filter((row) => row.error) : [];
  const canImport = result && !result.missing && goodRows.length > 0 && badRows.length === 0;

  // Reading a chosen file: file.text() gives its contents as text
  async function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
      setText(await file.text());
      setStatus("idle");
    }
  }

  async function handleImport() {
    setStatus("saving");
    const response = await importBakes(goodRows.map((row) => row.bake));
    if (response.error) {
      setStatus(response.error);
      return;
    }
    router.push("/bakes");
    router.refresh();
  }

  // Columns to show in the preview: only fields that have a value somewhere
  const shownFields = BAKE_FIELDS.filter((item) => goodRows.some((row) => row.bake[item.key] !== null));

  return (
    <div className="grid gap-8">
      <div className="note tape panel">
        <h2 className="panel-title">1. Choose the file</h2>
        <p className="mt-2 max-w-xl text-muted">
          Export your spreadsheet as CSV (File → Download → CSV, or Save As →
          CSV). The first row must be the column names. Dates as YYYY-MM-DD.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="btn-quiet cursor-pointer">
            Choose a CSV file
            {/* The real file input is hidden; the label opens it */}
            <input type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={handleFile} />
          </label>
          <button
            type="button"
            className="font-mono text-sm underline underline-offset-4"
            onClick={() => download(toCsv([TEMPLATE_HEADINGS]), "bake-log-template.csv")}
          >
            Download a template
          </button>
        </div>
        <label htmlFor="import-text" className="label mt-5 block">Or paste it here</label>
        <textarea
          id="import-text"
          className="field mt-1 font-mono text-sm"
          rows="6"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setStatus("idle");
          }}
          placeholder={"date,recipe,hydration_%,rating 1-5\n2026-01-03,Sourdough,75,4"}
        />
      </div>

      {result && (
        <div className="note tape panel" aria-live="polite">
          <h2 className="panel-title">2. Check it</h2>

          {result.missing && (
            <p role="alert" className="alert mt-4">
              No column says what was baked. Add one called “recipe” (or “title”).
            </p>
          )}
          {result.ignored.length > 0 && (
            <p className="mt-3 text-sm text-muted">
              Columns that will be skipped: {result.ignored.join(", ")}.
            </p>
          )}
          {badRows.length > 0 && (
            <div role="alert" className="alert mt-4">
              <p>Fix these rows in the file, then choose it again:</p>
              <ul className="mt-1 list-disc pl-5 font-normal">
                {badRows.slice(0, 10).map((row) => (
                  <li key={row.line}>Line {row.line}: {row.error}</li>
                ))}
              </ul>
              {badRows.length > 10 && <p className="mt-1">…and {badRows.length - 10} more.</p>}
            </div>
          )}

          <p className="mt-4 font-mono">
            <b className="tabular-nums">{goodRows.length}</b> {goodRows.length === 1 ? "bake" : "bakes"} ready
          </p>

          {goodRows.length > 0 && (
            // A wide table scrolls sideways inside its own box
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-[1.5px] border-foreground">
                    {shownFields.map((item) => (
                      <th key={item.key} scope="col" className="label whitespace-nowrap px-2 py-1.5 text-left font-normal">
                        {item.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goodRows.slice(0, 8).map((row) => (
                    <tr key={row.line} className="border-b border-line">
                      {shownFields.map((item) => (
                        <td key={item.key} className="max-w-48 truncate whitespace-nowrap px-2 py-1.5 font-mono">
                          {row.bake[item.key] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {goodRows.length > 8 && (
                <p className="mt-2 text-sm text-muted">Showing the first 8.</p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" className="btn" disabled={!canImport || status === "saving"} onClick={handleImport}>
              {status === "saving" ? "Importing…" : `Import ${goodRows.length} ${goodRows.length === 1 ? "bake" : "bakes"}`}
            </button>
            <p className="text-sm text-muted">Nothing is added until every row is right.</p>
          </div>
          {status !== "idle" && status !== "saving" && (
            <p role="alert" className="alert mt-4">{status}</p>
          )}
        </div>
      )}
    </div>
  );
}
