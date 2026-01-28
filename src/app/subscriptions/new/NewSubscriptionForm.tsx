"use client";

import { useEffect, useMemo, useState } from "react";

type Pkg = {
  id: string;
  name: string;
  duration_days: number | null;
};

function addDaysStr(startYYYYMMDD: string, days: number) {
  // startYYYYMMDD je "YYYY-MM-DD"
  const d = new Date(startYYYYMMDD);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function NewSubscriptionForm({
  action,
  brandId,
  renewId,
  packages,
  defaultPackageId,
  defaultStart,
  defaultEnd,
  showError
}: {
  action: (formData: FormData) => void;
  brandId: string;
  renewId: string | null;
  packages: Pkg[];
  defaultPackageId: string | null;
  defaultStart: string | null;
  defaultEnd: string | null;
  showError: boolean;
}) {
  const pkgMap = useMemo(() => {
    const m = new Map<string, Pkg>();
    for (const p of packages) m.set(p.id, p);
    return m;
  }, [packages]);

  const [packageId, setPackageId] = useState<string>(defaultPackageId ?? "");
  const [startDate, setStartDate] = useState<string>(defaultStart ?? "");
  const [endDate, setEndDate] = useState<string>(defaultEnd ?? "");

  // AUTO-DO: kad god se promijeni paket ili Datum OD, end se izračuna (ako imamo duration_days)
  useEffect(() => {
    if (!packageId || !startDate) return;

    const pkg = pkgMap.get(packageId);
    const dd = pkg?.duration_days ?? null;
    if (!dd) return;

    const computed = addDaysStr(startDate, dd);
    setEndDate(computed);
  }, [packageId, startDate, pkgMap]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="mb-4 text-lg font-semibold">
        {renewId ? "Produženje pretplate" : "Nova pretplata"}
      </h2>

      {showError && (
        <div className="mb-4 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-2 text-sm text-red-400">
          Došlo je do greške pri spremanju pretplate.
        </div>
      )}

      <form action={action} className="space-y-4 text-sm">
        {/* (brandId je već u server action closureu, ali ostavljam i hidden radi debug-a / eventualne refaktorizacije) */}
        <input type="hidden" name="brand_id" value={brandId} />
        {renewId ? <input type="hidden" name="renew" value={renewId} /> : null}

        {/* PAKET */}
        <div>
          <div className="mb-1 text-zinc-500">Paket</div>
          <select
            name="package_id"
            required
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          >
            <option value="">— odaberi paket —</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="mt-1 text-[11px] text-zinc-500">
            DO se automatski računa po trajanju paketa, ali ga možeš ručno promijeniti.
          </div>
        </div>

        {/* DATUM OD */}
        <div>
          <div className="mb-1 text-zinc-500">Datum OD</div>
          <input
            type="date"
            name="start_date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />
        </div>

        {/* DATUM DO (editable, ali auto-popunjeno) */}
        <div>
          <div className="mb-1 text-zinc-500">Datum DO</div>
          <input
            type="date"
            name="end_date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-green-600/80 py-2 font-medium text-white hover:bg-green-600"
        >
          Spremi pretplatu
        </button>
      </form>
    </div>
  );
}
