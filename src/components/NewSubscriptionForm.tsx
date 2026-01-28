"use client";

import { useEffect, useMemo, useState } from "react";

type Pkg = {
  id: string;
  name: string;
  duration_days: number;
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toInputDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export function NewSubscriptionForm({
  packages,
  renew,
  renewPackageId,
  defaultStart,
  defaultEnd,
  action
}: {
  packages: Pkg[];
  renew: boolean;
  renewPackageId: string | null;
  defaultStart: string | null;
  defaultEnd: string | null;
  action: (formData: FormData) => void;
}) {
  const pkgMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of packages) m.set(p.id, Number(p.duration_days ?? 0));
    return m;
  }, [packages]);

  const [packageId, setPackageId] = useState<string>(renewPackageId ?? "");
  const [startDate, setStartDate] = useState<string>(defaultStart ?? "");
  const [endDate, setEndDate] = useState<string>(defaultEnd ?? "");

  // Kad biramo paket + datum OD, DO se automatski računa (mobitel-friendly)
  useEffect(() => {
    if (!packageId || !startDate) {
      setEndDate(renew ? defaultEnd ?? "" : "");
      return;
    }

    const durationDays = pkgMap.get(packageId) ?? 0;
    if (durationDays <= 0) {
      setEndDate("");
      return;
    }

    const start = new Date(startDate);
    const end = addDays(start, durationDays);
    setEndDate(toInputDate(end));
  }, [packageId, startDate, pkgMap, renew, defaultEnd]);

  // Ako je renew, paket je zaključan na renewPackageId
  useEffect(() => {
    if (renew && renewPackageId) {
      setPackageId(renewPackageId);
    }
  }, [renew, renewPackageId]);

  return (
    <form action={action} className="space-y-4 text-sm">
      {/* PAKET */}
      <div>
        <div className="mb-1 text-zinc-500">Paket</div>

        <select
          name="package_id"
          required
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          disabled={Boolean(renewPackageId)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
        >
          {!renewPackageId && <option value="">— odaberi paket —</option>}
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
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

      {/* DATUM DO (AUTO) */}
      <div>
        <div className="mb-1 text-zinc-500">Datum DO</div>
        <input
          type="date"
          value={endDate}
          disabled
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-400"
        />
        <div className="mt-1 text-xs text-zinc-500">
          Datum DO se računa automatski po trajanju paketa.
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-green-600/80 py-2 font-medium text-white hover:bg-green-600"
      >
        Spremi pretplatu
      </button>
    </form>
  );
}
