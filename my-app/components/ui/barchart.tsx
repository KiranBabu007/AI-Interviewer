"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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
    label: "Score",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function Barchart({ averageScore = 0 }) {
  const [scores, setScores] = useState({
    audio: 0,
    behavior: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchAnalysisData() {
      try {
        const response = await fetch('/api/profile-analysis');
        const data = await response.json();
        
        if (response.ok && data.averageScores) {
          setScores({
            audio: data.averageScores.audio || 0,
            behavior: data.averageScores.behavior || 0
          });
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAnalysisData();
  }, []);

  const chartData = [
    { month: "Knowledge", desktop: averageScore },
    { month: "Audio", desktop: scores.audio },
    { month: "Behavior", desktop: scores.behavior },
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
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            Loading analysis data...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="bg-black p-4 rounded-xl"
          >
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.2)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: "white" }}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="desktop" fill="white" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}