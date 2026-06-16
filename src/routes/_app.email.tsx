import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateEmail } from "@/lib/ai.functions";
import { recordEvent } from "@/lib/usage";

export const Route = createFileRoute("/_app/email")({
  head: () => ({
    meta: [
      { title: "Intelligent Email Generator — Bukhulu's AI" },
      { name: "description", content: "Draft professional emails in seconds with AI." },
    ],
  }),
  component: EmailPage,
});

type Tone = "Professional" | "Friendly" | "Formal" | "Persuasive";

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!recipient.trim() || !purpose.trim()) {
      toast.error("Please fill in recipient and purpose");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { recipient, purpose, tone, context } });
      setOutput(res.text);
      recordEvent("email");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Intelligent Email Generator"
        description="Describe what you need to say — get a polished, ready-to-send email."
      />
      <AiDisclaimer />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g. Alex Chen, Marketing Director"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Follow up on Q3 roadmap proposal and request feedback by Friday."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Professional", "Friendly", "Formal", "Persuasive"] as Tone[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ctx">Additional context (optional)</Label>
            <Textarea
              id="ctx"
              placeholder="Background, past conversations, links…"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Drafting…" : "Generate email"}
          </Button>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Draft</h3>
            {output && (
              <OutputToolbar
                text={output}
                filename="email.txt"
                onRegenerate={generate}
                isRegenerating={loading}
              />
            )}
          </div>
          {output ? (
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="min-h-[420px] resize-y font-mono text-sm"
            />
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground">
              <Sparkles className="h-6 w-6 text-muted-foreground/60" />
              Your generated email will appear here.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}