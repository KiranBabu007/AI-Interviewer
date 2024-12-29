"use client"
import QuestionsSection from "@/components/QuestionsSection";
import RecordAnswerSection from "@/components/RecordAnswerSection";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams} from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import React from "react";


interface InterviewData {
  mockId?: string;
  
}

interface MockInterviewQuestion {
  question: string;
  
}

const Page = () => {
  const [interviewDetails, setInterviewDetails] = useState<InterviewData | null>(null);
  const [questions, setQuestions] = useState<MockInterviewQuestion[] | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const interviewId = useParams().interviewid;
  
  const GetInterviewDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview details');
      }

      const data = await response.json();
      setInterviewDetails(data.interviewData);
      setQuestions(data.mockInterviewQuestions);
    } catch (error: unknown) {
      console.error('Error fetching interview details:', error);
    }
  }, [interviewId,activeQuestionIndex]);

  useEffect(() => {
    GetInterviewDetails();
  }, [GetInterviewDetails]);

  return (
    <div className="relative h-screen w-full bg-neutral-950 flex flex-col overflow-hidden">
      {/* Background Beams - Ensure it is at z-0 */}
      <BackgroundBeams className="absolute inset-0 z-0" />
      
      {/* Main Content - Higher z-index */}
      <div className="relative flex-grow overflow-auto py-8 z-10">
        <div className="container mx-auto px-4 h-full">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 h-full'>
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl h-full">
              <QuestionsSection
                mockInterviewQuestion={questions || []} 
                activeQuestionIndex={activeQuestionIndex}
              />
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 shadow-xl p-8 flex flex-col space-y-6">
              <RecordAnswerSection
                mockInterviewQuestion={questions || []} 
                activeQuestionIndex={activeQuestionIndex} 
                interviewData={interviewDetails}
              />
              <div className='mt-auto flex justify-end gap-6'>
                {/* {activeQuestionIndex > 0 && (
                  <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
                    Previous Question
                  </Button>
                )} */}
                {questions && activeQuestionIndex !== 1 && (
                  <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
                    Next Question
                  </Button>
                )}
                {questions && activeQuestionIndex === 1 && (
                  <Link href={`/dashboard/interview/${interviewDetails?.mockId}/feedback`}>
                    <Button>End Interview</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;