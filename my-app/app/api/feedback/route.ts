import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema'; // Import the MockInterview schema
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract interviewid from the request body
        const { interviewid } = await request.json();

        if (!interviewid) {
            return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
        }

        // Fetch feedback data from UserAnswer table
        const result = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, interviewid))
            .orderBy(UserAnswer.id);

        if (result.length === 0) {
            return NextResponse.json({ 
                message: 'No feedback found',
                feedbackList: []
            }, { status: 200 });
        }

        // Step 1: Calculate the average rating
        const ratings = result.map(feedback => feedback.rating || 0); // Ensure ratings are numbers
        const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
        const averageRating = Math.round(totalRating / ratings.length); // Round the average rating

        // Step 2: Update the totalRating in the MockInterview table
        await db.update(MockInterview)
            .set({ totalRating: averageRating })
            .where(eq(MockInterview.mockId, interviewid));

        console.log("Feedback retrieved and rating updated successfully");
        return NextResponse.json({
            message: 'Feedback retrieved and rating updated successfully',
            feedbackList: result,
            averageRating: averageRating
        });

    } catch (error: unknown) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ 
            error: 'Internal server error', 
            message: 'Failed to fetch or update'
        }, { status: 500 });
    }
}