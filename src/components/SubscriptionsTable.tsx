"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  ISKLJUCEN: "Isključen",
};

export function SubscriptionsTable({
  rows,
  canCreate,
  syncUrl = true,
}: {
  rows: BrandRow[];
  canCreate: boolean;
  syncUrl?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initialStatus: "" | BrandStatus =
    searchParams?.get("package") ? "AKTIVAN" : "";

  const [q, setQ] = useState(searchParams?.get("q") ?? "");
  const [status, setStatus] =
    useState<"" | BrandStatus>(initialStatus);

  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // URL sync samo na /subscriptions
  useEffect(() => {
    if (!syncUrl) return;
    if (pathname !== "/subscriptions") return;

    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : []
    );

    if (q) params.set("q", q);
    else params.delete("q");

    router.replace(`/subscriptions?${params.toString()}`);
  }, [q, router, searchParams, pathname, syncUrl]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchText =
        !q ||
        r.brand_name.toLowerCase().includes(q.toLowerCase()) ||
        (r.email ?? "").toLowerCase().includes(q.toLowerCase());

      const matchStatus = !status || r.status === status;

      return matchText && matchStatus;
    });
  }, [rows, q, status]);

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);

    setTimeout(() => {
      setCopiedEmail(null);
    }, 1500);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      {/* FILTERI */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pretraži: brend ili email"
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
            <option value="ISKLJUCEN">Isključeni</option>
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
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Akcija</th>
            </tr>
          </thead>

          <tbody className="text-zinc-200">
            {filteredRows.map((r) => {
              const isCopied = copiedEmail === r.email;

              return (
                <tr key={r.brand_id} className="border-b border-zinc-900">
                  <td className="py-2 pr-4 font-medium">
                    <Link
                      href={`/brands/${r.brand_id}`}
                      className="text-zinc-200 hover:text-purple-400 transition-colors"
                    >
                      {r.brand_name}
                    </Link>
                  </td>

                  <td className="py-2 pr-4">
                    {r.email ? (
                      <button
                        onClick={() => copyEmail(r.email!)}
                        className={`transition-colors ${
                          isCopied
                            ? "text-green-400"
                            : "text-zinc-400 hover:text-purple-400"
                        }`}
                      >
                        {isCopied ? "Kopirano ✓" : r.email}
                      </button>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
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
              );
            })}
          </tbody>
        </table>

        <div className="mt-3 text-xs text-zinc-400">
          Prikazano: {filteredRows.length}
        </div>
      </div>
    </div>
  );
}
