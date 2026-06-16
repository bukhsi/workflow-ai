import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const config = {
  minutes: { label: "Minutes saved", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function TrendChart({ data }: { data: { date: string; minutes: number }[] }) {
  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
          minTickGap={16}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="minutes"
          type="monotone"
          fill="url(#fillMinutes)"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}