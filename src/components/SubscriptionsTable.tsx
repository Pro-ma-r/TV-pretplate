"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SubscriptionWithStatus } from "@/src/types/db";
import { ExportButtons } from "./ExportButtons";

type Row = SubscriptionWithStatus & {
  brand_name?: string;
  client_email?: string;
};

type DerivedStatus = "AKTIVNA" | "NEAKTIVNA" | "ISKLJUCENA";

const STATUS_LABELS: Record<DerivedStatus, string> = {
  AKTIVNA: "Aktivan",
  NEAKTIVNA: "Neaktivan",
  ISKLJUCENA: "Isključen"
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("hr-HR");
}

function deriveStatus(r: Row): DerivedStatus {
  if (r.manually_disabled) return "ISKLJUCENA";
  if (r.end_date && new Date(r.end_date) < new Date()) return "NEAKTIVNA";
  return "AKTIVNA";
}

export function SubscriptionsTable({
  rows,
  brands,
  packages,
  canCreate,
  onDisable,
  onCreate
}: {
  rows: Row[];
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
  const [status, setStatus] = useState<"" | DerivedStatus>("");
  const [creating, setCreating] = useState(false);

  // sync search → URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");

    router.replace(`/subscriptions?${params.toString()}`);
  }, [q]);

  const rowsWithStatus = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      _derivedStatus: deriveStatus(r)
    }));
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!status) return rowsWithStatus;
    return rowsWithStatus.filter(
      (r) => r._derivedStatus === status
    );
  }, [rowsWithStatus, status]);

  const exportRows = filteredRows.map((r) => ({
    brend: r.brand_name,
    email: r.client_email ?? "",
    status: STATUS_LABELS[r._derivedStatus],
    od: formatDate(r.start_date),
    do: formatDate(r.end_date)
  }));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraži: email, brend, napomena"
            className="w-80 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="">Svi statusi</option>
            <option value="AKTIVNA">Aktivne</option>
            <option value="NEAKTIVNA">Neaktivne</option>
            <option value="ISKLJUCENA">Isključene</option>
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

      <div className="mt-4 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-300">
            <tr className="border-b border-zinc-800">
              <th className="py-2 pr-4">Brend</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Period</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Akcija</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            {filteredRows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-900">
                <td className="py-2 pr-4 font-medium hover:underline cursor-pointer">
                  {r.brand_name}
                </td>
                <td className="py-2 pr-4 text-zinc-400">
                  {r.client_email ?? "—"}
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  {formatDate(r.start_date)} – {formatDate(r.end_date)}
                </td>
                <td className="py-2 pr-4">
                  {STATUS_LABELS[r._derivedStatus]}
                </td>
                <td className="py-2 pr-4">
                  {r._derivedStatus !== "ISKLJUCENA" ? (
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
          Prikazano: {filteredRows.length}
        </div>
      </div>
    </div>
  );
}
