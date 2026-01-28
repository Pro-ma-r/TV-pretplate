"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toInputDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function NewSubscriptionForm({
  brandId,
  packages,
  renewData,
  action
}: {
  brandId: string;
  packages: Array<{
    id: string;
    name: string;
    duration_days: number | null;
  }>;
  renewData: {
    package_id: string;
    end_date: string;
  } | null;
  action: (fd: FormData) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [packageId, setPackageId] = useState(
    renewData?.package_id ?? ""
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === packageId),
    [packages, packageId]
  );

  // default start date kod produženja = dan nakon isteka
  useEffect(() => {
    if (renewData?.end_date) {
      const prevEnd = new Date(renewData.end_date);
      const start = addDays(prevEnd, 1);
      setStartDate(toInputDate(start));
    }
  }, [renewData]);

  // AUTO DO
  useEffect(() => {
    if (
      startDate &&
      selectedPackage?.duration_days
    ) {
      const start = new Date(startDate);
      const end = addDays(
        start,
        selectedPackage.duration_days
      );
      setEndDate(toInputDate(end));
    }
  }, [startDate, selectedPackage]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="mb-4 text-lg font-semibold">
        {renewData ? "Produženje pretplate" : "Nova pretplata"}
      </h2>

      <form
        action={(fd) => {
          startTransition(async () => {
            const res = await action(fd);
            if (res.ok) {
              router.push(`/brands/${brandId}`);
            }
          });
        }}
        className="space-y-4 text-sm"
      >
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

        {/* DATUM DO */}
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
          disabled={isPending}
          className="w-full rounded-lg bg-green-600/80 py-2 font-medium text-white hover:bg-green-600 disabled:opacity-60"
        >
          {isPending ? "Spremanje..." : "Spremi pretplatu"}
        </button>
      </form>
    </div>
  );
}
