export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";
import NewSubscriptionForm from "./NewSubscriptionForm";

export default async function NewSubscriptionPage({
  searchParams
}: {
  searchParams: Promise<{
    brand?: string;
    renew?: string;
  }>;
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

    if (data?.package_id && data?.end_date) {
      renewData = data;
    }
  }

  async function createSubscription(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const package_id = formData.get("package_id") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;

    if (!package_id || !start_date || !end_date) {
      redirect(`/subscriptions/new?brand=${brandId}`);
    }

    const { error } = await sb.from("subscriptions").insert({
      brand_id: brandId,
      package_id,
      start_date,
      end_date,
      manually_disabled: false
    });

    if (error) {
      console.error("INSERT ERROR:", error);
      redirect(`/subscriptions/new?brand=${brandId}`);
    }

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
