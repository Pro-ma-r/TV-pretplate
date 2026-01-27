export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseReadonly } from "@/src/lib/supabaseReadonly";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("hr-HR");
}

export default async function BrandPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = supabaseReadonly();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  // 1️⃣ BRAND
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!brand) {
    return (
      <AppShell title="Brend" role={u.role}>
        <div>Brend ne postoji.</div>
      </AppShell>
    );
  }

  // 2️⃣ PRETPLATE TOG BRENDA
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      start_date,
      end_date,
      payment_date,
      manually_disabled,
      disabled_note,
      note,
      packages(name)
    `
    )
    .eq("brand_id", brand.id)
    .order("start_date", { ascending: false });

  return (
    <AppShell title={brand.name} role={u.role}>
      {/* OSNOVNI PODACI */}
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-2 text-lg font-semibold">Podaci o brendu</h2>

        <div className="grid gap-2 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-500">Email:</span>{" "}
            {brand.email ?? "—"}
          </div>
          <div>
            <span className="text-zinc-500">Kontakt:</span>{" "}
            {brand.contact_person ?? "—"}
          </div>
          <div>
            <span className="text-zinc-500">Napomena:</span>{" "}
            {brand.note ?? "—"}
          </div>
        </div>
      </div>

      {/* PRETPLATE — KARTICE */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Pretplate ({subscriptions?.length ?? 0})
        </h2>

        {subscriptions?.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <span className="text-zinc-500">Paket:</span>{" "}
                {s.packages?.name ?? "—"}
              </div>

              <div>
                <span className="text-zinc-500">Period:</span>{" "}
                {formatDate(s.start_date)} –{" "}
                {formatDate(s.end_date)}
              </div>

              <div>
                <span className="text-zinc-500">Status:</span>{" "}
                {s.manually_disabled
                  ? "Isključena"
                  : s.end_date &&
                    new Date(s.end_date) < new Date()
                  ? "Neaktivna"
                  : "Aktivna"}
              </div>

              {s.note && (
                <div>
                  <span className="text-zinc-500">Napomena:</span>{" "}
                  {s.note}
                </div>
              )}
            </div>
          </div>
        ))}

        {subscriptions?.length === 0 && (
          <div className="text-sm text-zinc-400">
            Brend nema pretplata.
          </div>
        )}
      </div>
    </AppShell>
  );
}
