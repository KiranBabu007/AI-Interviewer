"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedbackItem {
  question: string;
  rating: string;
  userAns: string;
  correctAns: string;
  feedback: string;
}

const Feedback: React.FC = () => {
  const params = useParams();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const GetFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/interviews/${params.interviewid}/feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedbackList(data.feedbackList);
    } catch (error: unknown) {
      console.error('Error fetching feedback:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.interviewid]);

  useEffect(() => {
    GetFeedback();
  }, [GetFeedback]);

  if (loading) {
    return (
      <div className="p-8 space-y-4 bg-black h-screen">
        <Skeleton className="h-12 w-64 bg-gray-800" />
        <Skeleton className="h-8 w-96 bg-gray-800" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-900/10 border-red-900/20">
        <div className="text-red-500">Error: {error}</div>
        <Button variant="outline" className="mt-4" onClick={() => GetFeedback()}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r text-green-500 "
          >
            Congratulations! 🎉
          </motion.h1>
          <h2 className="text-2xl font-semibold text-white">Interview Feedback</h2>
          <p className="text-gray-400 text-sm">
            Review your performance and prepare for future success
          </p>
        </div>

        {feedbackList.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <p className="text-lg text-gray-400">No interview feedback available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            <motion.div className="space-y-4">
              {feedbackList.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Collapsible className="border border-gray-800 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between text-left">
                      <span className="text-gray-100">{item.question}</span>
                      <ChevronsUpDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 space-y-3 border-t border-gray-800">
                        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <strong className="text-green-500">Rating:</strong>
                          <span className="ml-2 text-gray-300">{item.rating}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <strong className="text-blue-500">Your Answer:</strong>
                          <p className="mt-1 text-gray-300">{item.userAns}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <strong className="text-purple-500">Ideal Answer:</strong>
                          <p className="mt-1 text-gray-300">{item.correctAns}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <strong className="text-yellow-500">Feedback:</strong>
                          <p className="mt-1 text-gray-300">{item.feedback}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={() => router.replace('/dashboard')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Feedback;