
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Jan", attempts: 1200, success: 1150 },
  { month: "Feb", attempts: 2100, success: 2050 },
  { month: "Mar", attempts: 1800, success: 1780 },
  { month: "Apr", attempts: 2400, success: 2380 },
  { month: "May", attempts: 3200, success: 3150 },
  { month: "Jun", attempts: 2800, success: 2790 },
]

const chartConfig = {
  attempts: {
    label: "Attempts",
    color: "hsl(var(--chart-2))",
  },
  success: {
    label: "Successful",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function InsightsChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="attempts" fill="var(--color-attempts)" radius={4} />
        <Bar dataKey="success" fill="var(--color-success)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
