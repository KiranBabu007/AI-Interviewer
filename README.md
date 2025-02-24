# AI Interviewer Platform

AI Interviewer is a web-based platform designed to help users practice and improve their interview skills through mock interviews. The platform leverages facial recognition, screen monitoring, and behavioral analysis to provide a realistic interview environment. It is built with Next.js, Supabase, and the Gemini framework for robust and scalable performance.

## Features

- **Mock Interviews**: Simulate real interview environments with AI-driven question generation.
- **Facial Recognition**: Ensure user identity and track attention during the interview.
- **Screen Monitoring**: Prevent tab switching to maintain focus.
- **Behavioral Analysis**: Analyze user responses to provide feedback on strengths and areas for improvement.
- **Dynamic Question Generation**: Generate questions based on user-selected job roles or topics.
- **Real-time Feedback**: Provide instant feedback on performance after each interview session.
- **Proctoring Tools**: Monitor user behavior to ensure integrity during mock interviews.

## Technology Stack

- **Frontend**: Built with [Next.js](https://nextjs.org/) for server-side rendering and fast page loads.
- **Backend**: Powered by [Supabase](https://supabase.io/) for authentication, database management, and real-time data handling.
- **AI and Analytics**: Uses [Gemini](https://gemini.ai/) for advanced AI capabilities including question generation and behavioral analysis.
  
## Setup and Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ai-interviewer.git
    ```
2. **Navigate to the project directory**:
    ```bash
    cd ai-interviewer
    ```
3. **Install dependencies**:
    ```bash
    npm install
    ```
4. **Set up environment variables**:
    Create a `.env.local` file in the root directory and add the necessary environment variables for Supabase and Gemini.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    GEMINI_API_KEY=your-gemini-api-key
    ```

5. **Run the development server**:
    ```bash
    npm run dev
    ```
   Visit `http://localhost:3000` to view the application.

## Usage

1. **Sign Up**: Create an account to start using the platform.
2. **Select Interview Type**: Choose between technical, HR, or behavioral interviews.
3. **Start Interview**: Begin the interview session with real-time monitoring and question generation.
4. **Receive Feedback**: Review performance metrics and feedback provided after the interview.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any feature additions or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any inquiries or feedback, please reach out at [your-email@example.com](mailto:your-email@example.com).

---
CODE

import { db } from "@/utils/db";

import { MockInterview, UserAnswer } from "@/utils/schema";

import { v4 as uuidv4 } from "uuid";

import moment from "moment";

import { auth, currentUser } from "@clerk/nextjs/server";

import { desc, eq, avg } from "drizzle-orm";

import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",

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

export async function POST(request: Request) {
  try {
    // Parse form data

    const formData = await request.formData();

    const interviewType = formData.get("interviewType") as string;

    const role = formData.get("role") as string;

    const experience = formData.get("experience") as string;

    const resumeFile = formData.get("resume") as File; // Authenticate user

    const { userId } = await auth();

    const user = await currentUser();

    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let cleanedResponse;

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
      ]; // Invoke LLM

      const result = await llm.invoke(resumePrompt);

      cleanedResponse =
        typeof result.content === "string"
          ? result.content.replace(/```json\n?|\n?```/g, "")
          : "";
    } else {
      let inputPrompt = "";

      if (interviewType === "technical") {
        inputPrompt = ` 

 ${promptTemplate.replace(
          "{systemContent}",

          `Role: ${role}, Experience Level: ${experience}`
        )} 

 . Generate 1 technical interview question and a brief answer. Format response as JSON: [{"question":"...","answer":"..."}] strictly give as json inside list with [] 

`;
      } else {
        inputPrompt = ` 

 ${promptTemplate.replace(
          "{systemContent}",

          `Experience Level: ${experience}`
        )} 

 . Generate 1 HR interview question with a detailed answer. Format response as JSON: [{"question":"...","answer":"..."}] 

`;
      } // Invoke LLM

      const result = await llm.invoke([{ role: "user", content: inputPrompt }]);

      cleanedResponse =
        typeof result?.content === "string"
          ? result.content.replace(/```json\n?|\n?```/g, "")
          : "";
    } // Validate cleaned response

    if (!cleanedResponse) {
      return Response.json(
        { error: "Failed to generate interview questions" },

        { status: 500 }
      );
    } // Ensure the response is a valid JSON array

    let jsonResponse = [];

    try {
      jsonResponse = JSON.parse(cleanedResponse);

      if (!Array.isArray(jsonResponse)) {
        jsonResponse = [jsonResponse]; // Ensure it's always an array
      }
    } catch (error) {
      console.error("Failed to parse JSON response:", error);

      return Response.json(
        { error: "Invalid JSON response from LLM" },

        { status: 500 }
      );
    } // Generate a unique mock interview ID

    const newMockId = uuidv4(); // Prepare data for database insertion

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
    }; // Insert into database

    const resp = await db

      .insert(MockInterview)

      .values(insertData)

      .returning({ mockId: MockInterview.mockId }); // Return the mock interview ID

    return Response.json({ mockId: resp[0].mockId });
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

    const userEmail = user.emailAddresses[0].emailAddress; // Get the interviews

    const interviews = await db

      .select()

      .from(MockInterview)

      .where(eq(MockInterview.createdBy, userEmail))

      .orderBy(desc(MockInterview.createdAt)); // Calculate average rating

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
