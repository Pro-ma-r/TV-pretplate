"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExportButtons } from "./ExportButtons";

type BrandStatus = "AKTIVAN" | "NEAKTIVAN" | "ISKLJUCEN";

type BrandRow = {
  brand_id: string;
  brand_name: string;
  email?: string;
  status: BrandStatus;
};

const STATUS_LABELS: Record<BrandStatus, string> = {
  AKTIVAN: "Aktivan",
  NEAKTIVAN: "Neaktivan",
  ISKLJUCEN: "Isključen"
};

export function SubscriptionsTable({
  rows,
  canCreate
}: {
  rows: BrandRow[];
  canCreate: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams?.get("q") ?? "");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(`/subscriptions?${params.toString()}`);
  }, [q, router]);

  const filteredRows = useMemo(() => {
    if (!q) return rows;
    const qq = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.brand_name.toLowerCase().includes(qq) ||
        (r.email ?? "").toLowerCase().includes(qq)
    );
  }, [rows, q]);

  const exportRows = filteredRows.map((r) => ({
    brend: r.brand_name,
    email: r.email ?? "",
    status: STATUS_LABELS[r.status]
  }));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pretraži: brend ili email"
          className="w-80 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
        />

        <ExportButtons filename="pretplate" rows={exportRows} />
      </div>

      <div className="mt-4 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-300">
            <tr className="border-b border-zinc-800">
              <th className="py-2 pr-4">Brend</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Akcija</th>
            </tr>
          </thead>

          <tbody className="text-zinc-200">
            {filteredRows.map((r) => (
              <tr key={r.brand_id} className="border-b border-zinc-900">
                <td className="py-2 pr-4 font-medium">
                  <Link
                    href={`/brands/${r.brand_id}`}
                    className="text-zinc-200 hover:text-purple-400 transition-colors"
                  >
                    {r.brand_name}
                  </Link>
                </td>

                <td className="py-2 pr-4 text-zinc-400">
                  {r.email ?? "—"}
                </td>

                <td className="py-2 pr-4">
                  {STATUS_LABELS[r.status]}
                </td>

                <td className="py-2 pr-4">
                  <Link
                    href={`/brands/${r.brand_id}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs hover:bg-zinc-800"
                  >
                    Uredi
                  </Link>
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
