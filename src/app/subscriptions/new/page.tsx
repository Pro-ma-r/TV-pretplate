export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";
import NewSubscriptionForm from "./NewSubscriptionForm";

export default async function NewSubscriptionPage({
  searchParams
}: {
  searchParams: Promise<{ brand?: string; renew?: string }>;
}) {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u || u.role !== "admin") redirect("/login");

  const { brand: brandId, renew } = await searchParams;
  if (!brandId) redirect("/brands");

  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, duration_days")
    .order("name");

  let renewData: {
    package_id: string;
    end_date: string;
  } | null = null;

  if (renew) {
    const { data } = await supabase
      .from("subscriptions")
      .select("package_id, end_date")
      .eq("id", renew)
      .single();

    if (data) {
      renewData = {
        package_id: data.package_id,
        end_date: data.end_date
      };
    }
  }

  async function createSubscription(fd: FormData) {
    "use server";

    const sb = await supabaseServer();
    const user = await requireUser(sb);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const package_id = fd.get("package_id") as string;
    const start_date = fd.get("start_date") as string;
    const end_date = fd.get("end_date") as string;

    // ✅ NOVO: payment_date dolazi samo za "Pristup sadržaju*"
    const payment_date_raw = fd.get("payment_date");
    const payment_date =
      typeof payment_date_raw === "string" && payment_date_raw.length > 0
        ? payment_date_raw
        : null;

    if (!package_id || !start_date || !end_date) {
      throw new Error("Missing form data");
    }

    const { error } = await sb.from("subscriptions").insert({
      brand_id: brandId,
      package_id,
      start_date,
      end_date,
      payment_date,
      manually_disabled: false
    });

    if (error) throw error;

    redirect(`/brands/${brandId}`);
  }

  return (
    <AppShell title="Nova pretplata" role={u.role}>
      <NewSubscriptionForm
        packages={packages ?? []}
        renewData={renewData}
        action={createSubscription}
      />
    </AppShell>
  );
}
