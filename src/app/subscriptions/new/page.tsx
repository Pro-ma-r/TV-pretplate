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
  // DEFAULT DATUMI (RENEW)
  // =========================
  let defaultStart: string | null = null;
  let defaultEnd: string | null = null;

  // =========================
  // PAKETI
  // =========================
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, duration_days")
    .order("name");

  if (renew && packages) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, end_date, package_id")
      .eq("id", renew)
      .single();

    if (sub?.end_date && sub.package_id) {
      const pkg = packages.find(
        (p) => p.id === sub.package_id
      );

      if (pkg?.duration_days) {
        const prevEnd = new Date(sub.end_date);
        const start = addDays(prevEnd, 1);
        const end = addDays(start, pkg.duration_days);

        defaultStart = toInputDate(start);
        defaultEnd = toInputDate(end);
      }
    }
  }

  // =========================
  // CREATE
  // =========================
  async function createSubscription(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const package_id = formData.get("package_id") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;

    const { error } = await sb.from("subscriptions").insert({
      brand_id: brandId,
      package_id,
      start_date,
      end_date,
      manually_disabled: false
    });

    if (error) {
      console.error("SUBSCRIPTION INSERT ERROR:", error);
      throw error;
    }

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

          {/* DATUM DO */}
          <div>
            <div className="mb-1 text-zinc-500">Datum DO</div>
            <input
              type="date"
              name="end_date"
              required
              defaultValue={defaultEnd ?? undefined}
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
    </AppShell>
  );
}
