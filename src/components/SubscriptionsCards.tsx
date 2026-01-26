"use client";

import type { SubscriptionWithStatus } from "@/src/types/db";

type Row = SubscriptionWithStatus & {
  brand_name?: string;
  package_name?: string;
};

export function SubscriptionsCards({
  rows,
  onDisable,
  onEnable
}: {
  rows: Row[];
  onDisable: (id: string) => Promise<void>;
  onEnable: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => {
        const status = deriveStatus(r);

        return (
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
              <StatusBadge status={status} />
            </div>

            <div className="text-sm mt-1 text-gray-600">
              Vrijedi do: {r.end_date}
            </div>

            <div className="mt-4 flex gap-2">
              {status === "AKTIVAN" && (
                <form action={onDisable.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-md text-sm bg-red-600 text-white"
                  >
                    Isključi
                  </button>
                </form>
              )}

              {status === "ISKLJUČEN" && (
                <form action={onEnable.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-md text-sm bg-green-600 text-white"
                  >
                    Uključi
                  </button>
                </form>
              )}
            </div>
          </div>
        );
      })}
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
