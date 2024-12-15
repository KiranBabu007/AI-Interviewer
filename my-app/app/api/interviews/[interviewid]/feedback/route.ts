import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { interviewid: string } }) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user answers for the specific mock interview
        const result = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, params.interviewid))
            .orderBy(UserAnswer.id);

        if (result.length === 0) {
            return NextResponse.json({ 
                message: 'No feedback found',
                feedbackList: []
            }, { status: 200 });
        }

        return NextResponse.json({
            message: 'Feedback retrieved successfully',
            feedbackList: result
        });

    } catch (error: any) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            message: 'Failed to fetch'
        }, { status: 500 });
    }
}