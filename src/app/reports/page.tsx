import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import type { SubscriptionWithStatus } from "@/src/types/db";
import { ExportButtons } from "@/src/components/ExportButtons";

export default async function ReportsPage() {
  // ⬅️ jedna Supabase instanca
  const supabase = await supabaseServer();

  // ⬅️ requireUser koristi ISTU instancu
  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const subsRes = await supabase
    .from("subscriptions_with_status")
    .select("*")
    .returns<SubscriptionWithStatus[]>();

  const rows = (subsRes.data ?? []).map((r) => ({
    id: r.id,
    brand_id: r.brand_id,
    package_id: r.package_id,
    od: r.start_date,
    do: r.end_date,
    status: r.status
  }));

  return (
    <AppShell title="Izvještaji" role={u.role}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Export izvještaji</div>
            <div className="text-sm text-zinc-400">
              Ovo je početna verzija. Sljedeće dodajemo izbor perioda + agregate.
            </div>
          </div>
          <ExportButtons filename="izvjestaj" rows={rows} />
        </div>
      </div>
    </AppShell>
  );
}
