import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import type { SubscriptionWithStatus } from "@/src/types/db";
import { SubscriptionsTable } from "@/src/components/SubscriptionsTable";
import { supabaseReadonly } from "@/src/lib/supabaseReadonly";

type SubscriptionRow = SubscriptionWithStatus & {
  brand_name?: string;
  package_name?: string;
  client_email?: string;
};

export default async function SubscriptionsPage(props: any) {
  // ✅ READ-ONLY Supabase client (NE dira cookies)
  const supabase = supabaseReadonly();

  const q = props?.searchParams?.q ?? "";

  const subsRes = await supabase.rpc("search_subscriptions", {
    search_text: q
  });

  const rows: SubscriptionRow[] = Array.isArray(subsRes.data)
    ? subsRes.data
    : [];

  const brandsRes = await supabase
    .from("brands")
    .select("id,name");

  const pkgsRes = await supabase
    .from("packages")
    .select("id,name");

  const brandMap = new Map(
    (brandsRes.data ?? []).map((b) => [b.id, b.name] as const)
  );
  const pkgMap = new Map(
    (pkgsRes.data ?? []).map((p) => [p.id, p.name] as const)
  );

  const finalRows = rows.map((r) => ({
    ...r,
    brand_name: r.brand_name ?? brandMap.get(r.brand_id),
    package_name: r.package_name ?? pkgMap.get(r.package_id)
  }));

  // ⚠️ Auth se NE radi u page.tsx (Next 15)
  // Pretpostavka: auth je riješen middlewareom ili routingom
  const canCreate = true;

  return (
    <AppShell title="Pretplate" role="admin">
      <SubscriptionsTable
        rows={finalRows}
        brands={brandsRes.data ?? []}
        packages={pkgsRes.data ?? []}
        canCreate={canCreate}
        // ⛔ NEMA server actions u pageu
      />
    </AppShell>
  );
}
