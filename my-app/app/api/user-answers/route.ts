import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/GeminiAiModel';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import moment from 'moment';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const req = await request.json();
    const { 
      mockInterviewQuestion, 
      activeQuestionIndex, 
      interviewData, 
      userAnswer 
    } = req;

    // Simplified feedback prompt
    const feedbackPrompt =
      `Rate this interview answer from 1-10 and provide one sentence of feedback. ` +
      `Question: "${mockInterviewQuestion[activeQuestionIndex]?.question}" ` +
      `Answer: "${userAnswer}" ` +
      `Return only JSON: {"rating": number, "feedback": "string"}`;

    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp = (await result.response.text())
      .replace('```json','')
      .replace('```','');
    
    const JsonFeedbackResp = JSON.parse(mockJsonResp);

    // Modified next question prompt that considers job type
    const nextQuestionPrompt = 
      `You are conducting a ${interviewData.jobType.toLowerCase()} interview for a ${interviewData.jobExperience} ${interviewData.jobPosition} position. ` +
      `Previous Q&A:\n` +
      `Q: "${mockInterviewQuestion[activeQuestionIndex]?.question}"\n` +
      `A: "${userAnswer}"\n` +
      `Generate one follow back ${interviewData.jobType.toLowerCase()} interview question and brief model answer. ` +
      `For HR type, focus on behavioral and situational questions. ` +
      `For Technical type, focus on technical concepts and problem-solving. ` +
      `Return only JSON: {"question": "string", "answer": "string"}`;

    const nextQuestionResult = await chatSession.sendMessage(nextQuestionPrompt);
    const nextQuestionJson = (await nextQuestionResult.response.text())
      .replace('```json','')
      .replace('```','');
    
    const nextQuestion = JSON.parse(nextQuestionJson);

    // Insert current answer to UserAnswer table
    const insertData = {
      mockIdRef: interviewData.mockId,
      question: mockInterviewQuestion[activeQuestionIndex].question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer || null,
      userAns: userAnswer || null,
      feedback: JsonFeedbackResp?.feedback || null,
      rating: JsonFeedbackResp?.rating || null,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
      createdAt: moment().format("DD-MM-YYYY")
    };
    await db.insert(UserAnswer).values(insertData);

    // Get current mock interview data
    const currentMock = await db.select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, interviewData.mockId));

    if (currentMock.length === 0) {
      throw new Error('Mock interview not found');
    }

    // Parse current questions and add new question
    const currentQuestions = JSON.parse(currentMock[0].jsonMockResp);
    currentQuestions.push(nextQuestion);

    // Update MockInterview table with new question
    await db.update(MockInterview)
      .set({
        jsonMockResp: JSON.stringify(currentQuestions)
      })
      .where(eq(MockInterview.mockId, interviewData.mockId));

    // Return success response with feedback and next question
    return NextResponse.json({ 
      message: "User Answer Recorded Successfully",
      feedback: JsonFeedbackResp,
      nextQuestion: nextQuestion
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing interview answer:', error);
    return NextResponse.json({ 
      error: 'Failed to process interview answer',
      details: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}