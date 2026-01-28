export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import { SubscriptionsTable } from "@/src/components/SubscriptionsTable";

type RawRow = {
  brand_id: string;
  brand_name?: string;
  client_email?: string;
  manually_disabled: boolean | null;
  end_date: string | null;
};

type BrandStatus = "AKTIVAN" | "NEAKTIVAN" | "ISKLJUCEN";

type BrandRow = {
  brand_id: string;
  brand_name: string;
  email?: string;
  status: BrandStatus;
};

function isActive(endDate?: string | null) {
  if (!endDate) return false;
  return new Date(endDate) >= new Date();
}

export default async function SubscriptionsPage(props: any) {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const q = props?.searchParams?.q ?? "";

  const subsRes = await supabase.rpc("search_subscriptions", {
    search_text: q
  });

  const rows: RawRow[] = Array.isArray(subsRes.data)
    ? subsRes.data
    : [];

  const brandMap = new Map<
    string,
    {
      brand_id: string;
      brand_name: string;
      email?: string;
      isDisabled: boolean;
      hasActive: boolean;
    }
  >();

  for (const r of rows) {
    if (!brandMap.has(r.brand_id)) {
      brandMap.set(r.brand_id, {
        brand_id: r.brand_id,
        brand_name: r.brand_name ?? "—",
        email: r.client_email ?? undefined,
        isDisabled: Boolean(r.manually_disabled),
        hasActive: isActive(r.end_date) && !r.manually_disabled
      });
    } else {
      const b = brandMap.get(r.brand_id)!;

      if (r.manually_disabled) {
        b.isDisabled = true;
      }

      if (isActive(r.end_date) && !r.manually_disabled) {
        b.hasActive = true;
      }
    }
  }

  const brandRows: BrandRow[] = Array.from(brandMap.values()).map(
    (b) => {
      let status: BrandStatus;

      if (b.isDisabled) status = "ISKLJUCEN";
      else if (b.hasActive) status = "AKTIVAN";
      else status = "NEAKTIVAN";

      return {
        brand_id: b.brand_id,
        brand_name: b.brand_name,
        email: b.email,
        status
      };
    }
  );

  return (
    <AppShell title="Pretplate" role={u.role}>
      <SubscriptionsTable
        rows={brandRows}
        canCreate={u.role === "admin"}
      />
    </AppShell>
  );
}
