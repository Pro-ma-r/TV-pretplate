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
  if (s.end_date && new Date(s.end_date) < new Date())
    return "Neaktivna";
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
      *,
      clients (
        name,
        email,
        oib,
        address,
        phone
      )
    `
    )
    .eq("id", id)
    .single();

  if (!brand) {
    return (
      <AppShell title="Brend" role={u.role}>
        <div className="text-sm text-zinc-400">
          Brend ne postoji.
        </div>
      </AppShell>
    );
  }

  const displayEmail =
    brand.clients?.email ?? brand.email ?? "—";

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
      packages ( name )
    `
    )
    .eq("brand_id", brand.id)
    .order("start_date", { ascending: false });

  // INLINE UPDATE
  async function updateBrandField(
    field: "contact_person" | "note",
    formData: FormData
  ) {
    "use server";
    const value = formData.get("value") as string | null;

    const sb = await supabaseServer();
    await sb
      .from("brands")
      .update({ [field]: value || null })
      .eq("id", id);
  }

  return (
    <AppShell title={brand.name} role={u.role}>
      {/* PROFIL BRENDA */}
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-3 text-lg font-semibold">
          Profil brenda
        </h2>

        <div className="grid gap-3 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-500">Klijent:</span>{" "}
            {brand.clients?.name ?? "—"}
          </div>

          <div>
            <span className="text-zinc-500">OIB:</span>{" "}
            {brand.clients?.oib ?? "—"}
          </div>

          <div>
            <span className="text-zinc-500">Adresa:</span>{" "}
            {brand.clients?.address ?? "—"}
          </div>

          <div>
            <span className="text-zinc-500">Telefon:</span>{" "}
            {brand.clients?.phone ?? "—"}
          </div>

          <div>
            <span className="text-zinc-500">Email:</span>{" "}
            {displayEmail}
          </div>

          {/* KONTAKT OSOBA */}
          <div>
            <span className="text-zinc-500">
              Kontakt osoba:
            </span>
            <form
              action={updateBrandField.bind(
                null,
                "contact_person"
              )}
            >
              <input
                name="value"
                defaultValue={brand.contact_person ?? ""}
                placeholder="Unesi kontakt osobu"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm"
              />
            </form>
          </div>

          {/* NAPOMENA */}
          <div>
            <span className="text-zinc-500">Napomena:</span>
            <form
              action={updateBrandField.bind(null, "note")}
            >
              <textarea
                name="value"
                defaultValue={brand.note ?? ""}
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

        {subscriptions?.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="grid gap-2 text-sm text-zinc-300">
              <div>
                <span className="text-zinc-500">Paket:</span>{" "}
                {s.packages?.[0]?.name ?? "—"}
              </div>

              <div>
                <span className="text-zinc-500">Period:</span>{" "}
                {formatDate(s.start_date)} –{" "}
                {formatDate(s.end_date)}
              </div>

              <div>
                <span className="text-zinc-500">Status:</span>{" "}
                {deriveStatus(s)}
              </div>

              {s.note && (
                <div>
                  <span className="text-zinc-500">
                    Napomena:
                  </span>{" "}
                  {s.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
