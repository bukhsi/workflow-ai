import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const config = {
  activities: { label: "Activities", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export function WeeklyChart({ data }: { data: { date: string; activities: number }[] }) {
  const recent = data.slice(-7);
  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <BarChart data={recent} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return d.toLocaleDateString(undefined, { weekday: "short" });
          }}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="activities" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}