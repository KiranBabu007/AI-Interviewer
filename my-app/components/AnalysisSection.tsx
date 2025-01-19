import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Video, BadgeCheck, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisData {
  feedbacktype: string;
  feedback: string;
  rating: number;
}

interface ParsedAudioFeedback {
  contentAnalysis: string;
  communicationStyle: string;
  communication: number;
  knowledge: number;
  professionalDemeanor: string;
  profDemeanor: number;
  areasForImprovement: string;
  rating: number;
  overallFeedback: string;
}

interface ParsedBehaviorFeedback {
  postureAnalysis: string;
  posture: number;
  facialExpressions: string;
  fexpressions: number;
  bodyLanguage: string;
  profDemeanor: number;
  recommendations: string;
  confidenceScore: number;
  overallImpression: string;
}

const AnalysisSection = ({ interviewId }: { interviewId: string | string[] }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'audio' | 'behavior'>('audio');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analysis/${interviewId}`);
        if (!response.ok) throw new Error('Failed to fetch analysis data');
        const data = await response.json();
        setAnalysisData(data.analysisData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [interviewId]);

  const audioAnalysis = analysisData.find(item => item.feedbacktype === 'audio');
  const behaviorAnalysis = analysisData.find(item => item.feedbacktype === 'behavior');

  const parseAudioFeedback = (feedback: string): ParsedAudioFeedback => {
    try {
      return JSON.parse(feedback);
    } catch (e) {
      console.error('Error parsing audio feedback:', e);
      return {} as ParsedAudioFeedback;
    }
  };

  const parseBehaviorFeedback = (feedback: string): ParsedBehaviorFeedback => {
    try {
      return JSON.parse(feedback);
    } catch (e) {
      console.error('Error parsing behavior feedback:', e);
      return {} as ParsedBehaviorFeedback;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full bg-gray-800" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/10 border-red-900/20">
        <CardContent className="p-6">
          <div className="text-red-500 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-white">Detailed Analysis</h2>
      
      <div className="flex gap-4 mb-4">
        <Button
          variant={activeTab === 'audio' ? 'default' : 'outline'}
          onClick={() => setActiveTab('audio')}
          className="flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          Audio Analysis
        </Button>
        <Button
          variant={activeTab === 'behavior' ? 'default' : 'outline'}
          onClick={() => setActiveTab('behavior')}
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4" />
          Behavioral Analysis
        </Button>
      </div>

      <div className="mt-4">
        {activeTab === 'audio' ? (
          audioAnalysis ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-green-500" />
                  Voice & Communication Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const feedback = parseAudioFeedback(audioAnalysis.feedback);
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScoreCard
                          title="Communication Score"
                          score={feedback.communication}
                          details={feedback.communicationStyle}
                        />
                        <ScoreCard
                          title="Knowledge Score"
                          score={feedback.knowledge}
                          details={feedback.contentAnalysis}
                        />
                        <ScoreCard
                          title="Professional Demeanor"
                          score={feedback.profDemeanor}
                          details={feedback.professionalDemeanor}
                        />
                      </div>
                      <FeedbackSection
                        title="Areas for Improvement"
                        content={feedback.areasForImprovement}
                      />
                      <FeedbackSection
                        title="Overall Feedback"
                        content={feedback.overallFeedback}
                      />
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <EmptyState type="audio" />
          )
        ) : (
          behaviorAnalysis ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-green-500" />
                  Body Language & Behavioral Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const feedback = parseBehaviorFeedback(behaviorAnalysis.feedback);
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ScoreCard
                          title="Posture Score"
                          score={feedback.posture}
                          details={feedback.postureAnalysis}
                        />
                        <ScoreCard
                          title="Facial Expressions"
                          score={feedback.fexpressions}
                          details={feedback.facialExpressions}
                        />
                        <ScoreCard
                          title="Professional Demeanor"
                          score={feedback.profDemeanor}
                          details={feedback.bodyLanguage}
                        />
                      </div>
                      <FeedbackSection
                        title="Recommendations"
                        content={feedback.recommendations}
                      />
                      <FeedbackSection
                        title="Overall Impression"
                        content={feedback.overallImpression}
                      />
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <EmptyState type="behavior" />
          )
        )}
      </div>
    </motion.div>
  );
};

const ScoreCard = ({ title, score, details }: { title: string; score: number; details: string }) => (
  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium text-gray-200">{title}</h3>
      <span className="text-lg font-semibold text-green-500">{score}/10</span>
    </div>
    <p className="text-sm text-gray-400">{details}</p>
  </div>
);

const FeedbackSection = ({ title, content }: { title: string; content: string }) => (
  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
    <h3 className="font-medium text-gray-200 mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{content}</p>
  </div>
);

const EmptyState = ({ type }: { type: 'audio' | 'behavior' }) => (
  <Card className="bg-gray-900/50 border-gray-800">
    <CardContent className="p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        {type === 'audio' ? (
          <Mic className="h-8 w-8 text-gray-500" />
        ) : (
          <Video className="h-8 w-8 text-gray-500" />
        )}
        <p className="text-lg text-gray-400">
          No {type === 'audio' ? 'audio' : 'behavioral'} analysis available yet.
        </p>
      </div>
    </CardContent>
  </Card>
);

export default AnalysisSection;