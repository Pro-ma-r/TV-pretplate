"use client";

import { useMemo, useState } from "react";
import type { SubscriptionWithStatus } from "@/src/types/db";
import { ExportButtons } from "./ExportButtons";

export function SubscriptionsTable({
  rows,
  brands,
  packages,
  canCreate,
  onDisable,
  onCreate
}: {
  rows: Array<SubscriptionWithStatus & { brand_name?: string; package_name?: string }>;
  brands: Array<{ id: string; name: string }>;
  packages: Array<{ id: string; name: string }>;
  canCreate: boolean;
  onDisable: (id: string) => Promise<void>;
  onCreate: (payload: {
    brand_id: string;
    package_id: string;
    start_date: string;
    end_date: string;
    payment_date?: string;
    note?: string;
  }) => Promise<void>;
}) {

  rows: Array<SubscriptionWithStatus & { brand_name?: string; package_name?: string }>;
  canCreate: boolean;
  onDisable: (id: string) => Promise<void>;
  onCreate: (payload: { brand_id: string; package_id: string; start_date: string; end_date: string; payment_date?: string; note?: string }) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | SubscriptionWithStatus["status"]>("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const hay = `${r.brand_name ?? ""} ${r.package_name ?? ""} ${r.note ?? ""}`.toLowerCase();
      if (q && !hay.includes(q.toLowerCase())) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [rows, q, status]);

  const exportRows = filtered.map((r) => ({
    brand: r.brand_name ?? r.brand_id,
    paket: r.package_name ?? r.package_id,
    od: r.start_date,
    do: r.end_date,
    status: r.status,
    napomena: r.note ?? ""
  }));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (brand, paket, napomena)"
            className="w-72 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          >
            <option value="">Svi statusi</option>
            <option value="AKTIVNA">AKTIVNA</option>
            <option value="NEAKTIVNA">NEAKTIVNA</option>
            <option value="ISKLJUCENA">ISKLJUCENA</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButtons filename="pretplate" rows={exportRows} />
          {canCreate && (
            <button
              onClick={() => setCreating((v) => !v)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
            >
              Nova pretplata
            </button>
          )}
        </div>
      </div>

      {creating && canCreate && (
        <CreateForm
          onCreate={async (p) => {
            await onCreate(p);
            setCreating(false);
          }}
        />
      )}

      <div className="mt-4 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-300">
            <tr className="border-b border-zinc-800">
              <th className="py-2 pr-4">Brend</th>
              <th className="py-2 pr-4">Paket</th>
              <th className="py-2 pr-4">OD</th>
              <th className="py-2 pr-4">DO</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Akcija</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-zinc-900">
                <td className="py-2 pr-4">{r.brand_name ?? r.brand_id}</td>
                <td className="py-2 pr-4">{r.package_name ?? r.package_id}</td>
                <td className="py-2 pr-4">{r.start_date}</td>
                <td className="py-2 pr-4">{r.end_date}</td>
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2 pr-4">
                  {r.status !== "ISKLJUCENA" ? (
                    <button
                      onClick={() => onDisable(r.id)}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs hover:bg-zinc-800"
                    >
                      Isključi
                    </button>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 text-xs text-zinc-400">
          Prikazano: {filtered.length} / {rows.length}
        </div>
      </div>
    </div>
  );
}

function CreateForm({
  brands,
  packages,
  onCreate
}: {
  brands: Array<{ id: string; name: string }>;
  packages: Array<{ id: string; name: string }>;
  onCreate: (payload: {
    brand_id: string;
    package_id: string;
    start_date: string;
    end_date: string;
    payment_date?: string;
    note?: string;
  }) => Promise<void>;
}) {
  const [brand_id, setBrandId] = useState("");
  const [package_id, setPackageId] = useState("");
  const [start_date, setStart] = useState("");
  const [end_date, setEnd] = useState("");
  const [payment_date, setPay] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          value={brand_id}
          onChange={(e) => setBrandId(e.target.value)}
        >
          <option value="">Odaberi brend</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          value={package_id}
          onChange={(e) => setPackageId(e.target.value)}
        >
          <option value="">Odaberi paket</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="OD (YYYY-MM-DD)"
          value={start_date}
          onChange={(e) => setStart(e.target.value)}
        />

        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="DO (YYYY-MM-DD)"
          value={end_date}
          onChange={(e) => setEnd(e.target.value)}
        />

        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="Datum plaćanja (opcionalno)"
          value={payment_date}
          onChange={(e) => setPay(e.target.value)}
        />

        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="Napomena (opcionalno)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        disabled={!brand_id || !package_id || !start_date || !end_date}
        onClick={() =>
          onCreate({
            brand_id,
            package_id,
            start_date,
            end_date,
            payment_date: payment_date || undefined,
            note: note || undefined
          })
        }
        className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
      >
        Kreiraj pretplatu
      </button>
      </div>
  );
}
