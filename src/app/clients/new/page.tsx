export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

export default async function NewClientPage() {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);

  if (!u || u.role !== "admin") {
    redirect("/login");
  }

  async function createClientAndBrand(formData: FormData) {
    "use server";

    const sb = await supabaseServer();

    const client_name = formData.get("client_name") as string;
    const brand_name = formData.get("brand_name") as string;
    const oib = formData.get("oib") as string;
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const contact_person = formData.get("contact_person") as string;
    const note = formData.get("note") as string;

    // 1️⃣ KREIRAJ KLIJENTA
    const { data: client, error: clientError } = await sb
      .from("clients")
      .insert({
        name: client_name,
        oib,
        address,
        phone,
        email
      })
      .select("id")
      .single();

    if (clientError || !client) {
      throw new Error("Greška kod kreiranja klijenta");
    }

    // 2️⃣ KREIRAJ BREND
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
      throw new Error("Greška kod kreiranja brenda");
    }

    // 3️⃣ REDIRECT NA BREND
    redirect(`/brands/${brand.id}`);
  }

  return (
    <AppShell title="Novi klijent i brend" role={u.role}>
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Dodavanje klijenta i brenda
        </h2>

        <form action={createClientAndBrand} className="space-y-4 text-sm">
          <div>
            <div className="mb-1 text-zinc-500">Klijent</div>
            <input
              name="client_name"
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <div>
            <div className="mb-1 text-zinc-500">Brend</div>
            <input
              name="brand_name"
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <div>
            <div className="mb-1 text-zinc-500">OIB</div>
            <input
              name="oib"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <div>
            <div className="mb-1 text-zinc-500">Adresa</div>
            <input
              name="address"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <div>
            <div className="mb-1 text-zinc-500">Mail adresa</div>
            <input
              type="email"
              name="email"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <div>
            <div className="mb-1 text-zinc-500">Broj telefona</div>
            <input
              name="phone"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <div>
            <div className="mb-1 text-zinc-500">Kontakt osoba</div>
            <input
              name="contact_person"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <div>
            <div className="mb-1 text-zinc-500">Napomena</div>
            <textarea
              name="note"
              rows={3}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600/80 py-2 font-medium text-white hover:bg-green-600"
          >
            Spremi
          </button>
        </form>
      </div>
    </AppShell>
  );
}
