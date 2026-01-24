import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";

export default async function ReportsPage() {
  // ⬅️ jedna Supabase instanca
  const supabase = await supabaseServer();

  // ⬅️ requireUser koristi ISTU instancu
  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  return (
    <AppShell title="Izvještaji" role={u.role}>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        Izvještaji dolaze uskoro…
      </div>
    </AppShell>
  );
}
