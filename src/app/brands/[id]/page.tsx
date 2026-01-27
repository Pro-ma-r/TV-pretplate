export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";
import BrandToggle from "./toggle-client";

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("hr-HR");
}

function deriveStatus(s: {
  manually_disabled: boolean | null;
  end_date: string | null;
}) {
  if (s.manually_disabled) return "Isključena";
  if (s.end_date && new Date(s.end_date) < new Date()) return "Neaktivna";
  return "Aktivna";
}

export default async function BrandPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const { data: brand } = await supabase
    .from("brands")
    .select(
      `
      id,
      name,
      email,
      contact_person,
      note,
      clients (
        name,
        oib,
        address,
        phone,
        email
      )
    `
    )
    .eq("id", id)
    .single();

  if (!brand) {
    return (
      <AppShell title="Brend" role={u.role}>
        <div className="text-sm text-zinc-400">Brend ne postoji.</div>
      </AppShell>
    );
  }

  const client = (brand as any).clients ?? null;

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      start_date,
      end_date,
      manually_disabled,
      note,
      package_id
    `
    )
    .eq("brand_id", id)
    .order("start_date", { ascending: false });

  const { data: packages } = await supabase
    .from("packages")
    .select("id,name");

  const packageMap =
    packages?.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {}) ?? {};

  const brandIsDisabled =
    subscriptions?.length
      ? subscriptions.every((s) => s.manually_disabled)
      : false;

  return (
    <AppShell title={brand.name} role={u.role}>
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profil brenda</h2>

          {/* 🔥 IDENTIČNA LOGIKA KAO /subscriptions */}
          <BrandToggle
            brandId={id}
            disabled={brandIsDisabled}
            brandName={brand.name}
          />
        </div>

        <div className="grid gap-3 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-500">Klijent:</span>{" "}
            {client?.name ?? "—"}
          </div>
          <div>
            <span className="text-zinc-500">OIB:</span> {client?.oib ?? "—"}
          </div>
          <div>
            <span className="text-zinc-500">Adresa:</span>{" "}
            {client?.address ?? "—"}
          </div>
          <div>
            <span className="text-zinc-500">Telefon:</span>{" "}
            {client?.phone ?? "—"}
          </div>
          <div>
            <span className="text-zinc-500">Email:</span>{" "}
            {brand.email ?? client?.email ?? "—"}
          </div>
          <div>
            <span className="text-zinc-500">Kontakt osoba:</span>{" "}
            {brand.contact_person ?? "—"}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Pretplate ({subscriptions?.length ?? 0})
        </h2>

        {subscriptions?.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="grid gap-2 text-sm text-zinc-300">
              <div>
                <span className="text-zinc-500">Paket:</span>{" "}
                {packageMap[s.package_id] ?? "—"}
              </div>
              <div>
                <span className="text-zinc-500">Period:</span>{" "}
                {formatDate(s.start_date)} – {formatDate(s.end_date)}
              </div>
              <div>
                <span className="text-zinc-500">Status:</span>{" "}
                {deriveStatus(s)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
