export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import ReportsFilters from "./reports-filters";

export default async function ReportsPage() {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  return (
    <AppShell title="Izvještaji" role={u.role}>
      <ReportsFilters />
    </AppShell>
  );
}
