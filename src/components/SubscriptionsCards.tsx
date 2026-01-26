"use client";

import type { SubscriptionWithStatus } from "@/src/types/db";

type Row = SubscriptionWithStatus & {
  brand_name?: string;
  package_name?: string;
};

export function SubscriptionsCards({
  rows,
  onDisable
}: {
  rows: Row[];
  onDisable: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border p-4 bg-white shadow-sm"
        >
          <div className="font-semibold text-lg">
            {r.brand_name ?? "—"}
          </div>

          <div className="text-sm text-gray-600 mt-1">
            Paket: {r.package_name ?? "—"}
          </div>

          <div className="mt-2">
            <StatusBadge status={deriveStatus(r)} />
          </div>

          <div className="text-sm mt-1 text-gray-600">
            Vrijedi do: {r.end_date}
          </div>

          <div className="mt-4">
            {r.manually_disabled ? null : (
              <button
                onClick={() => onDisable(r.id)}
                className="px-3 py-1.5 rounded-md text-sm bg-red-600 text-white"
              >
                Isključi
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function deriveStatus(r: SubscriptionWithStatus) {
  if (r.manually_disabled) return "ISKLJUČEN";
  const today = new Date().toISOString().slice(0, 10);
  if (r.end_date < today) return "NEAKTIVAN";
  return "AKTIVAN";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    AKTIVAN: "bg-green-600",
    NEAKTIVAN: "bg-gray-400",
    ISKLJUČEN: "bg-red-600"
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-white text-xs ${
        map[status] ?? "bg-gray-400"
      }`}
    >
      {status}
    </span>
  );
}
