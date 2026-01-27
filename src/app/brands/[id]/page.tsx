export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

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

  // BRAND + CLIENT
  const { data: brand } = await supabase
    .from("brands")
    .select(
      `
      id,
      name,
      email,
      contact_person,
      note,
      client_id,
      clients (
        id,
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

  // PRETPLATE
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

  // PAKETI
  const { data: packages } = await supabase.from("packages").select("id, name");

  const packageMap =
    packages?.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {}) ?? {};

  // UPDATE NAPOMENE
  async function updateBrandNote(formData: FormData) {
    "use server";
    const value = formData.get("value") as string | null;

    const sb = await supabaseServer();
    await sb.from("brands").update({ note: value || null }).eq("id", id);
  }

  // ✅ GUMB NA NIVOU BRENDA:
  // - Isključi brend -> manually_disabled=true za SVE pretplate brenda
  // - Uključi brend  -> manually_disabled=false za SVE pretplate brenda
  async function setBrandDisabled(formData: FormData) {
    "use server";

    const disable = formData.get("disable") === "true";

    const sb = await supabaseServer();
    await sb
      .from("subscriptions")
      .update({ manually_disabled: disable })
      .eq("brand_id", id);
  }

  const brandIsDisabled = subscriptions?.some((s) => s.manually_disabled) ?? false;

  return (
    <AppShell title={brand.name} role={u.role}>
      {/* PROFIL BRENDA */}
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profil brenda</h2>

          {/* ✅ GUMB UKLJUČI / ISKLJUČI – NIVOU BRENDA */}
          <form action={setBrandDisabled}>
            <input type="hidden" name="disable" value={brandIsDisabled ? "false" : "true"} />
            <button
              type="submit"
              className={`rounded-lg px-3 py-1 text-sm ${
                brandIsDisabled
                  ? "bg-green-600/20 text-green-400 border border-green-600/40"
                  : "bg-red-600/20 text-red-400 border border-red-600/40"
              }`}
            >
              {brandIsDisabled ? "Uključi brend" : "Isključi brend"}
            </button>
          </form>
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

          <div>
            <span className="text-zinc-500">Napomena:</span>
            <form action={updateBrandNote}>
              <textarea
                name="value"
                defaultValue={brand.note ?? ""}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                rows={3}
              />
            </form>
          </div>
        </div>
      </div>

      {/* PRETPLATE */}
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

              {s.note && (
                <div>
                  <span className="text-zinc-500">Napomena:</span> {s.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
