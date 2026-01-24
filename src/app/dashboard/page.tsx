import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import type { DashboardStats, DashboardPackage, DashboardActivity, SubscriptionWithStatus } from "@/src/types/db";
import { AppShell } from "@/src/components/AppShell";
import { StatCard } from "@/src/components/StatCard";
import { TrendCharts } from "@/src/components/Charts";
import { buildMonthlyTrend } from "@/src/lib/trend";

export default async function DashboardPage() {
  const u = await requireUser();
  if (!u) redirect("/login");

  const supabase = await supabaseServer();

  const statsRes = await supabase.from("dashboard_stats").select("*").single<DashboardStats>();
  const pkgsRes = await supabase.from("dashboard_packages").select("*").returns<DashboardPackage[]>();
  const actRes = await supabase.from("dashboard_activities").select("*").returns<DashboardActivity[]>();

  // trend: uzmemo sve pretplate (malo ih je ~500) i računamo mjesece
  const subsRes = await supabase
    .from("subscriptions_with_status")
    .select("start_date,end_date,status")
    .returns<Array<Pick<SubscriptionWithStatus, "start_date" | "end_date" | "status">>>();

  const stats = statsRes.data!;
  const trend = buildMonthlyTrend(subsRes.data ?? []);

  return (
    <AppShell title="Dashboard" role={u.role}>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Aktivni brendovi" value={stats.active_brands} />
        <StatCard label="Neaktivni brendovi" value={stats.former_brands} />
        <StatCard label="Aktivne pretplate" value={stats.active_subscriptions} />
        <StatCard label="Isključene pretplate" value={stats.disabled_subscriptions} />
      </div>

      <div className="mt-6">
        <TrendCharts data={trend} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="mb-3 text-sm text-zinc-300">Top paketi (aktivne pretplate)</div>
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-300">
              <tr className="border-b border-zinc-800">
                <th className="py-2 pr-4">Paket</th>
                <th className="py-2 pr-4">Aktivno</th>
              </tr>
            </thead>
            <tbody className="text-zinc-200">
              {(pkgsRes.data ?? []).slice(0, 12).map((p) => (
                <tr key={p.package_id} className="border-b border-zinc-900">
                  <td className="py-2 pr-4">{p.package_name}</td>
                  <td className="py-2 pr-4">{p.active_subscriptions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="mb-3 text-sm text-zinc-300">Djelatnosti (aktivne pretplate)</div>
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-300">
              <tr className="border-b border-zinc-800">
                <th className="py-2 pr-4">Activity</th>
                <th className="py-2 pr-4">Brendova</th>
                <th className="py-2 pr-4">Aktivno</th>
              </tr>
            </thead>
            <tbody className="text-zinc-200">
              {(actRes.data ?? []).slice(0, 12).map((a, i) => (
                <tr key={`${a.activity ?? "—"}-${i}`} className="border-b border-zinc-900">
                  <td className="py-2 pr-4">{a.activity ?? "—"}</td>
                  <td className="py-2 pr-4">{a.total_brands}</td>
                  <td className="py-2 pr-4">{a.active_subscriptions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
