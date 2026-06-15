import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Loader2, Send, Sparkles } from "lucide-react";
import { recordEvent } from "@/lib/usage";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Workspace AI" },
      { name: "description", content: "Conversational AI for everyday workplace tasks." },
    ],
  }),
  component: ChatPage,
});

const SUGGESTED = [
  "Draft a project update email to my team",
  "Summarize these meeting notes",
  "Create a project roadmap for Q3",
  "Research AI workplace productivity trends",
  "Prepare a meeting agenda for product review",
];

function ChatPage() {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTrackedRef = useRef<string | null>(null);

  const loading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant" && lastTrackedRef.current !== last.id) {
        lastTrackedRef.current = last.id;
        recordEvent("chat");
      }
    }
  }, [status, messages]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <PageHeader
        title="AI Workplace Assistant"
        description="Ask anything — drafts, summaries, plans, research. Conversation stays in this session."
      />
      <AiDisclaimer />
      <Card className="flex h-[calc(100vh-260px)] min-h-[480px] flex-col p-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold">How can I help today?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try a suggested prompt:</p>
              </div>
              <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTED.map((p) => (
                  <button
                    key={p}
                    onClick={() => submit(p)}
                    className="rounded-xl border bg-card p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent/30"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <Message key={m.id} role={m.role}>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? <span key={i}>{p.text}</span> : null,
                  )}
                </Message>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              )}
            </div>
          )}
        </div>
        <div className="border-t bg-background/50 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder="Message the assistant…"
              rows={1}
              className="max-h-40 min-h-[44px] flex-1 resize-none"
            />
            <Button type="submit" disabled={loading || !input.trim()} className="h-11">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

function Message({ role, children }: { role: string; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-foreground"
        }`}
      >
        {children}
      </div>
    </div>
  );
}