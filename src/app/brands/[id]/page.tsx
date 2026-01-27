import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { requireUser } from "@/src/lib/auth";
import { AppShell } from "@/src/components/AppShell";

export default async function BrandPage({ params }: any) {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!brand) return <div>Brend ne postoji</div>;

  return (
    <AppShell title={brand.name} role={u.role}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Podaci o brendu</h2>
          <div className="text-sm text-zinc-400">
            ID: {brand.id}
          </div>
        </div>

        <pre className="rounded-xl bg-zinc-950 p-4 text-sm">
          {JSON.stringify(brand, null, 2)}
        </pre>
      </div>
    </AppShell>
  );
}
