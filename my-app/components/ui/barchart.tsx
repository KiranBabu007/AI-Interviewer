"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function Barchart({ averageScore = 0 }) {
    const chartData = [
        { month: "Knowledge", desktop: averageScore },
        { month: "Audio", desktop: 4 },
        { month: "Behavior", desktop: 2.5 },
      ];
  return (
    <Card className="bg-black text-white">
      <CardHeader>
        <CardTitle className="text-white">Interview Overall Analysis</CardTitle>
        <CardDescription className="text-gray-400">
          Knowledge - Audio - Behavior 
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="bg-black p-4 rounded-xl"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.2)" />{" "}
            {/* Light white grid */}
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "white" }} // Make month labels white
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="white" radius={8} /> {/* White bars */}
          </BarChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
  );
}
