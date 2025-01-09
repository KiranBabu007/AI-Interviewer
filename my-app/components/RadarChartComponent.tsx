"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Updated chart data with new categories
const chartData = [
  { category: "Posture", score: 186 },
  { category: "Communication", score: 305 },
  { category: "Knowledge", score: 237 },
  { category: "Facial Expression", score: 273 },
  { category: "Confidence", score: 209 },
  { category: "Professional Demeanor", score: 214 },
];

// Updated chart configuration
const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))", // Use the CSS variable for color
  },
} satisfies ChartConfig;

export function RadarChartComponent() {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Behavioral Analysis</CardTitle>
        <CardDescription>
          Showing scores for key behavioral metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-video max-h-[350px]" 
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 12 }} 
            />
            <PolarGrid />
            <Radar
              dataKey="score" // Use "score" as the data key
              fill="#22C55E" // Use the CSS variable for fill color
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Consider these factors for improvement <TrendingUp className="h-4 w-4  text-green-500" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Key Behavioral Metrics
        </div>
      </CardFooter>
    </Card>
  );
}