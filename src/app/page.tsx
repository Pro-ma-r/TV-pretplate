export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";

export default async function HomePage() {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);

  // ⬅️ ako nije loginan, uvijek šaljemo na /login
  if (!u) {
    redirect("/login");
  }

  return (
    <AppShell title="Početna" role={u.role}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* KARTICA 1 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-sm text-zinc-400">
            Brendovi
          </div>
          <div className="mt-1 text-2xl font-semibold">
            —
          </div>
        </div>

        {/* KARTICA 2 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-sm text-zinc-400">
            Aktivne pretplate
          </div>
          <div className="mt-1 text-2xl font-semibold">
            —
          </div>
        </div>

        {/* KARTICA 3 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-sm text-zinc-400">
            Istekle pretplate
          </div>
          <div className="mt-1 text-2xl font-semibold">
            —
          </div>
        </div>
      </div>
    </AppShell>
  );
}
