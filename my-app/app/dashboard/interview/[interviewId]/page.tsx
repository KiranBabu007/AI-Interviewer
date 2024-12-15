"use client"

import QuestionsSection from '@/components/QuestionsSection';
import RecordAnswerSection from '@/components/RecordAnswerSection';
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
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <QuestionsSection
                    mockInterviewQuestion={questions} 
                    activeQuestionIndex={activeQuestionIndex}
                />

                <RecordAnswerSection
                    mockInterviewQuestion={questions} 
                    activeQuestionIndex={activeQuestionIndex} 
                    interviewData={interviewDetails}
                />
      </div>

      <div className='flex justify-end gap-6'>
                {activeQuestionIndex > 0 && (
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
                        Previous Question
                    </Button>
                )}
                {activeQuestionIndex !== mockInterviewQuestion?.length - 1 && (
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
                        Next Question
                    </Button>
                )}
                {activeQuestionIndex === mockInterviewQuestion?.length - 1 && (
                    <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
                        <Button>End Interview</Button>
                    </Link>
                )}
            </div>
    </div>
  )
}

export default page
