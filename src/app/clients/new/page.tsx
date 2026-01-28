export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

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

export default async function NewClientPage({
  searchParams
}: {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
}) {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);

  if (!u || u.role !== "admin") redirect("/login");

  const sp = await searchParams;
  const success = sp?.success;
  const error = sp?.error;

  async function createClientAndBrand(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const client_name = formData.get("client_name") as string;
    const brand_name = formData.get("brand_name") as string;
    const oib = (formData.get("oib") as string)?.trim();
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const contact_person = formData.get("contact_person") as string;
    const note = formData.get("note") as string;

    if (oib && !isValidOIB(oib)) {
      redirect("/clients/new?error=oib");
    }

    // 1️⃣ CLIENT
    const { data: client, error: clientError } = await sb
      .from("clients")
      .insert({
        name: client_name,
        oib: oib || null,
        address,
        phone,
        email
      })
      .select("id")
      .single();

    if (clientError || !client) {
      console.error("CLIENT INSERT ERROR:", clientError);
      redirect("/clients/new?error=db");
    }

    // 2️⃣ BRAND
    const { data: brand, error: brandError } = await sb
      .from("brands")
      .insert({
        name: brand_name,
        email,
        contact_person,
        note: note || null,
        client_id: client.id
      })
      .select("id")
      .single();

    if (brandError || !brand) {
      console.error("BRAND INSERT ERROR:", brandError);
      redirect("/clients/new?error=db");
    }

    // 3️⃣ SUCCESS
    redirect(`/brands/${brand.id}?success=created`);
  }

  return (
    <AppShell title="Novi klijent i brend" role={u.role}>
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Dodavanje klijenta i brenda
        </h2>

        {success && (
          <div className="mb-4 rounded-lg border border-green-600/40 bg-green-600/20 px-3 py-2 text-sm text-green-400">
            Klijent i brend su uspješno kreirani.
          </div>
        )}

        {error === "oib" && (
          <div className="mb-4 rounded-lg border border-red-600/40 bg-red-600/20 px-3 py-2 text-sm text-red-400">
            Uneseni OIB nije ispravan.
          </div>
        )}

        {error === "db" && (
          <div className="mb-4 rounded-lg border border-red-600/40 bg-red-600/20 px-3 py-2 text-sm text-red-400">
            Došlo je do greške pri spremanju podataka.
          </div>
        )}

        <form action={createClientAndBrand} className="space-y-4 text-sm">
          <input name="client_name" required placeholder="Klijent" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <input name="brand_name" required placeholder="Brend" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <input name="oib" placeholder="OIB (11 znamenki)" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <input name="address" placeholder="Adresa" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <input type="email" name="email" placeholder="Email" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <input name="phone" placeholder="Telefon" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <input name="contact_person" placeholder="Kontakt osoba" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />
          <textarea name="note" rows={3} placeholder="Napomena" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2" />

          <button className="w-full rounded-lg bg-green-600/80 py-2 font-medium text-white hover:bg-green-600">
            Spremi
          </button>
        </form>
      </div>
    </AppShell>
  );
}
