import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import { SubscriptionsTable } from "@/src/components/SubscriptionsTable";
import { SubscriptionsCards } from "@/src/components/SubscriptionsCards";

import {
  disableSubscription,
  enableSubscription,
  createSubscription
} from "./actions";

import type { SubscriptionWithStatus } from "@/src/types/db";

type SubscriptionRow = SubscriptionWithStatus & {
  brand_name?: string;
  package_name?: string;
};

export default async function SubscriptionsPage(props: any) {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  // 🔥 RPC TEST: NAMJERNO NE ZOVEMO search_subscriptions
  const finalRows: SubscriptionRow[] = [];

  const brandsRes = await supabase
    .from("brands")
    .select("id,name");

  const pkgsRes = await supabase
    .from("packages")
    .select("id,name");

  const canCreate = u.role === "admin";

  return (
    <AppShell title="Pretplate (RPC TEST)" role={u.role}>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <SubscriptionsTable
          rows={finalRows}
          brands={brandsRes.data ?? []}
          packages={pkgsRes.data ?? []}
          canCreate={canCreate}
          onDisable={disableSubscription}
          onCreate={createSubscription}
        />
      </div>

      {/* MOBILE */}
      <div className="block md:hidden">
        <SubscriptionsCards
          rows={finalRows}
          onDisable={disableSubscription}
          onEnable={enableSubscription}
        />
      </div>
    </AppShell>
  );
}
