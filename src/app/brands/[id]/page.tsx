export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

import {
  disableSubscription,
  enableSubscription
} from "@/src/app/subscriptions/actions";

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
    .select("id, name");

  const packageMap =
    packages?.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {}) ?? {};

  async function updateBrandNote(formData: FormData) {
    "use server";
    const value = formData.get("value") as string | null;
    const sb = await supabaseServer();
    await sb.from("brands").update({ note: value || null }).eq("id", id);
  }

  async function disableBrand() {
    "use server";
    for (const s of subscriptions ?? []) {
      const fd = new FormData();
      fd.set("id", s.id);
      await disableSubscription(fd);
    }
  }

  async function enableBrand() {
    "use server";
    for (const s of subscriptions ?? []) {
      const fd = new FormData();
      fd.set("id", s.id);
      await enableSubscription(fd);
    }
  }

  const brandIsDisabled =
    subscriptions?.length
      ? subscriptions.every((s) => s.manually_disabled)
      : false;

  return (
    <AppShell title={brand.name} role={u.role}>
      {/* PROFIL BRENDA */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profil brenda</h2>

          {brandIsDisabled ? (
            <form action={enableBrand}>
              <button className="rounded-lg border border-green-600/40 bg-green-600/20 px-3 py-1 text-sm text-green-400">
                Uključi brend
              </button>
            </form>
          ) : (
            <form action={disableBrand}>
              <button className="rounded-lg border border-red-600/40 bg-red-600/20 px-3 py-1 text-sm text-red-400">
                Isključi brend
              </button>
            </form>
          )}
        </div>

        {/* 2 KOLONE */}
        <div className="grid gap-6 md:grid-cols-2 text-sm">
          <div className="space-y-3">
            <div>
              <div className="text-zinc-500">Klijent</div>
              <div>{client?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-zinc-500">OIB</div>
              <div>{client?.oib ?? "—"}</div>
            </div>
            <div>
              <div className="text-zinc-500">Adresa</div>
              <div>{client?.address ?? "—"}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-zinc-500">Telefon</div>
              <div>{client?.phone ?? "—"}</div>
            </div>
            <div>
              <div className="text-zinc-500">Email</div>
              <div>{brand.email ?? client?.email ?? "—"}</div>
            </div>
            <div>
              <div className="text-zinc-500">Kontakt osoba</div>
              <div>{brand.contact_person ?? "—"}</div>
            </div>
          </div>
        </div>

        {/* NAPOMENA */}
        <div className="mt-6">
          <div className="mb-1 text-sm text-zinc-500">Napomena</div>
          <form action={updateBrandNote}>
            <textarea
              name="value"
              defaultValue={brand.note ?? ""}
              rows={4}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            />
          </form>
        </div>
      </div>

      {/* PRETPLATE */}
      <h2 className="mb-3 text-lg font-semibold">
        Pretplate ({subscriptions?.length ?? 0})
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {subscriptions?.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm"
          >
            <div className="mb-2 font-medium">
              {packageMap[s.package_id] ?? "—"}
            </div>

            <div className="text-zinc-400">
              {formatDate(s.start_date)} – {formatDate(s.end_date)}
            </div>

            <div className="mt-1">{deriveStatus(s)}</div>

            {s.note && (
              <div className="mt-2 text-zinc-400">{s.note}</div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
