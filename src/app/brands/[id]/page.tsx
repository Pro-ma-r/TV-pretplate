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

type StgRow = {
  Klijent?: string | null;
  ["OD:"]?: string | null;
  ["DO:"]?: string | null;
  ["Kupljeni paket"]?: string | null;
  ["Opaska"]?: string | null;
  ["Kontakt osoba"]?: string | null;
};

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
      note,
      client_id,
      clients (
        id,
        name,
        email,
        oib,
        address,
        phone,
        note
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

  const client = brand.clients?.[0] ?? null;

  // PRETPLATE (datumi + flagovi iz produkcije)
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      start_date,
      end_date,
      manually_disabled,
      note
    `
    )
    .eq("brand_id", id)
    .order("start_date", { ascending: false });

  // STAGING (paketi + kontakt osoba + opaska)
  const { data: stgRowsRaw } = await supabase
    .from("stg_pretplate_raw")
    .select(`Klijent,"OD:","DO:","Kupljeni paket","Opaska","Kontakt osoba"`)
    .eq("Klijent", brand.name);

  const stgRows: StgRow[] = (stgRowsRaw as any) ?? [];

  // mapiranje po periodu: OD|DO -> staging red
  const stgByPeriod = new Map<string, StgRow>();
  for (const r of stgRows) {
    const k = `${r["OD:"] ?? ""}|${r["DO:"] ?? ""}`;
    if (k !== "|") stgByPeriod.set(k, r);
  }

  // fallback vrijednosti za profil (zadnji poznati staging zapis)
  const stgLatest = stgRows[0] ?? null;
  const contactFallback = stgLatest?.["Kontakt osoba"] ?? null;
  const brandNoteFallback = stgLatest?.["Opaska"] ?? null;

  // UPDATE: kontakt osoba se sprema u clients.note
  async function updateClientContact(formData: FormData) {
    "use server";
    if (!client?.id) return;

    const value = formData.get("value") as string | null;
    const sb = await supabaseServer();
    await sb
      .from("clients")
      .update({ note: value || null })
      .eq("id", client.id);
  }

  // UPDATE: napomena brenda se sprema u brands.note
  async function updateBrandNote(formData: FormData) {
    "use server";
    const value = formData.get("value") as string | null;

    const sb = await supabaseServer();
    await sb.from("brands").update({ note: value || null }).eq("id", id);
  }

  return (
    <AppShell title={brand.name} role={u.role}>
      {/* PROFIL BRENDA */}
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-lg font-semibold">Profil brenda</h2>

        <div className="grid gap-3 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-500">Klijent:</span>{" "}
            {client?.name ?? "—"}
          </div>

          <div>
            <span className="text-zinc-500">OIB:</span>{" "}
            {client?.oib ?? "—"}
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
            {client?.email ?? "—"}
          </div>

          {/* KONTAKT OSOBA (clients.note) */}
          <div>
            <span className="text-zinc-500">Kontakt osoba:</span>
            <form action={updateClientContact}>
              <input
                name="value"
                defaultValue={(client?.note ?? contactFallback ?? "") as string}
                placeholder="Unesi kontakt osobu"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm"
              />
            </form>
          </div>

          {/* NAPOMENA BRENDA (brands.note) */}
          <div>
            <span className="text-zinc-500">Napomena:</span>
            <form action={updateBrandNote}>
              <textarea
                name="value"
                defaultValue={(brand.note ?? brandNoteFallback ?? "") as string}
                placeholder="Unesi napomenu..."
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

        {subscriptions?.map((s) => {
          const key = `${s.start_date ?? ""}|${s.end_date ?? ""}`;
          const stg = stgByPeriod.get(key);

          const packageName = stg?.["Kupljeni paket"] ?? "—";

          return (
            <div
              key={s.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="grid gap-2 text-sm text-zinc-300">
                <div>
                  <span className="text-zinc-500">Paket:</span>{" "}
                  {packageName}
                </div>

                <div>
                  <span className="text-zinc-500">Period:</span>{" "}
                  {formatDate(s.start_date)} – {formatDate(s.end_date)}
                </div>

                <div>
                  <span className="text-zinc-500">Status:</span>{" "}
                  {deriveStatus(s)}
                </div>

                {(stg?.["Opaska"] || s.note) && (
                  <div>
                    <span className="text-zinc-500">Napomena:</span>{" "}
                    {stg?.["Opaska"] ?? s.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
