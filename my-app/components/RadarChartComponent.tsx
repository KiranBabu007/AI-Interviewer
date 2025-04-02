"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataPoint {
  category: string;
  score: number;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RadarChartComponent() {
  const { interviewid } = useParams();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/other-feedback/${interviewid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }
        
        const data = await response.json();
        
        if (data.analysisData && data.analysisData.length > 0) {
          // Initialize aggregate scores
          const aggregateScores = {
            posture: 0,
            communication: 0,
            knowledge: 0,
            fexpressions: 0,
            confidence: 0,
            profDemeanor: 0,
          };
          
          // Count for averaging
          const counts = {
            posture: 0,
            communication: 0,
            knowledge: 0,
            fexpressions: 0,
            confidence: 0,
            profDemeanor: 0,
          };

          // Process each analysis entry
          data.analysisData.forEach(analysis => {
            const feedback = typeof analysis.feedback === 'string' 
              ? JSON.parse(analysis.feedback) 
              : analysis.feedback;

            if (analysis.feedbacktype === 'behavior') {
              if (feedback.posture) {
                aggregateScores.posture += feedback.posture;
                counts.posture++;
              }
              if (feedback.fexpressions) {
                aggregateScores.fexpressions += feedback.fexpressions;
                counts.fexpressions++;
              }
              if (feedback.profDemeanor) {
                aggregateScores.profDemeanor += feedback.profDemeanor;
                counts.profDemeanor++;
              }
              if (feedback.confidenceScore) {
                aggregateScores.confidence += feedback.confidenceScore;
                counts.confidence++;
              }
            } else if (analysis.feedbacktype === 'audio') {
              if (feedback.communication) {
                aggregateScores.communication += feedback.communication;
                counts.communication++;
              }
              if (feedback.knowledge) {
                aggregateScores.knowledge += feedback.knowledge;
                counts.knowledge++;
              }
              if (feedback.profDemeanor) {
                aggregateScores.profDemeanor += feedback.profDemeanor;
                counts.profDemeanor++;
              }
            }
          });

          // Calculate averages and scale to match the chart scale (0-400)
          const scaledData: ChartDataPoint[] = [
            { 
              category: "Posture", 
              score: counts.posture > 0 ? (aggregateScores.posture / counts.posture) * 10 : 0 
            },
            { 
              category: "Communication", 
              score: counts.communication > 0 ? (aggregateScores.communication / counts.communication) * 10 : 0 
            },
            { 
              category: "Knowledge", 
              score: counts.knowledge > 0 ? (aggregateScores.knowledge / counts.knowledge) * 10 : 0 
            },
            { 
              category: "Facial Expression", 
              score: counts.fexpressions > 0 ? (aggregateScores.fexpressions / counts.fexpressions) * 10 : 0 
            },
            { 
              category: "Confidence", 
              score: counts.confidence > 0 ? (aggregateScores.confidence / counts.confidence) * 10 : 0 
            },
            { 
              category: "Professional Demeanor", 
              score: counts.profDemeanor > 0 ? (aggregateScores.profDemeanor / counts.profDemeanor) * 10 : 0 
            },
          ];

          setChartData(scaledData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis data');
      } finally {
        setLoading(false);
      }
    };

    if (interviewid) {
      fetchAnalysisData();
    }
  }, [interviewid]);

  if (error) {
    return (
      <Card>
        <CardHeader className="items-center">
          <CardTitle>Error Loading Analysis</CardTitle>
          <CardDescription className="text-red-500">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Overall Analysis</CardTitle>
        <CardDescription>
          Showing scores for key behavioral metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
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
              <PolarRadiusAxis domain={[0, 100]} tickCount={6} axisLine={false} tick={false}/>
              <Radar
                dataKey="score"
                fill="#22C55E"
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Consider these factors for improvement <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Key Behavioral Metrics
        </div>
      </CardFooter>
    </Card>
  );
}
