"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from 'next/navigation';

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
    return <div className='p-10'>Loading feedback...</div>;
  }

  if (error) {
    return <div className='p-10'>Error: {error}</div>;
  }

  return (
    <div className='p-10 bg-black h-screen'>
      <h2 className='text-3xl font-bold text-green-600'>Congratulations!</h2>
      <h2 className='font-bold text-2xl text-white'>Here is your interview feedback</h2>
      
      {feedbackList.length === 0 ? (
        <h2 className='font-bold text-lg text-green-500'>No interview Feedback</h2>
      ) : (
        <>
          <h2 className='text-sm text-gray-500'>
            Find below interview questions with correct answers, your answer and feedback for improvements for your next interview
          </h2>
          
          {feedbackList.map((item, index) => (
            <Collapsible key={index} className='mt-7'>
              <CollapsibleTrigger className='p-2 flex justify-between bg-secondary rounded-lg my-2 text-left gap-7 w-full'>
                {item.question} <ChevronsUpDown className='h-4'/>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='flex flex-col gap-2'>
                  <h2 className='text-red-500 p-2 border rounded-lg'>
                    <strong>Rating:</strong> {item.rating}
                  </h2>
                  <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'>
                    <strong>Your Answer: </strong>{item.userAns}
                  </h2>
                  <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-900'>
                    <strong>Correct Answer Looks Like: </strong>{item.correctAns}
                  </h2>
                  <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary'>
                    <strong>Feedback: </strong>{item.feedback}
                  </h2>
                </div>
              </CollapsibleContent>
            </Collapsible>      
          ))}
        </>
      )}
      
      <Button className='mt-5' onClick={() => router.replace('/dashboard')}>
        Go Home
      </Button>
    </div>
  );
};

export default Feedback;