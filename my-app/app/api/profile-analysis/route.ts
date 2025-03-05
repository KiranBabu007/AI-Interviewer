import { db } from '@/utils/db';
import { UserAnalysis } from '@/utils/schema';
import { eq, avg } from 'drizzle-orm';  // Added sql and avg imports
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = user?.emailAddresses[0].emailAddress;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    
    
    // Then get average ratings grouped by feedbacktype
    const averageRatings = await db.select({
      feedbacktype: UserAnalysis.feedbacktype,
      averageRating: avg(UserAnalysis.rating).as('averageRating')
    })
    .from(UserAnalysis)
    .where(eq(UserAnalysis.userEmail, userEmail))
    .groupBy(UserAnalysis.feedbacktype);
    
    // Create a map of feedback types to their average ratings
    const ratingsByType = averageRatings.reduce((acc, item) => {
      if (item.feedbacktype && item.averageRating !== null) {
        acc[item.feedbacktype] = parseFloat(item.averageRating);
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Default values if certain feedback types don't exist
    const averageScores = {
      audio: ratingsByType['audio'] || 0,
      behavior: ratingsByType['behavior'] || 0
    };
    
    if (averageRatings.length === 0) {
      return NextResponse.json({
        message: 'No analysis found',
        averageScores
      }, { status: 200 });
    }

    return NextResponse.json({
      message: 'Analysis data retrieved successfully',
      averageScores
    });

  } catch (error: unknown) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to fetch analysis data'
    }, { status: 500 });
  }
}