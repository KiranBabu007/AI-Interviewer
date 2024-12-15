import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

const page = () => {
  useEffect(() => {
  },[]);
  const interviewId= useParams().interviewId
  const GetInterviewDetails= async () => {
    const result= await db.select().from(MockInterview).where(eq(MockInterview.mockId, interviewId));
  }
  return (
    <div>
      Interview
    </div>
  )
}

export default page
