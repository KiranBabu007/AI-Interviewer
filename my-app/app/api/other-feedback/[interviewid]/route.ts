// app/api/analysis/[interviewid]/route.ts
import { db } from '@/utils/db';
import { UserAnalysis } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { interviewid: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.select()
      .from(UserAnalysis)
      .where(eq(UserAnalysis.mockIdRef, params.interviewid));

    if (result.length === 0) {
      return NextResponse.json({
        message: 'No analysis found',
        analysisData: []
      }, { status: 200 });
    }

    return NextResponse.json({
      message: 'Analysis data retrieved successfully',
      analysisData: result
    });

  } catch (error: unknown) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to fetch analysis data'
    }, { status: 500 });
  }
}