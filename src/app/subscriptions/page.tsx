import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import type { SubscriptionWithStatus } from "@/src/types/db";
import { SubscriptionsTable } from "@/src/components/SubscriptionsTable";

type SubscriptionWithClientEmail = SubscriptionWithStatus & {
  client_email?: string;
};

export default async function SubscriptionsPage() {
  const u = await requireUser();
  if (!u) redirect("/login");

  const supabase = await supabaseServer();

  // ✅ RPC UMJESTO VIEW-a
  const subsRes = await supabase
    .rpc("get_subscriptions_with_client_email")
    .returns<SubscriptionWithClientEmail[]>();

  const brandsRes = await supabase
    .from("brands")
    .select("id,name")
    .returns<Array<{ id: string; name: string }>>();

  const pkgsRes = await supabase
    .from("packages")
    .select("id,name")
    .returns<Array<{ id: string; name: string }>>();

  const brandMap = new Map(
    (brandsRes.data ?? []).map((b) => [b.id, b.name] as const)
  );
  const pkgMap = new Map(
    (pkgsRes.data ?? []).map((p) => [p.id, p.name] as const)
  );

  const rows = (subsRes.data ?? []).map((s) => ({
    ...s,
    brand_name: brandMap.get(s.brand_id),
    package_name: pkgMap.get(s.package_id),
    client_email: s.client_email
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
      <SubscriptionsTable
        rows={rows}
        brands={brandsRes.data ?? []}
        packages={pkgsRes.data ?? []}
        canCreate={canCreate}
        onDisable={disable}
        onCreate={create}
      />

      <div className="mt-3 text-xs text-zinc-500">
        Search sada radi i po email adresi klijenta (RPC, admin-only).
      </div>
    </AppShell>
  );
}
