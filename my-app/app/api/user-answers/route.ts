import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/GeminiAiModel';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import moment from 'moment';
import { auth, currentUser } from '@clerk/nextjs/server';

// ------------------------
// LangChain Setup (only for Next Question)
// ------------------------
import { ChatGroq } from "@langchain/groq";
import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from "@langchain/langgraph";

// Initialize LangChain's ChatGroq instance
const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  temperature: 0,
});

// Helper function to sanitize and parse JSON responses
const sanitizeAndParseJSON = (response: string): any[] => {
  try {
    let cleaned = response.replace(/```json\n?|\n?```/g, "");
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    cleaned = cleaned.trim();
    if (!cleaned.startsWith("[")) cleaned = "[" + cleaned;
    if (!cleaned.endsWith("]")) cleaned = cleaned + "]";
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.log("Attempted to parse:", response);
    throw new Error("Failed to parse LLM response");
  }
};

// Function to invoke the LLM using LangChain
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.invoke(state.messages);
  return { messages: response };
};

// Create a state graph workflow for LangChain
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
// ------------------------
// End LangChain Setup
// ------------------------

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

    // ------------------------
    // Generate Feedback using chatSession (unchanged)
    // ------------------------
    const feedbackPrompt = `
Evaluate the quality of the following interview response based on relevance, accuracy, depth, and clarity. 

- Rate the response on a scale of 1-10 (1 = poor, 10 = excellent).
- Provide a brief, constructive feedback sentence.
- Identify key skills assessed in the response and assign each a score from 0-100.

Return only JSON in the following format:
{
  "rating": number,
  "feedback": "string",
  "tags": { "skill1": score, "skill2": score, ... }
}

Question: "${mockInterviewQuestion[activeQuestionIndex]?.question}" 
Answer: "${userAnswer}"
    `;
  
    const feedbackResult = await chatSession.sendMessage(feedbackPrompt);
    const feedbackLLMText = (await feedbackResult.response.text())
      .replace('```json', '')
      .replace('```', '');
    const JsonFeedbackResp = JSON.parse(feedbackLLMText);
    // ------------------------
    // End Feedback Generation
    // ------------------------

    // ------------------------
    // Generate Next Question using LangChain
    // ------------------------
    const nextQuestionPrompt = `
You are conducting a ${interviewData.jobType.toLowerCase()} interview for a ${interviewData.jobExperience} ${interviewData.jobPosition} position.
Previous Q&A:
Q: "${mockInterviewQuestion[activeQuestionIndex]?.question}"
A: "${userAnswer}"
Generate one follow-up interview question and model answer.
Return only JSON: {"question": "string", "answer": "string"}
    `;
    
    // Use interviewData.mockId as the thread_id for session continuity
    const nextQuestionResult = await app.invoke(
      { messages: [{ role: "user", content: nextQuestionPrompt }] },
      { configurable: { thread_id: interviewData.mockId } }
    );
    
    // --- Fix: Ensure we extract a string from the LangChain message content ---
    const lastMessage = nextQuestionResult.messages[nextQuestionResult.messages.length - 1];
    let nextLLMResponse: string;
    if (typeof lastMessage.content === 'string') {
      nextLLMResponse = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      nextLLMResponse = lastMessage.content.join('');
    } else {
      nextLLMResponse = String(lastMessage.content);
    }
    
    const parsedResponse = sanitizeAndParseJSON(nextLLMResponse);
    const nextQuestion = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
    // ------------------------
    // End Next Question Generation
    // ------------------------

    // ------------------------
    // Insert User Answer Data & Update Interview Record
    // ------------------------
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

    const currentMock = await db.select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, interviewData.mockId));

    if (currentMock.length === 0) {
      throw new Error('Mock interview not found');
    }

    let existingTags = {};
    if (currentMock[0].tags) {
      try {
        existingTags = JSON.parse(currentMock[0].tags);
      } catch (error) {
        console.error('Error parsing tags:', error);
        existingTags = {};
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

    await db.update(MockInterview)
      .set({
        tags: JSON.stringify(existingTags)
      })
      .where(eq(MockInterview.mockId, interviewData.mockId));

    const currentQuestions = JSON.parse(currentMock[0].jsonMockResp);
    currentQuestions.push(nextQuestion);
    
    await db.update(MockInterview)
      .set({
        jsonMockResp: JSON.stringify(currentQuestions)
      })
      .where(eq(MockInterview.mockId, interviewData.mockId));
    // ------------------------
    // End Database Updates
    // ------------------------

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