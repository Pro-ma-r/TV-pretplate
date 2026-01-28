export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toInputDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default async function NewSubscriptionPage({
  searchParams
}: {
  searchParams: Promise<{
    brand?: string;
    renew?: string;
  }>;
}) {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u || u.role !== "admin") redirect("/login");

  const { brand: brandId, renew } = await searchParams;
  if (!brandId) redirect("/brands");

  // =========================
  // PRODUŽENJE
  // =========================
  let defaultStart: string | null = null;
  let defaultEnd: string | null = null;
  let renewPackageId: string | null = null;

  if (renew) {
    const { data } = await supabase
      .from("subscriptions")
      .select(
        `
        id,
        package_id,
        end_date,
        packages (
          duration_days
        )
      `
      )
      .eq("id", renew)
      .single();

    const durationDays = data?.packages?.duration_days;

    if (data?.end_date && durationDays) {
      const prevEnd = new Date(data.end_date);
      const start = addDays(prevEnd, 1);
      const end = addDays(start, durationDays);

      defaultStart = toInputDate(start);
      defaultEnd = toInputDate(end);
      renewPackageId = data.package_id;
    }
  }

  // =========================
  // PAKETI
  // =========================
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, duration_days")
    .order("name");

  // =========================
  // CREATE (SERVER-SIDE ISTINA)
  // =========================
  async function createSubscription(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const package_id = formData.get("package_id") as string;
    const start_date_raw = formData.get("start_date") as string;

    if (!package_id || !start_date_raw) {
      redirect(`/subscriptions/new?brand=${brandId}`);
    }

    const { data: pkg } = await sb
      .from("packages")
      .select("duration_days")
      .eq("id", package_id)
      .single();

    if (!pkg?.duration_days) {
      redirect(`/subscriptions/new?brand=${brandId}`);
    }

    const start = new Date(start_date_raw);
    const end = addDays(start, pkg.duration_days);

    await sb.from("subscriptions").insert({
      brand_id: brandId,
      package_id,
      start_date: toInputDate(start),
      end_date: toInputDate(end),
      manually_disabled: false
    });

    redirect(`/brands/${brandId}`);
  }

  return (
    <AppShell title="Nova pretplata" role={u.role}>
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-lg font-semibold">
          {renew ? "Produženje pretplate" : "Nova pretplata"}
        </h2>

        <form action={createSubscription} className="space-y-4 text-sm">
          {/* PAKET */}
          <div>
            <div className="mb-1 text-zinc-500">Paket</div>

            {renewPackageId ? (
              <select
                name="package_id"
                defaultValue={renewPackageId}
                disabled
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                {packages?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                name="package_id"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                <option value="">— odaberi paket —</option>
                {packages?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* DATUM OD */}
          <div>
            <div className="mb-1 text-zinc-500">Datum OD</div>
            <input
              type="date"
              name="start_date"
              required
              defaultValue={defaultStart ?? undefined}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          {/* DATUM DO (READ-ONLY, INFORMACIJA) */}
          <div>
            <div className="mb-1 text-zinc-500">Datum DO</div>
            <input
              type="date"
              value={defaultEnd ?? ""}
              disabled
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-400"
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
    </AppShell>
  );
}
