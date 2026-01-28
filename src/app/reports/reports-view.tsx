"use client";

import { useRouter } from "next/navigation";

type Row = {
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

  function submit(formData: FormData) {
    const params = new URLSearchParams();
    params.set("paket", formData.get("paket") as string);
    params.set("istek", formData.get("istek") as string);
    params.set("dana", formData.get("dana") as string);

    router.push(`/reports?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* FILTERI */}
      <form
        action={submit}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
      >
        <h2 className="mb-4 text-base font-semibold">
          Izvještaj po isteku pretplata
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <select
            name="paket"
            defaultValue={paket}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="CONTENT">
              Paketi Pristup sadržaju
            </option>
            <option value="OTHER">Ostali paketi</option>
          </select>

          <select
            name="istek"
            defaultValue={istek}
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
            name="dana"
            defaultValue={dana}
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
                  <td className="py-2 pr-4">
                    {r.brand_name}
                  </td>
                  <td className="py-2 pr-4">
                    {r.package_name}
                  </td>
                  <td className="py-2 pr-4">
                    {r.start_date} – {r.end_date}
                  </td>
                  <td className="py-2 pr-4 text-zinc-400">
                    {r.email ?? "—"}
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
