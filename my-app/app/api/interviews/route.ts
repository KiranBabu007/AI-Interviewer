import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { auth, currentUser } from "@clerk/nextjs/server";
import { desc, eq, avg } from "drizzle-orm";
import { ChatGroq } from "@langchain/groq";

// Initialize Groq with API Key from environment
const llm = new ChatGroq({
  model: "gemma2-9b-it",
  apiKey: process.env.GROQ_API_KEY, // Ensure it's set in .env
  temperature: 0,
});

const promptTemplate = `
[
  {
    "role": "system",
    "content": "{systemContent}"
  },
  {
    "role": "user",
    "content": "{userContent}"
  }
]
`;

function sanitizeJSONResponse(response) {
  if (typeof response !== "string") return "";

  return response
    .replace(/```json\n?|\n?```/g, "") // Remove Markdown JSON wrappers
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim(); // Remove unnecessary spaces
}

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const interviewType = formData.get("interviewType") as string;
    const role = formData.get("role") as string;
    const experience = formData.get("experience") as string;
    const resumeFile = formData.get("resume") as File;

    // Authenticate user
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let cleanedResponse = "";

    if (interviewType === "resume" && resumeFile) {
      // Convert file to base64
      const arrayBuffer = await resumeFile.arrayBuffer();
      const base64Pdf = Buffer.from(arrayBuffer).toString("base64");

      const resumePrompt = [
        {
          role: "system",
          content:
            "Analyze the following resume and generate 2 relevant interview questions along with answers.",
        },
        { role: "user", content: base64Pdf },
      ];

      // Invoke LLM
      const result = await llm.invoke(resumePrompt);
      cleanedResponse =
        typeof result?.content === "string"
          ? sanitizeJSONResponse(result.content)
          : "";
    } else {
      let inputPrompt = "";

      // Determine the content based on interview type
      if (interviewType === "technical") {
        // Adjust system content to include role and experience
        const systemContent = `Role: ${role}, Experience Level: ${experience}. Generate 1 technical interview question and a brief answer. Adjust difficulty based on experience level.`;

        // User content for the technical interview question
        const userContent = `Format the response as JSON: [{"question":"...","answer":"..."}]`;

        // Replace placeholders with actual content
        inputPrompt = promptTemplate
          .replace("{systemContent}", systemContent)
          .replace("{userContent}", userContent);
      } else {
        // Adjust system content for HR interview
        const systemContent = `Generate 1 HR interview question based on the experience level: ${experience}. Adjust difficulty based on experience level.`;

        // User content for the HR interview question
        const userContent = `Format the response as JSON: [{"question":"...","answer":"..."}]`;

        // Replace placeholders with actual content
        inputPrompt = promptTemplate
          .replace("{systemContent}", systemContent)
          .replace("{userContent}", userContent);
      }

      // Invoke LLM
      const result = await llm.invoke([{ role: "user", content: inputPrompt }]);
      cleanedResponse =
        typeof result?.content === "string"
          ? sanitizeJSONResponse(result.content)
          : "";
    }

    // Validate cleaned response
    if (!cleanedResponse) {
      return Response.json(
        { error: "Failed to generate interview questions" },
        { status: 500 }
      );
    }

    // Ensure the response is a valid JSON array
    let jsonResponse = [];
    try {
      jsonResponse = JSON.parse(cleanedResponse);

      if (!Array.isArray(jsonResponse)) {
        jsonResponse = [jsonResponse]; // Ensure it's always an array
      }
    } catch (error) {
      console.error(
        "Failed to parse JSON response:",
        error,
        "Raw response:",
        cleanedResponse
      );
      return Response.json(
        { error: "Invalid JSON response from LLM" },
        { status: 500 }
      );
    }

    // ✅ Now `jsonResponse` is guaranteed to be a valid array

    // Generate a unique mock interview ID
    const newMockId = uuidv4();

    // Prepare data for database insertion
    const insertData = {
      mockId: newMockId,
      jsonMockResp: JSON.stringify(jsonResponse), // Store as stringified JSON
      jobPosition:
        role ||
        (interviewType === "resume" ? "Resume Interview" : "HR Interview"),
      jobType: interviewType,
      jobExperience: experience,
      createdBy: user.emailAddresses[0].emailAddress,
      createdAt: moment().format("DD-MM-YYYY"),
    };

    // Insert into database
    const resp = await db
      .insert(MockInterview)
      .values(insertData)
      .returning({ mockId: MockInterview.mockId });

    // ✅ Return the mock interview ID after database insertion
    return Response.json({ mockId: resp[0].mockId, questions: jsonResponse });
  } catch (error) {
    console.error("Error creating interview:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
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
