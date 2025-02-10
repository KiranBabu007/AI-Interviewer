import { db } from '@/utils/db';
import { MockInterview, UserAnswer } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { chatSession } from '@/utils/GeminiAiModel';
import { auth, currentUser } from '@clerk/nextjs/server';
import { desc, eq, avg } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const interviewType = formData.get('interviewType') as string;
        const role = formData.get('role') as string;
        const experience = formData.get('experience') as string;
        const resumeFile = formData.get('resume') as File;

        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let cleanedResponse;
        
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
                'Based on this resume, generate 2 relevant interview questions and their sample answers that assess the candidate\'s experience and skills. Format the response as a JSON array: [{"question":"...","answer":"..."},{"question":"...","answer":"..."}]'
            ]);

            cleanedResponse = result.response.text().replace(/```json\n?|\n?```/g, '');
        } else {
            let inputPrompt = '';
            if (interviewType === 'technical') {
                inputPrompt = `Role: ${role}, Experience Level: ${experience}. Generate 1 technical interview question appropriate for this role and experience level, along with small answer from question bank ${Math.floor(Math.random() * 100000) + 1}.Answers should be one paragraph. Provide the response in JSON format as an array of objects with 'question' and 'answer' fields: [{'question':'...','answer':'...'}] Note : Don't ask to write program code`;
            } else {
                inputPrompt = `Experience Level: ${experience}. Generate 1 HR interview question appropriate for this experience level, along with detailed sample small answer from question bank ${Math.floor(Math.random() * 100000) + 1}. Provide the response in JSON format as an array of objects with 'question' and 'answer' fields: [{'question':'...','answer':'...'}]`;
            }

            const result = await chatSession.sendMessage(inputPrompt);
            cleanedResponse = result.response.text().replace(/```json\n?|\n?```/g, '');
        }

        if (!cleanedResponse) {
            return Response.json({ error: 'Failed to generate interview questions' }, { status: 500 });
        }

        const newMockId = uuidv4();
        
        const insertData = {
            mockId: newMockId,
            jsonMockResp: cleanedResponse,
            jobPosition: role || (interviewType === 'resume' ? 'Resume Interview' : 'HR Interview'),
            jobType: interviewType,
            jobExperience: experience,
            createdBy: user.emailAddresses[0].emailAddress,
            createdAt: moment().format('DD-MM-YYYY')
        };

        const resp = await db
            .insert(MockInterview)
            .values(insertData)
            .returning({ mockId: MockInterview.mockId });

        return Response.json({ mockId: resp[0].mockId });
    } catch (error) {
        console.error('Error creating interview:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
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
                averageScore: avg(UserAnswer.rating)
            })
            .from(UserAnswer)
            .where(eq(UserAnswer.userEmail, userEmail));

        // Handle the average score calculation with proper type checking
        let formattedAverageScore = '0.0';
        const avgScore = averageRating[0]?.averageScore;
        if (avgScore !== null && avgScore !== undefined) {
            formattedAverageScore = Number(avgScore).toFixed(1);
        }

        return Response.json({
            interviews,
            stats: {
                completedInterviews: interviews.length,
                averageScore: formattedAverageScore,
                totalHours: '12.5',
                upcomingSessions: '3'
            }
        });
    } catch (error) {
        console.error('Error fetching interviews:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}