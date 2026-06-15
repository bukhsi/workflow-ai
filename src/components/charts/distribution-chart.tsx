import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";
import { TOOL_LABELS, type ToolKey } from "@/lib/usage";

const colors: Record<ToolKey, string> = {
  email: "var(--color-chart-1)",
  meeting: "var(--color-chart-2)",
  task: "var(--color-chart-3)",
  research: "var(--color-chart-4)",
  chat: "var(--color-chart-5)",
};

const config = {
  count: { label: "Activities" },
} satisfies ChartConfig;

export function DistributionChart({ data }: { data: { tool: ToolKey; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No activity yet — run any AI tool to see distribution.
      </div>
    );
  }
  const chartData = data.map((d) => ({
    name: TOOL_LABELS[d.tool],
    count: d.count,
    fill: colors[d.tool],
  }));
  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie data={chartData} dataKey="count" nameKey="name" innerRadius={50} strokeWidth={2}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}