import { Copy, Download, RefreshCw, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  text: string;
  filename?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
};

export function OutputToolbar({ text, filename = "output.txt", onRegenerate, isRegenerating }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={copy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button size="sm" variant="outline" onClick={download}>
        <Download className="h-4 w-4" />
        Export
      </Button>
      {onRegenerate && (
        <Button size="sm" variant="outline" onClick={onRegenerate} disabled={isRegenerating}>
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      )}
    </div>
  );
}