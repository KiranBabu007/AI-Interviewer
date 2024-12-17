import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/GeminiAiModel';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import moment from 'moment';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    // Authenticate the request
    
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const req = await request.json();
    const { 
      mockInterviewQuestion, 
      activeQuestionIndex, 
      interviewData, 
      userAnswer 
    } = req;

    // Construct feedback prompt
    const feedbackPrompt =
      `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, ` +
      `User Answer: ${userAnswer}, ` +
      `Depends on question and user answer for given interview question, ` +
      `please give use rating for answer and feedback as area of improvement if any ` +
      'in just 3 to 5 lines in JSON format with rating field and feedback field';

    // Get AI feedback
    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp = (await result.response.text())
    .replace('```json','')
    .replace('```','');
    
    // Parse AI response
    const JsonFeedbackResp = JSON.parse(mockJsonResp);
    const insertData = {
      mockIdRef: interviewData.mockId,    // This field name was critical - matches schema exactly
      question: mockInterviewQuestion[activeQuestionIndex].question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer || null,
      userAns: userAnswer || null,
      feedback: JsonFeedbackResp?.feedback || null,
      rating: JsonFeedbackResp?.rating || null,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
      createdAt: moment().format("DD-MM-YYYY")
    };
    // Insert answer to database
    await db.insert(UserAnswer).values(insertData);

    // Return success response
    return NextResponse.json({ 
      message: "User Answer Recorded Successfully",
      feedback: JsonFeedbackResp
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing interview answer:', error);
    return NextResponse.json({ 
      error: 'Failed to process interview answer',
      details: 'Internal server error'
    }, { status: 500 });
  }
}