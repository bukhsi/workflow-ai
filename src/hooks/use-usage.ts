import { useEffect, useMemo, useState } from "react";
import { loadEvents, type UsageEvent, type ToolKey } from "@/lib/usage";

export function useUsage() {
  const [events, setEvents] = useState<UsageEvent[]>([]);

  useEffect(() => {
    setEvents(loadEvents());
    const handler = () => setEvents(loadEvents());
    window.addEventListener("wpa-usage-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("wpa-usage-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return useMemo(() => derive(events), [events]);
}

function derive(events: UsageEvent[]) {
  const counts: Record<ToolKey, number> = {
    email: 0,
    meeting: 0,
    task: 0,
    research: 0,
    chat: 0,
  };
  let totalMinutes = 0;
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  let weekMinutes = 0;
  let monthMinutes = 0;

  for (const e of events) {
    counts[e.tool] = (counts[e.tool] ?? 0) + 1;
    totalMinutes += e.minutesSaved;
    const t = new Date(e.at).getTime();
    if (t >= weekAgo) weekMinutes += e.minutesSaved;
    if (t >= monthAgo) monthMinutes += e.minutesSaved;
  }

  const days: { date: string; minutes: number; activities: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), minutes: 0, activities: 0 });
  }
  const byDay = new Map(days.map((d) => [d.date, d]));
  for (const e of events) {
    const key = e.at.slice(0, 10);
    const day = byDay.get(key);
    if (day) {
      day.minutes += e.minutesSaved;
      day.activities += 1;
    }
  }

  const distribution = (Object.keys(counts) as ToolKey[])
    .map((tool) => ({ tool, count: counts[tool] }))
    .filter((d) => d.count > 0);

  return {
    events,
    counts,
    totalMinutes,
    totalHours: +(totalMinutes / 60).toFixed(1),
    weekHours: +(weekMinutes / 60).toFixed(1),
    monthHours: +(monthMinutes / 60).toFixed(1),
    days,
    distribution,
  };
}