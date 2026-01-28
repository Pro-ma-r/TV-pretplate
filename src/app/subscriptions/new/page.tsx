export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

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

  // ako je produljenje, učitaj postojeću pretplatu
  let renewSub: {
    id: string;
    package_id: string;
    end_date: string | null;
  } | null = null;

  if (renew) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, package_id, end_date")
      .eq("id", renew)
      .single();

    if (data) renewSub = data;
  }

  // paketi
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name")
    .order("name");

  async function createSubscription(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const package_id = formData.get("package_id") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;

    await sb.from("subscriptions").insert({
      brand_id: brandId,
      package_id,
      start_date,
      end_date,
      manually_disabled: false
    });

    redirect(`/brands/${brandId}`);
  }

  return (
    <AppShell title="Nova pretplata" role={u.role}>
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {renewSub ? "Produženje pretplate" : "Nova pretplata"}
        </h2>

        <form action={createSubscription} className="space-y-4 text-sm">
          {/* PAKET */}
          <div>
            <div className="mb-1 text-zinc-500">Paket</div>

            {renewSub ? (
              <select
                name="package_id"
                defaultValue={renewSub.package_id}
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
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600/80 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            Spremi pretplatu
          </button>
        </form>
      </div>
    </AppShell>
  );
}
