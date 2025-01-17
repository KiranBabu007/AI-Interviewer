import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: Request, { params }: { params: { interviewid: string } }) {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const result = await db.select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewid))
            .limit(1);

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: 'Interview not found' }), { status: 404 });
        }

        const interviewData = result[0];
        let mockInterviewQuestions;
        console.log('Interview Data:', interviewData);
        
        try {
            mockInterviewQuestions = JSON.parse(interviewData.jsonMockResp);
        } catch (parseError) {
            console.error('Error parsing interview questions:', parseError);
            return new Response(JSON.stringify({ error: 'Invalid interview data format' }), { status: 500 });
        }

        return new Response(JSON.stringify({
            interviewData: interviewData,
            mockInterviewQuestions: mockInterviewQuestions
        }));

    } catch (error) {
        console.error('Error fetching interview details:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}