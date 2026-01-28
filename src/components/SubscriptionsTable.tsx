"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SubscriptionWithStatus } from "@/src/types/db";
import {
  disableSubscription,
  enableSubscription
} from "@/src/app/subscriptions/actions";

type Row = SubscriptionWithStatus & {
  brand_name?: string;
  client_email?: string;
};

type DerivedStatus = "AKTIVAN" | "NEAKTIVAN" | "ISKLJUČEN";

const STATUS_LABELS: Record<DerivedStatus, string> = {
  AKTIVAN: "Aktivan",
  NEAKTIVAN: "Neaktivan",
  ISKLJUČEN: "Isključen"
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("hr-HR");
}

function deriveStatus(r: Row): DerivedStatus {
  if (r.manually_disabled) return "ISKLJUČEN";
  if (r.end_date && new Date(r.end_date) < new Date())
    return "NEAKTIVAN";
  return "AKTIVAN";
}

export function SubscriptionsTable({
  rows
}: {
  rows: Row[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams?.get("q") ?? "");
  const [status, setStatus] = useState<
    "" | DerivedStatus
  >("");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(`/subscriptions?${params.toString()}`);
  }, [q, router]);

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

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      {toast && (
        <div className="mb-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm">
          {toast}
        </div>
      )}

      {/* FILTERI */}
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
            onChange={(e) =>
              setStatus(e.target.value as any)
            }
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="">Svi statusi</option>
            <option value="AKTIVAN">Aktivni</option>
            <option value="NEAKTIVAN">Neaktivni</option>
            <option value="ISKLJUČEN">Isključeni</option>
          </select>
        </div>
      </div>

      {/* TABLICA */}
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
              <tr
                key={r.id}
                className="border-b border-zinc-900"
              >
                <td className="py-2 pr-4 font-medium">
                  <a
                    href={`/brands/${r.brand_id}`}
                    className="hover:text-purple-400 transition"
                  >
                    {r.brand_name}
                  </a>
                </td>

                <td className="py-2 pr-4 text-zinc-400">
                  {r.client_email ?? "—"}
                </td>

                <td className="py-2 pr-4 whitespace-nowrap">
                  {formatDate(r.start_date)} –{" "}
                  {formatDate(r.end_date)}
                </td>

                <td className="py-2 pr-4">
                  {STATUS_LABELS[r._derivedStatus]}
                </td>

                <td className="py-2 pr-4">
                  {r._derivedStatus === "ISKLJUČEN" ? (
                    <form
                      action={async (fd) => {
                        await enableSubscription(fd);
                        setToast(
                          `Brend "${r.brand_name}" je uključen.`
                        );
                        router.refresh();
                      }}
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={r.id}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs hover:bg-zinc-800"
                      >
                        Uključi
                      </button>
                    </form>
                  ) : (
                    <form
                      action={async (fd) => {
                        const ok = confirm(
                          `Jesi li siguran da želiš isključiti brend "${r.brand_name}"?`
                        );
                        if (!ok) return;

                        await disableSubscription(fd);
                        setToast(
                          `Brend "${r.brand_name}" je isključen.`
                        );
                        router.refresh();
                      }}
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={r.id}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs hover:bg-zinc-800"
                      >
                        Isključi
                      </button>
                    </form>
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
