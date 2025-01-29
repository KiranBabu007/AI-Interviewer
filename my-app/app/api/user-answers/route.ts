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

    const feedbackPrompt = `
Evaluate the quality of the following interview response based on relevance, accuracy, depth, and clarity. 

- Rate the response on a scale of 1-10 (1 = poor, 10 = excellent).
- Provide a brief, constructive feedback sentence.
- Identify key skills assessed in the response and assign each a score from 0-100.

Return only JSON in the following format:
{
  "rating": number,
  "feedback": "string",
  "tags": { "skill1": score, "skill2": score ... }
}

Question: "${mockInterviewQuestion[activeQuestionIndex]?.question}" 
Answer: "${userAnswer}"
`;

    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp = (await result.response.text())
      .replace('```json','')
      .replace('```','');
    
    const JsonFeedbackResp = JSON.parse(mockJsonResp);
    console.log(JsonFeedbackResp)

    // Get the next question
    const nextQuestionPrompt = `
      You are conducting a ${interviewData.jobType.toLowerCase()} interview for a ${interviewData.jobExperience} ${interviewData.jobPosition} position. 
      Previous Q&A:\n
      Q: "${mockInterviewQuestion[activeQuestionIndex]?.question}"\n
      A: "${userAnswer}"\n
      Generate one follow-up interview question and model answer.
      Return only JSON: {"question": "string", "answer": "string"}
    `;
    
    const nextQuestionResult = await chatSession.sendMessage(nextQuestionPrompt);
    const nextQuestionJson = (await nextQuestionResult.response.text())
      .replace('```json','')
      .replace('```','');
    
    const nextQuestion = JSON.parse(nextQuestionJson);

    // Insert user answer data
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

    // Fetch existing mock interview data
    const currentMock = await db.select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, interviewData.mockId));

    if (currentMock.length === 0) {
      throw new Error('Mock interview not found');
    }

    // Parse existing tags from MockInterview table
    let existingTags = {};
    if (currentMock[0].tags) {
      try {
        existingTags = JSON.parse(currentMock[0].tags);
      } catch (error) {
        console.error('Error parsing tags:', error);
        existingTags = {}; // Reset if parsing fails
      }
    }

    // Merge new skills with existing tags and calculate average rating
    const newTags = JsonFeedbackResp.tags || {};
    for (const skill in newTags) {
      if (existingTags[skill]) {
        // Update the average rating for the skill
        existingTags[skill] = Math.round((existingTags[skill] + newTags[skill]) / 2);
      } else {
        // Add new skill to tags
        existingTags[skill] = newTags[skill];
      }
    }

    // Update the MockInterview table with new or updated tags
    await db.update(MockInterview)
      .set({
        tags: JSON.stringify(existingTags)
      })
      .where(eq(MockInterview.mockId, interviewData.mockId));

    // Append the next question to the MockInterview record
    const currentQuestions = JSON.parse(currentMock[0].jsonMockResp);
    currentQuestions.push(nextQuestion);

    await db.update(MockInterview)
      .set({
        jsonMockResp: JSON.stringify(currentQuestions)
      })
      .where(eq(MockInterview.mockId, interviewData.mockId));

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
