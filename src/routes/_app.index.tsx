import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, FileText, ListChecks, Mail, MessageSquare, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { WeeklyChart } from "@/components/charts/weekly-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { useUsage } from "@/hooks/use-usage";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workspace AI" },
      { name: "description", content: "Track productivity gains and launch AI tools from one place." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/email", title: "Generate Email", desc: "Create professional emails instantly.", icon: Mail },
  { to: "/meetings", title: "Summarize Meeting", desc: "Turn transcripts into action items.", icon: FileText },
  { to: "/planner", title: "Plan Tasks", desc: "Convert goals into project plans.", icon: ListChecks },
  { to: "/research", title: "Research Topic", desc: "Generate business research reports.", icon: Search },
  { to: "/chat", title: "Ask AI", desc: "Open the workplace assistant.", icon: MessageSquare },
] as const;

function Dashboard() {
  const u = useUsage();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Productivity Dashboard"
        description="Your AI-powered workspace at a glance. Time saved updates automatically as you use the tools."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Emails Generated" value={u.counts.email} icon={Mail} accent="primary" />
        <KpiCard label="Meetings Summarized" value={u.counts.meeting} icon={FileText} accent="success" />
        <KpiCard label="Tasks Planned" value={u.counts.task} icon={ListChecks} accent="warning" />
        <KpiCard label="Research Reports" value={u.counts.research} icon={Search} accent="chart-5" />
        <KpiCard
          label="Time Saved"
          value={`${u.totalHours} hrs`}
          sublabel={`${u.weekHours}h this week · ${u.monthHours}h this month`}
          icon={Clock}
          accent="destructive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Time Saved Over Time</h3>
              <p className="text-xs text-muted-foreground">Minutes saved per day (last 14 days)</p>
            </div>
          </div>
          <TrendChart data={u.days} />
        </Card>
        <Card className="p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Tool Usage Distribution</h3>
            <p className="text-xs text-muted-foreground">Share of activities by tool</p>
          </div>
          <DistributionChart data={u.distribution} />
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3">
          <h3 className="text-sm font-semibold">Weekly Activity</h3>
          <p className="text-xs text-muted-foreground">Activities completed this week</p>
        </div>
        <WeeklyChart data={u.days} />
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group flex flex-col gap-2 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <a.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}