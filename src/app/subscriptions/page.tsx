export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import type { SubscriptionWithStatus } from "@/src/types/db";
import { SubscriptionsTable } from "@/src/components/SubscriptionsTable";

type SubscriptionRow = SubscriptionWithStatus & {
  brand_name?: string;
  client_email?: string;
};

type BrandRow = {
  brand_id: string;
  brand_name: string;
  email?: string;
  is_disabled: boolean;
};

export default async function SubscriptionsPage(props: any) {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const q = props?.searchParams?.q ?? "";

  // i dalje koristimo RPC
  const subsRes = await supabase.rpc("search_subscriptions", {
    search_text: q
  });

  const rows: SubscriptionRow[] = Array.isArray(subsRes.data)
    ? subsRes.data
    : [];

  // MAPIRANJE PO BRENDU
  const brandMap = new Map<string, BrandRow>();

  for (const r of rows) {
    if (!brandMap.has(r.brand_id)) {
      brandMap.set(r.brand_id, {
        brand_id: r.brand_id,
        brand_name: r.brand_name ?? "—",
        email: r.client_email ?? undefined,
        is_disabled: Boolean(r.manually_disabled)
      });
    } else {
      const b = brandMap.get(r.brand_id)!;
      // ako je ijedan paket ručno isključen → brend je isključen
      if (r.manually_disabled) {
        b.is_disabled = true;
      }
    }
  }

  const brandRows = Array.from(brandMap.values());

  return (
    <AppShell title="Pretplate" role={u.role}>
      <SubscriptionsTable
        rows={brandRows}
        canCreate={u.role === "admin"}
      />
    </AppShell>
  );
}
