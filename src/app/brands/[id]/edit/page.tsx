export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import Link from "next/link";

function isValidOIB(oib: string) {
  if (!/^\d{11}$/.test(oib)) return false;

  let a = 10;
  for (let i = 0; i < 10; i++) {
    a = a + Number(oib[i]);
    a = a % 10;
    if (a === 0) a = 10;
    a = (a * 2) % 11;
  }

  const kontrolna = (11 - a) % 10;
  return kontrolna === Number(oib[10]);
}

export default async function EditBrandPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 🔐 auth provjera (obični client)
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u || u.role !== "admin") redirect("/dashboard");

  // ✅ SELECT preko admina (da sigurno povuče podatke)
  const { data } = await supabaseAdmin
    .from("brands")
    .select(
      `
      id,
      name,
      email,
      contact_person,
      note,
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

  if (!data) {
    return (
      <AppShell title="Greška" role={u.role}>
        <div className="text-sm text-red-400">Brend ne postoji.</div>
      </AppShell>
    );
  }

  const brand = data;

  // ✅ JEDINI FIX: radi i ako Supabase vrati clients kao OBJECT ili kao ARRAY,
  // i TypeScript više neće tretirati client kao array pa neće pucati na client.id
  const client = (
    Array.isArray((data as any).clients)
      ? (data as any).clients[0]
      : (data as any).clients
  ) as any;

  async function updateClientAndBrand(formData: FormData) {
    "use server";

    const sb = supabaseAdmin;

    const client_name = formData.get("client_name") as string;
    const brand_name = formData.get("brand_name") as string;
    const oib = (formData.get("oib") as string)?.trim();
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const contact_person = formData.get("contact_person") as string;
    const note = formData.get("note") as string;

    if (oib && !isValidOIB(oib)) {
      redirect(`/brands/${id}/edit?error=oib`);
    }

    if (client) {
      await sb
        .from("clients")
        .update({
          name: client_name,
          oib: oib || null,
          address,
          phone,
          email
        })
        .eq("id", client.id);
    }

    await sb
      .from("brands")
      .update({
        name: brand_name,
        email,
        contact_person,
        note: note || null
      })
      .eq("id", brand.id);

    redirect(`/brands/${id}`);
  }

  return (
    <AppShell title="Editiraj brend i klijenta" role={u.role}>
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Uređivanje klijenta i brenda
        </h2>

        <form action={updateClientAndBrand} className="space-y-4 text-sm">
          <input
            name="client_name"
            defaultValue={client?.name ?? ""}
            placeholder="Klijent"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          <input
            name="brand_name"
            defaultValue={brand.name}
            placeholder="Brend"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          <input
            name="oib"
            defaultValue={client?.oib ?? ""}
            placeholder="OIB"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          <input
            name="address"
            defaultValue={client?.address ?? ""}
            placeholder="Adresa"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          <input
            type="email"
            name="email"
            defaultValue={brand.email ?? client?.email ?? ""}
            placeholder="Email"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          <input
            name="phone"
            defaultValue={client?.phone ?? ""}
            placeholder="Telefon"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          <input
            name="contact_person"
            defaultValue={brand.contact_person ?? ""}
            placeholder="Kontakt osoba"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          <textarea
            name="note"
            defaultValue={brand.note ?? ""}
            rows={3}
            placeholder="Napomena"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
          />

          {/* GUMBI */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-purple-600/80 py-2 font-medium text-white hover:bg-purple-600"
            >
              Spremi promjene
            </button>

            <Link
              href={`/brands/${id}`}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 py-2 text-center font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Odustani
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
