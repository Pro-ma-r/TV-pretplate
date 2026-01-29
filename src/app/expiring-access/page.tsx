export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import { SubscriptionsTable } from "@/src/components/SubscriptionsTable";

type Row = {
  brand_id: string;
  brand_name: string;
  client_email: string | null;
};

export default async function ExpiringAccessPage() {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const res = await supabase
    .from("access_expiring_in_10_days")
    .select("brand_id, brand_name, client_email");

  const map = new Map<string, { brand_id: string; brand_name: string; email?: string; status: "AKTIVAN" }>();

  for (const r of (res.data ?? []) as Row[]) {
    if (!map.has(r.brand_id)) {
      map.set(r.brand_id, {
        brand_id: r.brand_id,
        brand_name: r.brand_name ?? "—",
        email: r.client_email ?? undefined,
        status: "AKTIVAN",
      });
    }
  }

  const rows = Array.from(map.values());

  return (
    <AppShell title="Ističe za 10 dana" role={u.role}>
      <SubscriptionsTable rows={rows as any} canCreate={u.role === "admin"} />
    </AppShell>
  );
}
