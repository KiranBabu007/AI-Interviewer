import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/GeminiAiModel';
import { db } from '@/utils/db';
import { UserAnalysis } from '@/utils/schema';
import moment from 'moment';

export async function POST(request: Request) {
  try {
    // Get form data from request
    const formData = await request.formData();
    const mockId = formData.get('mockId') as string;
    const userEmail = formData.get('user') as string;
    const imageFiles: File[] = [];
    
    // Collect all images from form data using Array.from
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
      }
    });

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'No image files provided' }, { status: 400 });
    }

    // Convert images to base64
    const imagePromises = imageFiles.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return {
        inlineData: {
          data: base64,
          mimeType: file.type
        }
      };
    });

    const imageContents = await Promise.all(imagePromises);

    // Create analysis prompt for Gemini
    const analysisPrompt = 
      `Analyze these interview snapshots for the candidate's behavioral aspects.\n` +
      `Provide a detailed evaluation covering:\n` +
      `1. Posture analysis (sitting position, alignment)\n` +
      `2. Facial expressions (engagement, attentiveness)\n` +
      `3. Body language (professionalism, confidence)\n` +
      `4. Specific recommendations for improvement\n` +
      `5. Overall confidence score (1-10)\n` +
      `Return only JSON: {
        "postureAnalysis": "string",
        "facialExpressions": "string",
        "bodyLanguage": "string",
        "recommendations": "string",
        "confidenceScore": number,
        "overallImpression": "string"
      }`;

    // Send to Gemini with both images and prompt
    const result = await chatSession.sendMessage([
      ...imageContents,
      analysisPrompt
    ]);

    // Parse Gemini response
    const analysisJson = (await result.response.text())
      .replace('```json', '')
      .replace('```', '');
    
    const analysis = JSON.parse(analysisJson);

    // Prepare the feedback string combining all analysis aspects
    const detailedFeedback = `
Posture Analysis: ${analysis.postureAnalysis}

Facial Expressions: ${analysis.facialExpressions}

Body Language: ${analysis.bodyLanguage}

Recommendations: ${analysis.recommendations}

Overall Impression: ${analysis.overallImpression}
    `.trim();

    // Insert data into UserAnalysis table
    await db.insert(UserAnalysis).values({
      mockIdRef: mockId,
      feedback: detailedFeedback,
      feedbacktype: 'behavior',
      rating: analysis.confidenceScore,
      userEmail: userEmail,
      createdAt: moment().format("DD-MM-YYYY")
    });

    return NextResponse.json({
      message: "Behavioral analysis completed and saved successfully",
      analysis: analysis
    }, { status: 200 });

  } catch (error) {
    console.error('Error analyzing behavior:', error);
    return NextResponse.json({
      error: 'Failed to analyze behavior',
      details: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Increase payload limit for image files
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '10mb'
//     }
//   }
// };