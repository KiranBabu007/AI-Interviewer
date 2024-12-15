import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/GeminiAiModel';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import moment from 'moment';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    // Authenticate the request
    console.log("Hello")
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      console.log("No user");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const req = await request.json();
    const { 
      mockInterviewQuestion, 
      activeQuestionIndex, 
      interviewData, 
      userAnswer 
    }: {
      mockInterviewQuestion: { question: string; answer: string }[];
      activeQuestionIndex: number;
      interviewData: { mockId: string };
      userAnswer: string;
    } = req;

    // Construct feedback prompt
    const feedbackPrompt =
      `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, ` +
      `User Answer: ${userAnswer}, ` +
      `Depends on question and user answer for given interview question, ` +
      `please give use rating for answer and feedback as area of improvement if any ` +
      `in just 3 to 5 lines in JSON format with rating field and feedback field`;

    // Get AI feedback
    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp = (await result.response.text())
      .replace('```json', '')
      .replace('```', '');
    
    // Parse AI response
    const JsonFeedbackResp = JSON.parse(mockJsonResp);

    // Insert answer to database
    await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: JsonFeedbackResp?.feedback,
      rating: JsonFeedbackResp?.rating,
      userEmail: user?.emailAddresses?.[0]?.emailAddress, // Get email from request
      createdAt: moment().format("DD-MM-YYYY"),
    });

    // Return success response
    return NextResponse.json({ 
      message: "User Answer Recorded Successfully",
      feedback: JsonFeedbackResp
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing interview answer:', error);
    return NextResponse.json({ 
      error: 'Failed to process interview answer',
      details: 'Internal server error'
    }, { status: 500 });
  }
}