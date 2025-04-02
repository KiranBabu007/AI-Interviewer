import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { auth, currentUser } from "@clerk/nextjs/server";
import { desc, eq, avg } from "drizzle-orm";
import { chatSession } from "@/utils/GeminiAiModel";
import { app } from "@/utils/sharedMemory";

// Define an interface for your question-answer structure
interface QuestionAnswer {
  question: string;
  answer: string;
}

interface TopicsByLevel {
  junior: string[];
  mid: string[];
  senior: string[];
}

interface TechnicalTopics {
  [key: string]: TopicsByLevel;
}

const technicalTopics: TechnicalTopics = {
  "full stack developer": {
    junior: ["RESTful APIs", "Basic Frontend Frameworks", "Database Fundamentals", "Version Control", "Web Security Basics"],
    mid: ["System Design Patterns", "Advanced Frontend", "Database Optimization", "Cloud Services", "Testing Strategies"],
    senior: ["Distributed Systems", "Architecture Patterns", "Team Leadership", "Performance Optimization", "Technical Strategy"]
  },
  "frontend developer": {
    junior: ["HTML/CSS Fundamentals", "JavaScript Basics", "UI/UX Principles", "Basic React/Angular", "Browser DevTools"],
    mid: ["State Management", "Performance Optimization", "Responsive Design", "Testing Libraries", "Build Tools"],
    senior: ["Frontend Architecture", "Micro-frontends", "Team Leadership", "Advanced Performance", "Design Systems"]
  },
  "backend developer": {
    junior: ["API Design", "Database Basics", "Server Fundamentals", "Basic Security", "Version Control"],
    mid: ["Microservices", "Caching Strategies", "Message Queues", "API Security", "Database Design"],
    senior: ["System Architecture", "Scalability", "Cloud Infrastructure", "Team Leadership", "Performance Tuning"]
  },
  "python developer": {
    junior: ["Python Basics", "Data Structures", "Basic Algorithms", "Package Management", "Testing Basics"],
    mid: ["Advanced Python", "Web Frameworks", "Database Integration", "API Development", "Testing Strategies"],
    senior: ["System Architecture", "Performance Optimization", "ML Integration", "Team Leadership", "Best Practices"]
  }
};

const hrTopics: TopicsByLevel = {
  junior: [
    "Team Collaboration",
    "Communication Skills",
    "Problem-solving Approach",
    "Time Management",
    "Adaptability"
  ],
  mid: [
    "Leadership Potential",
    "Project Management",
    "Conflict Resolution",
    "Decision Making",
    "Mentoring Abilities"
  ],
  senior: [
    "Strategic Thinking",
    "Change Management",
    "Team Building",
    "Crisis Management",
    "Executive Presence"
  ]
};

// Helper function to sanitize and parse JSON response
const sanitizeAndParseJSON = (response: string): QuestionAnswer[] => {
  try {
    // Remove any potential code block markers
    let cleaned = response.replace(/```json\n?|\n?```/g, "");
    
    // Remove any control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    
    // Ensure the response starts with [ and ends with ]
    cleaned = cleaned.trim();
    if (!cleaned.startsWith("[")) cleaned = "[" + cleaned;
    if (!cleaned.endsWith("]")) cleaned = cleaned + "]";
    
    // Parse the cleaned JSON
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.log("Attempted to parse:", response);
    throw new Error("Failed to parse LLM response");
  }
};

const getRandomTopic = (role: string, experience: string, randomNumber: number, interviewType: string): string => {
  if (interviewType === "technical") {
    const roleTopics = technicalTopics[role.toLowerCase()]?.[experience];
    if (!roleTopics) throw new Error("Invalid role or experience level");
    return roleTopics[randomNumber % roleTopics.length];
  } else {
    const hrLevelTopics = hrTopics[experience];
    if (!hrLevelTopics) throw new Error("Invalid experience level");
    return hrLevelTopics[randomNumber % hrLevelTopics.length];
  }
};

const promptTemplate = `
System: For the following context: {systemContent}
Generate interview questions and answers in the following JSON format ONLY:
[
  {
    "question": "your question here",
    "answer": "your answer here"
  }
]
Ensure the response is valid JSON with no special characters or line breaks in strings.

User: {userContent}
`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const interviewType = formData.get("interviewType") as string;
    const role = formData.get("role") as string;
    const experience = formData.get("experience") as string;
    const resumeFile = formData.get("resume") as File;
    const newMockId = uuidv4();
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    let llmResponse;
    let cleanedResponse;
    let jsonResponse: QuestionAnswer[] = [];    // Generate a random number between 1 and 100 to induce randomness.
    const randomNumber = Math.floor(Math.random() * 100) + 1;
   

    if (interviewType === 'resume' && resumeFile) {
        // Convert the uploaded file to ArrayBuffer and then to base64
        const arrayBuffer = await resumeFile.arrayBuffer();
        const base64Pdf = Buffer.from(arrayBuffer).toString("base64");

        // Create the prompt for resume analysis
        const resumePrompt = {
            inlineData: {
                data: base64Pdf,
                mimeType: "application/pdf"
            }
        };

        // Send both the PDF data and the instruction prompt
        const result = await chatSession.sendMessage([
            resumePrompt,
            'Based on this resume, generate 3 relevant interview questions and their sample answers that assess the candidate\'s experience and skills. Format the response as a JSON array: [{"question":"...","answer":"..."},{"question":"...","answer":"..."}] Note:Dont ask coding questions.'
        ]);
        
        cleanedResponse = result.response.text().replace(/```json\n?|\n?```/g, '');
        console.log(cleanedResponse)
    } else {
      const systemContent = interviewType === "technical" 
        ? `Role: ${role}, Experience Level: ${experience}. Generate a technical interview question about: ${getRandomTopic(role, experience, randomNumber, "technical")}. The question should assess understanding and experience, not coding skills.`
        : `Experience Level: ${experience}. Generate an HR interview question about: ${getRandomTopic("", experience, randomNumber, "hr")}. Focus on behavioral and situational scenarios.`;

      const inputPrompt = promptTemplate
        .replace("{systemContent}", systemContent)
        .replace("{userContent}", "Generate the interview question now.");
      
      const result = await app.invoke(
        { messages: [{ role: "user", content: inputPrompt }] },
        { configurable: { thread_id: newMockId } }
      );

      llmResponse = result.messages[result.messages.length - 1].content;
      jsonResponse=sanitizeAndParseJSON(llmResponse)
    }

    // Parse and validate the LLM response                                      
    
    // Generate mock interview ID and prepare data
    const insertData = {
      mockId: newMockId,
      jsonMockResp: (interviewType === "resume" ? cleanedResponse : JSON.stringify(jsonResponse)),
      jobPosition: role || (interviewType === "resume" ? "Resume Interview" : "HR Interview"),
      jobType: interviewType,
      jobExperience: experience,
      createdBy: user.emailAddresses[0].emailAddress,
      createdAt: moment().format("DD-MM-YYYY"),
    };

    const resp = await db
      .insert(MockInterview)
      .values(insertData)
      .returning({ mockId: MockInterview.mockId });

    return Response.json({ 
      mockId: resp[0].mockId,
      threadId: newMockId // Explicitly return the threadId for future use
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return Response.json(
      { error: "Failed to create interview. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;

    // Get the interviews
    const interviews = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.createdBy, userEmail))
      .orderBy(desc(MockInterview.createdAt));

    // Calculate average rating
    const averageRating = await db
      .select({
        averageScore: avg(UserAnswer.rating),
      })
      .from(UserAnswer)
      .where(eq(UserAnswer.userEmail, userEmail));

    let formattedAverageScore = "0.0";
    const avgScore = averageRating[0]?.averageScore;
    if (avgScore !== null && avgScore !== undefined) {
      formattedAverageScore = Number(avgScore).toFixed(1);
    }

    return Response.json({
      interviews,
      stats: {
        completedInterviews: interviews.length,
        averageScore: formattedAverageScore,
        totalHours: "12.5",
        upcomingSessions: "3",
      },
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}