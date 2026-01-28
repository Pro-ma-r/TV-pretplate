"use client";

import { useState } from "react";

type PackageFilter = "CONTENT" | "OTHER";
type ExpiryFilter = "PAST" | "FUTURE";
type DaysFilter = 5 | 10 | 20 | 30;

export default function ReportsFilters() {
  const [pkg, setPkg] = useState<PackageFilter>("CONTENT");
  const [expiry, setExpiry] = useState<ExpiryFilter>("FUTURE");
  const [days, setDays] = useState<DaysFilter>(10);

  return (
    <div className="space-y-6">
      {/* FILTERI */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-4 text-base font-semibold">
          Izvještaj po isteku pretplata
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* PAKET */}
          <div>
            <div className="mb-1 text-xs text-zinc-500">Paket</div>
            <select
              value={pkg}
              onChange={(e) => setPkg(e.target.value as PackageFilter)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="CONTENT">
                Paketi Pristup sadržaju
              </option>
              <option value="OTHER">Ostali paketi</option>
            </select>
          </div>

          {/* ISTEK */}
          <div>
            <div className="mb-1 text-xs text-zinc-500">Istek</div>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value as ExpiryFilter)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value="PAST">
                Paketi koji su istekli prije
              </option>
              <option value="FUTURE">
                Paketi koji ističu za
              </option>
            </select>
          </div>

          {/* BROJ DANA */}
          <div>
            <div className="mb-1 text-xs text-zinc-500">Broj dana</div>
            <select
              value={days}
              onChange={(e) =>
                setDays(Number(e.target.value) as DaysFilter)
              }
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            >
              <option value={5}>5 dana</option>
              <option value={10}>10 dana</option>
              <option value={20}>20 dana</option>
              <option value={30}>30 dana</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="rounded-lg bg-purple-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600"
          >
            Prikaži
          </button>
        </div>
      </div>

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
            <tr>
              <td
                colSpan={4}
                className="py-6 text-center text-zinc-500"
              >
                Nema podataka za odabrane filtere.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
