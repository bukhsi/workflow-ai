import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { OutputToolbar } from "@/components/output-toolbar";
import { ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { planTasks } from "@/lib/ai.functions";
import { recordEvent } from "@/lib/usage";

export const Route = createFileRoute("/_app/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Bukhulu's AI" },
      { name: "description", content: "Transform goals into structured project roadmaps." },
    ],
  }),
  component: PlannerPage,
});

type Priority = "Low" | "Medium" | "High" | "Critical";
type Plan = {
  milestones: {
    name: string;
    description: string;
    tasks: { title: string; effort: string; dependencies: string[] }[];
  }[];
};

function PlannerPage() {
  const run = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [timeline, setTimeline] = useState("4 weeks");
  const [priority, setPriority] = useState<Priority>("High");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (goal.trim().length < 3) {
      toast.error("Describe your goal");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { goal, timeline, priority } });
      setPlan(res as Plan);
      recordEvent("task");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  };

  const exportText = plan ? formatPlan(plan) : "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="AI Task Planner"
        description="Describe a goal — get a milestone-based project roadmap with effort estimates."
      />
      <AiDisclaimer />
      <Card className="grid gap-4 p-6 md:grid-cols-3">
        <div className="grid gap-2 md:col-span-3">
          <Label htmlFor="goal">Project goal</Label>
          <Textarea
            id="goal"
            placeholder="Launch a redesigned customer onboarding flow that lifts week-1 retention by 15%."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tl">Timeline</Label>
          <Input id="tl" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Low", "Medium", "High", "Critical"] as Priority[]).map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
            {loading ? "Planning…" : "Create plan"}
          </Button>
        </div>
      </Card>

      {plan && (
        <Card className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Project Roadmap</h3>
            <OutputToolbar
              text={exportText}
              filename="project-plan.txt"
              onRegenerate={generate}
              isRegenerating={loading}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {plan.milestones.map((m, i) => (
              <div key={i} className="rounded-xl border bg-card/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                    Phase {i + 1}
                  </Badge>
                  <h4 className="text-sm font-semibold">{m.name}</h4>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{m.description}</p>
                <ul className="space-y-2 text-sm">
                  {m.tasks.map((t, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-border accent-primary"
                      />
                      <div className="flex-1">
                        <div>{t.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="rounded bg-muted px-1.5 py-0.5">{t.effort}</span>
                          {t.dependencies.length > 0 && (
                            <span>↳ depends on: {t.dependencies.join(", ")}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function formatPlan(p: Plan) {
  return p.milestones
    .map(
      (m, i) =>
        `PHASE ${i + 1}: ${m.name}\n${m.description}\n${m.tasks
          .map((t) => `  - ${t.title} [${t.effort}]${t.dependencies.length ? ` (deps: ${t.dependencies.join(", ")})` : ""}`)
          .join("\n")}`,
    )
    .join("\n\n");
}