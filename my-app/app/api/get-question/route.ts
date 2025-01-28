import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    try {
        
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract interviewId from the request body
        const { interviewId } = await request.json();

        if (!interviewId) {
            return Response.json({ error: 'Interview ID is required' }, { status: 400 });
        }

        // Fetch interview details from the MockInterview table
        const result = await db.select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, interviewId))
            .limit(1);

        if (result.length === 0) {
            return Response.json({ error: 'Interview not found' }, { status: 404 });
        }

        const interviewData = result[0];
        let mockInterviewQuestions;

        console.log('Interview Data:', interviewData);

        // Parse the JSON string in jsonMockResp
        try {
            mockInterviewQuestions = JSON.parse(interviewData.jsonMockResp);
        } catch (parseError) {
            console.error('Error parsing interview questions:', parseError);
            return Response.json({ error: 'Invalid interview data format' }, { status: 500 });
        }

        // Return the interview data and questions
        return Response.json({
            interviewData: interviewData,
            mockInterviewQuestions: mockInterviewQuestions
        });

    } catch (error) {
        console.error('Error fetching interview details:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}