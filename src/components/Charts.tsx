"use client";

import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

type PackageBreakdown = {
  package_name: string;
  subscriptions_count: number;
};

type MonthData = {
  month: string;
  total: number;
  breakdown: PackageBreakdown[];
};

const MONTHS_HR = [
  "Sij", "Vel", "Ožu", "Tra", "Svi", "Lip",
  "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"
];

function formatMonth(month: string) {
  const d = new Date(month);
  return `${MONTHS_HR[d.getMonth()]} ${d.getFullYear()}.`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload || !payload.length) return null;

  const data: MonthData = payload[0].payload;

  return (
    <div
      className="rounded-xl p-3 text-sm shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, rgba(148,117,204,0.95), rgba(175,155,216,0.95))",
        color: "#1f1b2e",
      }}
    >
      <div className="mb-2 font-semibold">
        {formatMonth(data.month)}
      </div>

      <div className="mb-2">
        Ukupno: <b>{data.total}</b>
      </div>

      <div className="space-y-1">
        {data.breakdown.map((b) => (
          <div
            key={b.package_name}
            className="flex justify-between gap-4"
          >
            <span>{b.package_name}</span>
            <span className="font-medium">
              {b.subscriptions_count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendCharts({
  newSubs,
  endedSubs,
}: {
  newSubs: MonthData[];
  endedSubs: MonthData[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* NOVE PRETPLATE */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 text-sm text-zinc-300">
          Nove pretplate (zadnjih 6 mjeseci)
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={newSubs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatMonth} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                dataKey="total"
                fill="#9475CC"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ZAVRŠILE PRETPLATE */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="mb-3 text-sm text-zinc-300">
          Završile pretplate (zadnjih 6 mjeseci)
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={endedSubs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatMonth} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#AF9BD8"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
