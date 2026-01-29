import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import type {
  DashboardStats,
  DashboardPackage,
  DashboardActivity,
} from "@/src/types/db";
import { AppShell } from "@/src/components/AppShell";
import { StatCard } from "@/src/components/StatCard";
import { TrendCharts } from "@/src/components/Charts";

type TrendRow = {
  month: string;
  package_name: string;
  subscriptions_count: number;
};

type MonthData = {
  month: string;
  total: number;
  breakdown: {
    package_name: string;
    subscriptions_count: number;
  }[];
};

function buildTrend(rows: TrendRow[]): MonthData[] {
  const map = new Map<string, MonthData>();

  for (const r of rows) {
    if (!map.has(r.month)) {
      map.set(r.month, {
        month: r.month,
        total: 0,
        breakdown: [],
      });
    }

    const entry = map.get(r.month)!;
    entry.total += r.subscriptions_count;
    entry.breakdown.push({
      package_name: r.package_name,
      subscriptions_count: r.subscriptions_count,
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

export default async function DashboardPage() {
  const supabase = await supabaseServer();

  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const statsRes = await supabase
    .from("dashboard_stats")
    .select("*")
    .single<DashboardStats>();

  const pkgsRes = await supabase
    .from("dashboard_packages")
    .select("*")
    .returns<DashboardPackage[]>();

  const actRes = await supabase
    .from("dashboard_activities")
    .select("*")
    .returns<DashboardActivity[]>();

  const expiringRes = await supabase
    .from("access_expiring_in_10_days")
    .select("subscription_id", { count: "exact", head: true });

  const newSubsRes = await supabase
    .from("dashboard_new_subscriptions_last_6_months")
    .select("*")
    .returns<TrendRow[]>();

  const endedSubsRes = await supabase
    .from("dashboard_ended_subscriptions_last_6_months")
    .select("*")
    .returns<TrendRow[]>();

  const stats = statsRes.data!;
  const expiringCount = expiringRes.count ?? 0;

  const newSubs = buildTrend(newSubsRes.data ?? []);
  const endedSubs = buildTrend(endedSubsRes.data ?? []);

  return (
    <AppShell title="Dashboard" role={u.role}>
      <div className="grid gap-4 md:grid-cols-4">
        {/* ⬅️ LINK KARTICA */}
        <Link
          href="/subscriptions?expiring=10"
          className="block hover:opacity-90"
        >
          <StatCard
            label="Pristupi koji ističu za 10 dana"
            value={expiringCount}
          />
        </Link>

        <StatCard
          label="Aktivni brendovi"
          value={stats.active_brands}
        />
        <StatCard
          label="Neaktivni brendovi"
          value={stats.former_brands}
        />
        <StatCard
          label="Isključeni brendovi"
          value={stats.disabled_brands}
        />
      </div>

      <div className="mt-6">
        <TrendCharts newSubs={newSubs} endedSubs={endedSubs} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="mb-3 text-sm text-zinc-300">
            Top paketi (aktivne pretplate)
          </div>
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
                  <td className="py-2 pr-4">
                    <Link
                      href={`/subscriptions?package=${p.package_id}`}
                      className="text-zinc-200 hover:text-purple-300"
                    >
                      {p.package_name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    {p.active_subscriptions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="mb-3 text-sm text-zinc-300">
            Djelatnosti (aktivne pretplate)
          </div>
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
                <tr
                  key={`${a.activity ?? "—"}-${i}`}
                  className="border-b border-zinc-900"
                >
                  <td className="py-2 pr-4">{a.activity ?? "—"}</td>
                  <td className="py-2 pr-4">{a.total_brands}</td>
                  <td className="py-2 pr-4">
                    {a.active_subscriptions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
