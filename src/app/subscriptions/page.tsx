import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import type { SubscriptionWithStatus } from "@/src/types/db";
import { SubscriptionsTable } from "@/src/components/SubscriptionsTable";
import { SubscriptionsCards } from "@/src/components/SubscriptionsCards";

type SubscriptionRow = SubscriptionWithStatus & {
  brand_name?: string;
  package_name?: string;
  client_email?: string;
};

export default async function SubscriptionsPage(props: any) {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

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

  const canCreate = u.role === "admin";

  async function disable(id: string) {
    "use server";
    const sb = await supabaseServer();
    await sb.rpc("disable_subscription", {
      p_subscription_id: id,
      p_reason: "Isključeno iz admin panela"
    });
  }

  async function create(payload: {
    brand_id: string;
    package_id: string;
    start_date: string;
    end_date: string;
    payment_date?: string;
    note?: string;
  }) {
    "use server";
    const sb = await supabaseServer();
    await sb.rpc("create_subscription", {
      p_brand_id: payload.brand_id,
      p_package_id: payload.package_id,
      p_start_date: payload.start_date,
      p_end_date: payload.end_date,
      p_payment_date: payload.payment_date ?? null,
      p_note: payload.note ?? null
    });
  }

  return (
    <AppShell title="Pretplate" role={u.role}>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <SubscriptionsTable
          rows={finalRows}
          brands={brandsRes.data ?? []}
          packages={pkgsRes.data ?? []}
          canCreate={canCreate}
          onDisable={disable}
          onCreate={create}
        />
      </div>

      {/* MOBILE */}
      <div className="block md:hidden">
        <SubscriptionsCards
          rows={finalRows}
          onDisable={disable}
        />
      </div>
    </AppShell>
  );
}
