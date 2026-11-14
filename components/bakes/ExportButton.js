"use client";

import { bakesToCsv } from "@/lib/csv";
import { today } from "@/lib/bakes";

// Downloads the bake log as a CSV file, built in the browser. A spreadsheet
// or pandas (Phase 4) can open it.
export default function ExportButton({ bakes }) {
  function handleClick() {
    // A Blob is a file held in memory. createObjectURL gives it a temporary
    // address; clicking a hidden link with "download" saves it.
    const blob = new Blob([bakesToCsv(bakes)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bake-log-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(url); // free the memory
  }

  return (
    <button type="button" className="btn-quiet" onClick={handleClick} disabled={bakes.length === 0}>
      Export CSV
    </button>
  );
}
