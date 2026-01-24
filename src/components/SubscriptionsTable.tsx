"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  rows: Array<
    SubscriptionWithStatus & {
      brand_name?: string;
      package_name?: string;
      client_email?: string;
    }
  >;
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [creating, setCreating] = useState(false);

  // 🔑 KLJUČNO: sync input → URL → backend
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");

    router.replace(`/subscriptions?${params.toString()}`);
  }, [q]);

  const exportRows = rows.map((r) => ({
    brand: r.brand_name ?? r.brand_id,
    paket: r.package_name ?? r.package_id,
    email: r.client_email ?? "",
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
            placeholder="Pretraži: email, brend, paket, napomena"
            className="w-80 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          />
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
          brands={brands}
          packages={packages}
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
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">OD</th>
              <th className="py-2 pr-4">DO</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Akcija</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-900">
                <td className="py-2 pr-4">{r.brand_name}</td>
                <td className="py-2 pr-4">{r.package_name}</td>
                <td className="py-2 pr-4 text-zinc-400">
                  {r.client_email ?? "—"}
                </td>
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
          Prikazano: {rows.length}
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
          placeholder="Datum plaćanja"
          value={payment_date}
          onChange={(e) => setPay(e.target.value)}
        />

        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          placeholder="Napomena"
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
