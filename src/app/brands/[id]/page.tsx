export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";
import Link from "next/link";

import {
  disableSubscription,
  enableSubscription,
  deleteSubscription
} from "@/src/app/subscriptions/actions";

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("hr-HR");
}

function isExpired(endDate?: string | null) {
  return endDate ? new Date(endDate) < new Date() : false;
}

function deriveStatus(s: {
  manually_disabled: boolean | null;
  end_date: string | null;
}) {
  if (s.manually_disabled) return "Isključena";
  if (isExpired(s.end_date)) return "Neaktivna";
  return "Aktivna";
}

function canRenewPackage(packageName?: string) {
  return packageName
    ? packageName.toLowerCase().includes("pristup sadržaju")
    : false;
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

  const isAdmin = u.role === "admin";

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

  async function updateContactPerson(formData: FormData) {
    "use server";
    const value = formData.get("value") as string | null;
    const sb = await supabaseServer();
    await sb
      .from("brands")
      .update({ contact_person: value || null })
      .eq("id", id);
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

  const activeSubs =
    subscriptions?.filter((s) => !isExpired(s.end_date)) ?? [];

  const expiredSubs =
    subscriptions?.filter((s) => isExpired(s.end_date)) ?? [];

  return (
    <AppShell title={brand.name} role={u.role}>
      {/* PROFIL */}
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base sm:text-lg font-semibold">Profil brenda</h2>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href={`/brands/${id}/edit`}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs sm:text-sm text-zinc-300 hover:text-purple-300 hover:bg-zinc-800 transition"
              >
                ✏️ Editiraj brend
              </Link>
            )}

            {brandIsDisabled ? (
              <form action={enableBrand}>
                <button className="rounded-lg border border-green-600/40 bg-green-600/20 px-3 py-1 text-xs sm:text-sm text-green-400">
                  Uključi brend
                </button>
              </form>
            ) : (
              <form action={disableBrand}>
                <button className="rounded-lg border border-red-600/40 bg-red-600/20 px-3 py-1 text-xs sm:text-sm text-red-400">
                  Isključi brend
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 text-xs sm:text-sm">
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
              <form action={updateContactPerson}>
                <input
                  name="value"
                  defaultValue={brand.contact_person ?? ""}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs sm:text-sm"
                />
              </form>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1 text-xs sm:text-sm text-zinc-500">
            Napomena
          </div>
          <form action={updateBrandNote}>
            <textarea
              name="value"
              defaultValue={brand.note ?? ""}
              rows={4}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs sm:text-sm"
            />
          </form>
        </div>
      </div>

      {/* PRETPLATE */}
      <h2 className="mb-3 text-base sm:text-lg font-semibold">
        Pretplate ({subscriptions?.length ?? 0})
      </h2>

      {/* AKTIVNE */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeSubs.map((s) => {
          const packageName = packageMap[s.package_id];
          const canRenew =
            isAdmin &&
            canRenewPackage(packageName) &&
            !s.manually_disabled;

          return (
            <div
              key={s.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs sm:text-sm"
            >
              <div className="mb-1 font-medium">
                {packageName ?? "—"}
              </div>

              <div className="text-zinc-400">
                {formatDate(s.start_date)} – {formatDate(s.end_date)}
              </div>

              <div className="mt-1">{deriveStatus(s)}</div>

              {canRenew && (
                <Link
                  href={`/subscriptions/new?brand=${id}&renew=${s.id}`}
                  className="mt-3 inline-block text-xs text-green-400 hover:underline"
                >
                  Produži
                </Link>
              )}

              {isAdmin && (
                <form action={deleteSubscription} className="mt-3">
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg border border-red-600/40 bg-red-600/10 px-2 py-1 text-xs text-red-400 hover:bg-red-600/20 hover:text-red-300 transition"
                  >
                    🗑 Obriši
                  </button>
                </form>
              )}
            </div>
          );
        })}

        <Link
          href={`/subscriptions/new?brand=${id}`}
          className="flex items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20 p-4 text-xs sm:text-sm text-zinc-400 hover:bg-zinc-900/40"
        >
          + Nova pretplata
        </Link>
      </div>

      {/* ISTEKLO */}
      {expiredSubs.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-3 text-sm font-semibold text-zinc-500">
            Isteklo
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expiredSubs.map((s) => {
              const packageName = packageMap[s.package_id];
              const canRenew =
                isAdmin &&
                canRenewPackage(packageName) &&
                !s.manually_disabled;

              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 text-xs sm:text-sm opacity-60"
                >
                  <div className="mb-1 font-medium">
                    {packageName ?? "—"}
                  </div>

                  <div className="text-zinc-400">
                    {formatDate(s.start_date)} – {formatDate(s.end_date)}
                  </div>

                  <div className="mt-1">Neaktivna</div>

                  {canRenew && (
                    <Link
                      href={`/subscriptions/new?brand=${id}&renew=${s.id}`}
                      className="mt-3 inline-block text-xs text-green-400 hover:underline"
                    >
                      Produži
                    </Link>
                  )}

                  {isAdmin && (
                    <form action={deleteSubscription} className="mt-3">
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-600/40 bg-red-600/10 px-2 py-1 text-xs text-red-400 hover:bg-red-600/20 hover:text-red-300 transition"
                      >
                        🗑 Obriši
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
