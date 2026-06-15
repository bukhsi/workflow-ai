import { AlertTriangle } from "lucide-react";

export function AiDisclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground/80">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
      <p>
        AI-generated content may contain inaccuracies. Always review and verify outputs before
        using them for business, legal, financial, or strategic decisions.
      </p>
    </div>
  );
}