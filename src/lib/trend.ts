type Row = { start_date: string; end_date: string; status: string };

function monthKey(dateStr: string) {
  const [y, m] = dateStr.split("-").map(Number);
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function buildMonthlyTrend(rows: Row[]) {
  // new per month by start_date
  const created = new Map<string, number>();
  const ended = new Map<string, number>();

  for (const r of rows) {
    const mkStart = monthKey(r.start_date);
    created.set(mkStart, (created.get(mkStart) ?? 0) + 1);

    const mkEnd = monthKey(r.end_date);
    ended.set(mkEnd, (ended.get(mkEnd) ?? 0) + 1);
  }

  const keys = Array.from(new Set([...created.keys(), ...ended.keys()])).sort();
  return keys.map((k) => ({
    month: k,
    newSubscriptions: created.get(k) ?? 0,
    endedSubscriptions: ended.get(k) ?? 0
  }));
}
