import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";

export default async function SubscriptionsPage() {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  return (
    <AppShell title="Pretplate – MINIMAL TEST" role={u.role}>
      <div style={{ padding: 24 }}>
        <h1>MINIMAL PAGE OK</h1>
        <p>Ako vidiš ovo, auth + AppShell rade.</p>
      </div>
    </AppShell>
  );
}
