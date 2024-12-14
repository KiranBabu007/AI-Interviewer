import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { chatSession } from '@/utils/GeminiAiModel';
import { auth, currentUser } from '@clerk/nextjs/server';
import { desc, eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { interviewType, role, experience } = await request.json();
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate AI response based on interview type
        let inputPrompt = '';
        if (interviewType === 'technical') {
            inputPrompt = `Role: ${role}, Experience Level: ${experience}. Generate 2 technical interview questions appropriate for this role and experience level, along with detailed answers. Provide the response in JSON format as an array of objects with 'question' and 'answer' fields: [{'question':'...','answer':'...'}]`;
        } else {
            inputPrompt = `Experience Level: ${experience}. Generate 2 HR interview questions appropriate for this experience level, along with detailed sample answers. Provide the response in JSON format as an array of objects with 'question' and 'answer' fields: [{'question':'...','answer':'...'}]`;
        }

        const result = await chatSession.sendMessage(inputPrompt);
        const MockJsonResp = result.response.text();

        const cleanedResponse = MockJsonResp.replace(/```json\n?|\n?```/g, '');


        if (!result) {
            return Response.json({ error: 'Failed to generate interview questions' }, { status: 500 });
        }

        const newMockId = uuidv4();
        
        const insertData = {
            mockId: newMockId,
            jsonMockResp: cleanedResponse,
            jobPosition: role || 'HR Interview',
            jobType: interviewType,
            jobExperience: experience,
            createdBy: user.emailAddresses[0].emailAddress,
            createdAt: moment().format('DD-MM-yyyy')
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

        const interviews = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.createdBy, user.emailAddresses[0].emailAddress))
            .orderBy(desc(MockInterview.id));
        return Response.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}