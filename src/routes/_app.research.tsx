import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Loader2, Search, TrendingUp, Lightbulb, ShieldAlert, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { researchTopic } from "@/lib/ai.functions";
import { recordEvent } from "@/lib/usage";

export const Route = createFileRoute("/_app/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workspace AI" },
      { name: "description", content: "Generate structured business research reports in seconds." },
    ],
  }),
  component: ResearchPage,
});

type Depth = "Quick Overview" | "Detailed Analysis" | "Expert Report";
type Report = {
  overview: string;
  keyFindings: string[];
  industryTrends: string[];
  opportunities: string[];
  risks: string[];
  references: string[];
};

function ResearchPage() {
  const run = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<Depth>("Detailed Analysis");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (topic.trim().length < 3) {
      toast.error("Enter a research topic");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { topic, depth } });
      setReport(res as Report);
      recordEvent("research");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const exportText = report ? formatReport(topic, report) : "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="AI Research Assistant"
        description="Get a structured business research report on any topic."
      />
      <AiDisclaimer />
      <Card className="grid gap-4 p-6 md:grid-cols-[1fr_220px_auto]">
        <div className="grid gap-2">
          <Label htmlFor="topic">Research topic</Label>
          <Input
            id="topic"
            placeholder="e.g. AI adoption in mid-market SaaS"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Report depth</Label>
          <Select value={depth} onValueChange={(v) => setDepth(v as Depth)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Quick Overview", "Detailed Analysis", "Expert Report"] as Depth[]).map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={generate} disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Researching…" : "Generate report"}
          </Button>
        </div>
      </Card>

      {report && (
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{topic}</h3>
            <OutputToolbar
              text={exportText}
              filename="research-report.txt"
              onRegenerate={generate}
              isRegenerating={loading}
            />
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Overview
            </h4>
            <p className="leading-relaxed">{report.overview}</p>
          </div>

          <Cards title="Key Findings" icon={Lightbulb} items={report.keyFindings} accent="primary" />
          <Cards title="Industry Trends" icon={TrendingUp} items={report.industryTrends} accent="success" />
          <Cards title="Opportunities" icon={Lightbulb} items={report.opportunities} accent="chart-5" />
          <Cards title="Risks" icon={ShieldAlert} items={report.risks} accent="destructive" />

          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> References
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {report.references.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}

function Cards({
  title,
  items,
  icon: Icon,
  accent,
}: {
  title: string;
  items: string[];
  icon: typeof Lightbulb;
  accent: "primary" | "success" | "chart-5" | "destructive";
}) {
  const colors: Record<string, string> = {
    primary: "border-primary/30 bg-primary/5",
    success: "border-success/30 bg-success/5",
    "chart-5": "border-chart-5/30 bg-chart-5/5",
    destructive: "border-destructive/30 bg-destructive/5",
  };
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((it, i) => (
          <div key={i} className={`rounded-lg border p-3 text-sm ${colors[accent]}`}>
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatReport(topic: string, r: Report) {
  return [
    `RESEARCH REPORT: ${topic}`,
    `\nOVERVIEW\n${r.overview}`,
    `\nKEY FINDINGS\n- ${r.keyFindings.join("\n- ")}`,
    `\nINDUSTRY TRENDS\n- ${r.industryTrends.join("\n- ")}`,
    `\nOPPORTUNITIES\n- ${r.opportunities.join("\n- ")}`,
    `\nRISKS\n- ${r.risks.join("\n- ")}`,
    `\nREFERENCES\n- ${r.references.join("\n- ")}`,
  ].join("\n");
}