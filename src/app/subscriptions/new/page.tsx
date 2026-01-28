export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";
import { NewSubscriptionForm } from "./NewSubscriptionForm";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toInputDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default async function NewSubscriptionPage({
  searchParams
}: {
  searchParams: Promise<{
    brand?: string;
    renew?: string;
    error?: string;
  }>;
}) {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u || u.role !== "admin") redirect("/login");

  const { brand: brandId, renew, error } = await searchParams;
  if (!brandId) redirect("/brands");

  // =========================
  // PAKETI
  // =========================
  const { data: packages, error: pkgErr } = await supabase
    .from("packages")
    .select("id, name, duration_days")
    .order("name");

  if (pkgErr) {
    console.error("PACKAGES LOAD ERROR:", pkgErr);
    // najjednostavnije: ne pokušavamo dalje
    redirect(`/subscriptions/new?brand=${brandId}&error=1`);
  }

  // =========================
  // PRODUŽENJE (default start/end + default paket)
  // =========================
  let defaultStart: string | null = null;
  let defaultEnd: string | null = null;
  let defaultPackageId: string | null = null;

  if (renew) {
    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .select("id, end_date, package_id")
      .eq("id", renew)
      .single();

    if (subErr) {
      console.error("RENEW LOAD ERROR:", subErr);
      redirect(`/subscriptions/new?brand=${brandId}&error=1`);
    }

    if (sub?.end_date) {
      const prevEnd = new Date(sub.end_date);
      const start = addDays(prevEnd, 1);
      defaultStart = toInputDate(start);
    }

    if (sub?.package_id) {
      defaultPackageId = sub.package_id;

      const pkg = (packages ?? []).find((p) => p.id === sub.package_id);
      const durationDays = pkg?.duration_days ?? null;

      if (defaultStart && durationDays) {
        const start = new Date(defaultStart);
        const end = addDays(start, durationDays);
        defaultEnd = toInputDate(end);
      }
    }
  }

  // =========================
  // CREATE (server action)
  // =========================
  async function createSubscription(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const package_id = (formData.get("package_id") as string) || "";
    const start_date = (formData.get("start_date") as string) || "";
    const end_date = (formData.get("end_date") as string) || "";

    // Minimalna validacija server-side (da ne upišemo prazno)
    if (!package_id || !start_date || !end_date) {
      redirect(`/subscriptions/new?brand=${brandId}${renew ? `&renew=${renew}` : ""}&error=1`);
    }

    const { error } = await sb.from("subscriptions").insert({
      brand_id: brandId,
      package_id,
      start_date,
      end_date,
      manually_disabled: false
    });

    if (error) {
      console.error("SUBSCRIPTION INSERT ERROR:", error);
      redirect(`/subscriptions/new?brand=${brandId}${renew ? `&renew=${renew}` : ""}&error=1`);
    }

    redirect(`/brands/${brandId}`);
  }

  return (
    <AppShell title="Nova pretplata" role={u.role}>
      <NewSubscriptionForm
        action={createSubscription}
        brandId={brandId}
        renewId={renew ?? null}
        packages={packages ?? []}
        defaultPackageId={defaultPackageId}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
        showError={Boolean(error)}
      />
    </AppShell>
  );
}
