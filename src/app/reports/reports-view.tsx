"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  brand_id: string;
  brand_name: string;
  package_name: string;
  start_date: string;
  end_date: string;
  email: string | null;
};

export default function ReportsView({
  paket,
  istek,
  dana,
  rows
}: {
  paket: "CONTENT" | "OTHER";
  istek: "PAST" | "FUTURE";
  dana: number;
  rows: Row[];
}) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const [paketState, setPaketState] = useState(paket);
  const [istekState, setIstekState] = useState(istek);
  const [danaState, setDanaState] = useState(String(dana));

  useEffect(() => {
    setPaketState(paket);
    setIstekState(istek);
    setDanaState(String(dana));
  }, [paket, istek, dana]);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    params.set("paket", paketState);
    params.set("istek", istekState);
    params.set("dana", danaState);

    router.push(`/reports?${params.toString()}`);
  }

  async function copyMail(mail: string) {
    await navigator.clipboard.writeText(mail);
    setCopied(mail);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="space-y-6">
      {/* FILTERI */}
      <form
        onSubmit={submit}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
      >
        <h2 className="mb-4 text-base font-semibold">
          Izvještaj po isteku pretplata
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <select
            value={paketState}
            onChange={(e) => setPaketState(e.target.value as any)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="CONTENT">
              Paketi Pristup sadržaju
            </option>
            <option value="OTHER">Ostali paketi</option>
          </select>

          <select
            value={istekState}
            onChange={(e) => setIstekState(e.target.value as any)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="PAST">
              Paketi koji su istekli prije
            </option>
            <option value="FUTURE">
              Paketi koji ističu za
            </option>
          </select>

          <select
            value={danaState}
            onChange={(e) => setDanaState(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="5">5 dana</option>
            <option value="10">10 dana</option>
            <option value="20">20 dana</option>
            <option value="30">30 dana</option>
          </select>
        </div>

        <button className="mt-4 rounded-lg bg-purple-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600">
          Prikaži
        </button>
      </form>

      {/* TABLICA */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr className="border-b border-zinc-800">
              <th className="py-2 pr-4">Brend</th>
              <th className="py-2 pr-4">Paket</th>
              <th className="py-2 pr-4">Period trajanja</th>
              <th className="py-2 pr-4">Mail adresa</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 text-center text-zinc-500"
                >
                  Nema podataka za odabrane filtere.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-b border-zinc-900">
                  <td className="py-2 pr-4 font-medium">
                    <Link
                      href={`/brands/${r.brand_id}`}
                      className="text-zinc-200 hover:text-purple-400 transition"
                    >
                      {r.brand_name}
                    </Link>
                  </td>

                  <td className="py-2 pr-4">
                    {r.package_name}
                  </td>

                  <td className="py-2 pr-4 whitespace-nowrap">
                    {r.start_date} – {r.end_date}
                  </td>

                  <td className="py-2 pr-4">
                    {r.email ? (
                      <button
                        type="button"
                        onClick={() =>
                          r.email && copyMail(r.email)
                        }
                        className="text-zinc-400 hover:text-green-400 transition"
                        title="Klikni za copy"
                      >
                        {r.email}
                        {copied === r.email && (
                          <span className="ml-2 text-xs text-green-500">
                            kopirano
                          </span>
                        )}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
