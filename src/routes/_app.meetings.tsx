import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { OutputToolbar } from "@/components/output-toolbar";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { summarizeMeeting } from "@/lib/ai.functions";
import { recordEvent } from "@/lib/usage";

export const Route = createFileRoute("/_app/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Bukhulu's AI" },
      { name: "description", content: "Turn meeting transcripts into action items and decisions." },
    ],
  }),
  component: MeetingsPage,
});

type Summary = {
  executiveSummary: string;
  keyDecisions: string[];
  actionItems: { task: string; owner: string; dueDate: string }[];
  risks: string[];
  nextSteps: string[];
};

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [transcript, setTranscript] = useState("");
  const [meetingType, setMeetingType] = useState("Team standup");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (transcript.trim().length < 20) {
      toast.error("Paste a longer transcript (at least 20 characters)");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { transcript, meetingType } });
      setSummary(res as Summary);
      recordEvent("meeting");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  const exportText = summary ? formatSummary(summary) : "";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Meeting Notes Summarizer"
        description="Paste a transcript and get an executive summary, decisions, action items, and risks."
      />
      <AiDisclaimer />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <div className="grid gap-2">
            <Label htmlFor="mtype">Meeting type</Label>
            <Input id="mtype" value={meetingType} onChange={(e) => setMeetingType(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transcript">Transcript</Label>
            <Textarea
              id="transcript"
              placeholder="Paste the full meeting transcript here…"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={18}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {loading ? "Summarizing…" : "Summarize meeting"}
          </Button>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Summary</h3>
            {summary && (
              <OutputToolbar
                text={exportText}
                filename="meeting-summary.txt"
                onRegenerate={generate}
                isRegenerating={loading}
              />
            )}
          </div>
          {!summary ? (
            <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              Your structured summary will appear here.
            </div>
          ) : (
            <div className="flex flex-col gap-5 text-sm">
              <Section title="Executive Summary">
                <p className="leading-relaxed text-foreground/90">{summary.executiveSummary}</p>
              </Section>
              <Section title="Key Decisions">
                <ul className="space-y-1.5 list-disc pl-5">
                  {summary.keyDecisions.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </Section>
              <Section title="Action Items">
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Task</th>
                        <th className="px-3 py-2">Owner</th>
                        <th className="px-3 py-2">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.actionItems.map((a, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{a.task}</td>
                          <td className="px-3 py-2"><Badge variant="secondary">{a.owner}</Badge></td>
                          <td className="px-3 py-2 text-muted-foreground">{a.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
              <Section title="Risks & Concerns">
                <ul className="space-y-1.5 list-disc pl-5">
                  {summary.risks.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </Section>
              <Section title="Next Steps">
                <ol className="space-y-1.5 list-decimal pl-5">
                  {summary.nextSteps.map((d, i) => <li key={i}>{d}</li>)}
                </ol>
              </Section>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

function formatSummary(s: Summary) {
  return [
    `EXECUTIVE SUMMARY\n${s.executiveSummary}`,
    `KEY DECISIONS\n- ${s.keyDecisions.join("\n- ")}`,
    `ACTION ITEMS\n${s.actionItems.map((a) => `- ${a.task} (Owner: ${a.owner}, Due: ${a.dueDate})`).join("\n")}`,
    `RISKS\n- ${s.risks.join("\n- ")}`,
    `NEXT STEPS\n${s.nextSteps.map((n, i) => `${i + 1}. ${n}`).join("\n")}`,
  ].join("\n\n");
}