import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive" | "chart-5";
};

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  "chart-5": "bg-chart-5/15 text-chart-5",
};

export function KpiCard({ label, value, sublabel, icon: Icon, accent = "primary" }: Props) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accentMap[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
      </div>
    </Card>
  );
}