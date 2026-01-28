export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";
import { NewSubscriptionForm } from "@/src/components/NewSubscriptionForm";

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
  }>;
}) {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u || u.role !== "admin") redirect("/login");

  const { brand: brandId, renew } = await searchParams;
  if (!brandId) redirect("/brands");

  // =========================
  // PAKETI
  // =========================
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, duration_days")
    .order("name");

  const pkgList =
    packages?.map((p) => ({
      id: p.id as string,
      name: p.name as string,
      duration_days: Number(p.duration_days ?? 0)
    })) ?? [];

  // =========================
  // PRODUŽENJE (DEFAULT OD/DO)
  // =========================
  let defaultStart: string | null = null;
  let defaultEnd: string | null = null;
  let renewPackageId: string | null = null;

  if (renew) {
    // 1) dohvatimo pretplatu
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, package_id, end_date")
      .eq("id", renew)
      .single();

    // 2) dohvatimo trajanje paketa PO package_id (bez join relacija)
    if (sub?.package_id && sub?.end_date) {
      const { data: pkg } = await supabase
        .from("packages")
        .select("duration_days")
        .eq("id", sub.package_id)
        .single();

      const durationDays = Number(pkg?.duration_days ?? 0);

      if (durationDays > 0) {
        const prevEnd = new Date(sub.end_date);
        const start = addDays(prevEnd, 1);
        const end = addDays(start, durationDays);

        defaultStart = toInputDate(start);
        defaultEnd = toInputDate(end);
        renewPackageId = sub.package_id;
      }
    }
  }

  // =========================
  // CREATE (SERVER-SIDE ISTINA)
  // =========================
  async function createSubscription(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const package_id = formData.get("package_id") as string;
    const start_date_raw = formData.get("start_date") as string;

    if (!package_id || !start_date_raw) {
      redirect(`/subscriptions/new?brand=${brandId}`);
    }

    // Trajanje paketa uvijek uzimamo iz baze
    const { data: pkg } = await sb
      .from("packages")
      .select("duration_days")
      .eq("id", package_id)
      .single();

    const durationDays = Number(pkg?.duration_days ?? 0);
    if (durationDays <= 0) {
      redirect(`/subscriptions/new?brand=${brandId}`);
    }

    const start = new Date(start_date_raw);
    const end = addDays(start, durationDays);

    await sb.from("subscriptions").insert({
      brand_id: brandId,
      package_id,
      start_date: toInputDate(start),
      end_date: toInputDate(end),
      manually_disabled: false
    });

    redirect(`/brands/${brandId}`);
  }

  return (
    <AppShell title="Nova pretplata" role={u.role}>
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-lg font-semibold">
          {renew ? "Produženje pretplate" : "Nova pretplata"}
        </h2>

        <NewSubscriptionForm
          packages={pkgList}
          renew={Boolean(renew)}
          renewPackageId={renewPackageId}
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
          action={createSubscription}
        />
      </div>
    </AppShell>
  );
}
