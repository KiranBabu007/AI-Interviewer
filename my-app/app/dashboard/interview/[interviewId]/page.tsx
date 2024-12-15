"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

const page = () => {

  const [interviewDetails, setInterviewDetails]= React.useState<any>(null);
  const [questions, setQuestions]= React.useState<any>(null);

  useEffect(() => {
    GetInterviewDetails();
  },[]);
  const interviewId = useParams().interviewId;
  const GetInterviewDetails = async () => {
    if (typeof interviewId === 'string') {
      const result = await db.select().from(MockInterview).where(eq(MockInterview.mockId, interviewId));
      console.log(result);
    } else {
      console.error('Invalid interviewId');
    }
  }
  return (
    <div>
      Interview
    </div>
  )
}

export default page
