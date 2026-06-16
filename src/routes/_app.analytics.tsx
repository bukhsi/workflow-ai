import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { useUsage } from "@/hooks/use-usage";
import { TIME_SAVED_MINUTES, TOOL_LABELS, type ToolKey } from "@/lib/usage";
import { Clock, TrendingUp, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Bukhulu's AI" },
      { name: "description", content: "Productivity trends and time-saved breakdown." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const u = useUsage();
  const breakdown = (Object.keys(u.counts) as ToolKey[])
    .map((tool) => ({
      tool,
      label: TOOL_LABELS[tool],
      count: u.counts[tool],
      minutes: u.counts[tool] * TIME_SAVED_MINUTES[tool],
    }))
    .sort((a, b) => b.minutes - a.minutes);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="See where AI is saving you the most time."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="This Week" value={`${u.weekHours} hrs`} icon={Calendar} accent="primary" />
        <KpiCard label="This Month" value={`${u.monthHours} hrs`} icon={TrendingUp} accent="success" />
        <KpiCard label="Lifetime" value={`${u.totalHours} hrs`} icon={Clock} accent="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Productivity Trend</h3>
          <TrendChart data={u.days} />
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Tool Distribution</h3>
          <DistributionChart data={u.distribution} />
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Weekly Activity</h3>
        <WeeklyChart data={u.days} />
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Time Saved Breakdown</h3>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Tool</th>
                <th className="px-4 py-2">Activities</th>
                <th className="px-4 py-2">Avg time saved</th>
                <th className="px-4 py-2">Total time saved</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row) => (
                <tr key={row.tool} className="border-t">
                  <td className="px-4 py-2 font-medium">{row.label}</td>
                  <td className="px-4 py-2">{row.count}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {TIME_SAVED_MINUTES[row.tool]} min
                  </td>
                  <td className="px-4 py-2 font-semibold text-primary">
                    {(row.minutes / 60).toFixed(1)} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}