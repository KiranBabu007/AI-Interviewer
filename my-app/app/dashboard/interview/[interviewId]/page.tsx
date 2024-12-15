"use client"

import QuestionsSection from '@/components/QuestionsSection';
import RecordAnswerSection from '@/components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

const page = () => {

  const [interviewDetails, setInterviewDetails]= React.useState<any>(null);
  const [questions, setQuestions]= React.useState<any>(null);
  const [activeQuestionIndex, setActiveQuestionIndex]= React.useState<number>(0);

  useEffect(() => {
    GetInterviewDetails();
  },[]);
  const interviewId = useParams().interviewid;
  
  const GetInterviewDetails = async () => {
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
      console.log('Data:', data);
      setInterviewDetails(data.interviewData);
      setQuestions(data.mockInterviewQuestions);
    } catch (error: any) {
      console.error('Error fetching interview details:', error);
      
    } finally {
      console.log('Interview Details:', interviewDetails);
      console.log('Questions:', questions);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />
          
          {/* Content with backdrop blur */}
          <div className="relative z-10">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12'>
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl">
                <QuestionsSection
                  mockInterviewQuestion={questions} 
                  activeQuestionIndex={activeQuestionIndex}
                />
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl">
                <RecordAnswerSection
                  mockInterviewQuestion={questions} 
                  activeQuestionIndex={activeQuestionIndex} 
                  interviewData={interviewDetails}
                />
                <div className='flex justify-end gap-6'>
                {activeQuestionIndex > 0 && (
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
                        Previous Question
                    </Button>
                )}
                {activeQuestionIndex !== questions?.length - 1 && (
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
                        Next Question
                    </Button>
                )}
                {activeQuestionIndex === questions?.length - 1 && (
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
    </div>
  )
}

export default page
