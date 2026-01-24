"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ExportButtons({
  filename,
  rows
}: {
  filename: string;
  rows: Array<Record<string, any>>;
}) {
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const head = [Object.keys(rows[0] ?? {})];
    const body = rows.map((r) => Object.keys(rows[0] ?? {}).map((k) => String(r[k] ?? "")));

    autoTable(doc, {
      head,
      body
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <button onClick={exportExcel} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800">
        Export Excel
      </button>
      <button onClick={exportPdf} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800">
        Export PDF
      </button>
    </div>
  );
}
