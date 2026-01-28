export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireUser } from "@/src/lib/auth";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { AppShell } from "@/src/components/AppShell";
import ReportsView from "./reports-view";

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: Promise<{
    paket?: "CONTENT" | "OTHER";
    istek?: "PAST" | "FUTURE";
    dana?: string;
  }>;
}) {
  const supabase = await supabaseServer();
  const u = await requireUser(supabase);
  if (!u) redirect("/login");

  const sp = await searchParams;

  const paket = sp?.paket ?? "CONTENT";
  const istek = sp?.istek ?? "FUTURE";
  const dana = Number(sp?.dana ?? 5);

  const today = new Date();
  const pastFrom = new Date(today);
  pastFrom.setDate(today.getDate() - dana);

  const futureTo = new Date(today);
  futureTo.setDate(today.getDate() + dana);

  const { data } = await supabase
    .from("subscriptions")
    .select(
      `
      start_date,
      end_date,
      packages ( name ),
      brands (
        id,
        name,
        email,
        clients ( email )
      )
    `
    );

  const rows =
    data
      ?.filter((s: any) => {
        const end = new Date(s.end_date);

        const isContent =
          s.packages?.name
            ?.toLowerCase()
            .includes("pristup sadržaju") ?? false;

        // filter po paketu
        if (paket === "CONTENT" && !isContent) return false;
        if (paket === "OTHER" && isContent) return false;

        // filter po isteku
        if (istek === "PAST") {
          return end >= pastFrom && end < today;
        }

        // FUTURE
        return end >= today && end <= futureTo;
      })
      .map((s: any) => ({
        brand_id: s.brands.id,
        brand_name: s.brands.name,
        package_name: s.packages.name,
        start_date: s.start_date,
        end_date: s.end_date,
        email: s.brands.email ?? s.brands.clients?.email ?? null
      })) ?? [];

  return (
    <AppShell title="Izvještaji" role={u.role}>
      <ReportsView
        paket={paket}
        istek={istek}
        dana={dana}
        rows={rows}
      />
    </AppShell>
  );
}
