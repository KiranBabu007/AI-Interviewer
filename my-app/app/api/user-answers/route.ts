import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/GeminiAiModel';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import moment from 'moment';
import { auth, currentUser } from '@clerk/nextjs/server';
import { app } from '@/utils/sharedMemory';
// Removed unused StructuredTool import

// Define interfaces for the JSON structures
interface FeedbackResponse {
  rating: number;
  feedback: string;
  tags: Record<string, number>;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

// Enhanced JSON parsing function
const extractAndParseJSON = (response: string): QuestionAnswer => {
  try {
    // Step 1: Remove code blocks and markdown formatting
    let cleaned = response.replace(/```(?:json)?|```/g, "");
    
    // Step 2: Find the first { and last } to extract just the JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in response");
    }
    
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    
    // Step 3: Fix common JSON issues
    // Replace single quotes with double quotes
    cleaned = cleaned.replace(/(\w+)\'(\w+)/g, '$1\\\'$2'); // Preserve apostrophes in words
    cleaned = cleaned.replace(/\'([^']*)\'/g, '"$1"');      // Replace quotes around strings
    
    // Fix trailing commas
    cleaned = cleaned.replace(/,\s*}/g, '}');
    cleaned = cleaned.replace(/,\s*\]/g, ']');
    
    // Step 4: Attempt to parse
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.log("Raw response:", response);
    
    // Step 5: Fallback extraction using regex
    try {
      const questionMatch = response.match(/"question":\s*"([^"]+)"/);
      const answerMatch = response.match(/"answer":\s*"([^"]+)"/);
      
      if (questionMatch && answerMatch) {
        return {
          question: questionMatch[1],
          answer: answerMatch[1]
        };
      }
      
      throw new Error("Regex extraction failed");
    } catch (regexError) {
      console.error("Regex extraction error:", regexError);
      throw new Error("Failed to parse LLM response");
    }
  }
};

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
      userAnswer,
      threadId
    } = req;

    const conversationThreadId = threadId;

    // 1. Generate feedback
    const feedbackPrompt = `
Evaluate the quality of the following interview response:
Question: "${mockInterviewQuestion[activeQuestionIndex]?.question}" 
Answer: "${userAnswer}"

Return only JSON: {"rating": 1-10, "feedback": "brief feedback", "tags": {"skill1": score, ...}}
    `;
  
    const feedbackResult = await chatSession.sendMessage(feedbackPrompt);
    const feedbackLLMText = (await feedbackResult.response.text())
      .replace(/```json\n?|\n?```/g, '');
    const JsonFeedbackResp = JSON.parse(feedbackLLMText) as FeedbackResponse;
    
    // 2. Store user's answer in memory thread with context about the question
    

    // 3. Generate next question with rich context
    const jobContext = {
      position: interviewData.jobPosition,
      type: interviewData.jobType,
      experience: interviewData.jobExperience
    };

    // Combined approach - record answer and generate next question in one call
    const combinedPrompt = `
The candidate has answered the previous question:
"${mockInterviewQuestion[activeQuestionIndex]?.question}"

Their answer was:
"${userAnswer}"

You are conducting a ${jobContext.type} interview for a ${jobContext.position} position at ${jobContext.experience} experience level.

Based on this answer and our previous conversation:
1. Identify areas that need deeper exploration
2. Progress logically through the interview (don't repeat similar questions)
3. Adjust difficulty based on answer quality
4. Ensure questions are relevant to the ${jobContext.position} role

Generate the next logical interview question. Note:Don't ask coding questions.

Return only valid JSON in this format: {"question": "your follow-up question", "answer": "expected detailed answer"}
`;

    const result = await app.invoke({
      messages: [
        { role: "system", content: "You are an expert interviewer evaluating a job candidate." },
        { role: "user", content: combinedPrompt }
      ],
    }, { configurable: { thread_id: conversationThreadId } });
    
    // Extract and parse the response
    const lastMessage = result.messages[result.messages.length - 1];
    const nextLLMResponse = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : Array.isArray(lastMessage.content) 
        ? lastMessage.content.join('') 
        : String(lastMessage.content);
    
    const parsedResponse = extractAndParseJSON(nextLLMResponse);
    const nextQuestion = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
    
    // 4. Save user answer to database
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

    // 5. Update interview tags and questions
    const currentMock = await db.select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, interviewData.mockId))
      .limit(1);

    if (currentMock.length === 0) {
      throw new Error('Mock interview not found');
    }

    // Handle tags
    let existingTags: Record<string, number> = {};
    if (currentMock[0].tags) {
      try {
        existingTags = JSON.parse(currentMock[0].tags);
      } catch (error) {
        console.error('Error parsing tags:', error);
      }
    }

    const newTags = JsonFeedbackResp.tags || {};
    for (const skill in newTags) {
      if (existingTags[skill]) {
        existingTags[skill] = Math.round((existingTags[skill] + newTags[skill]) / 2);
      } else {
        existingTags[skill] = newTags[skill];
      }
    }

    // Append new question to existing ones
    const currentQuestions = JSON.parse(currentMock[0].jsonMockResp);
    currentQuestions.push(nextQuestion);
    
    // Update database in a single operation
    await db.update(MockInterview)
      .set({
        tags: JSON.stringify(existingTags),
        jsonMockResp: JSON.stringify(currentQuestions)
      })
      .where(eq(MockInterview.mockId, interviewData.mockId));

    // 6. Return simplified response
    return NextResponse.json({ 
      success: true,
      message: "Answer processed and next question saved",
      feedback: JsonFeedbackResp,
      // No need to return nextQuestion since the frontend will get it from get-question API
    });
    
  } catch (error) {
    console.error('Error processing interview answer:', error);
    return NextResponse.json({ 
      error: 'Failed to process interview answer',
      details: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}