import { NextResponse } from 'next/server';
import { chatSession } from '@/utils/GeminiAiModel';
import { db } from '@/utils/db';
import { UserAnalysis } from '@/utils/schema';
import moment from 'moment';

export async function POST(request: Request) {
  try {
    // Get form data from request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const question = formData.get('question') as string;
    const mockId = formData.get('mockid') as string;
    const userEmail = formData.get('user') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert audio file to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Create analysis prompt for Gemini
    const analysisPrompt = 
      `Analyze this interview response audio clip for the following question: "${question}"\n` +
      `Provide a detailed evaluation covering:\n` +
      `1. Content analysis (relevance, completeness)\n` +
      `2. Communication style (clarity, tone, pace)\n` +
      `3. Professional demeanor (confidence, language use)\n` +
      `4. Areas for improvement\n` +
      `5. Overall rating (1-10)\n` +
      `Return only JSON: {
        "contentAnalysis": "string",
        "communicationStyle": "string",
        "professionalDemeanor": "string",
        "areasForImprovement": "string",
        "rating": number,
        "overallFeedback": "string"
      }`;

    // Send to Gemini with both audio and prompt
    const result = await chatSession.sendMessage([
      {
        inlineData: {
          data: audioBase64,
          mimeType: 'audio/mp3'
        }
      },
      analysisPrompt
    ]);

    // Parse Gemini response
    const analysisJson = (await result.response.text())
      .replace('```json', '')
      .replace('```', '');
    
    const analysis = JSON.parse(analysisJson);

    // Prepare the feedback string combining all analysis aspects
    const detailedFeedback = `
Content Analysis: ${analysis.contentAnalysis}

Communication Style: ${analysis.communicationStyle}

Professional Demeanor: ${analysis.professionalDemeanor}

Areas for Improvement: ${analysis.areasForImprovement}

Overall Feedback: ${analysis.overallFeedback}
    `.trim();

    // Insert data into UserAnalysis table
    await db.insert(UserAnalysis).values({
      mockIdRef: mockId,
      question: question,
      feedback: detailedFeedback,
      feedbacktype: 'audio', // Adding a type to distinguish audio analysis
      rating: analysis.rating,
      userEmail: userEmail,
      createdAt: moment().format("DD-MM-YYYY")
    });

    return NextResponse.json({
      message: "Audio analysis completed and saved successfully",
      analysis: analysis
    }, { status: 200 });

  } catch (error) {
    console.error('Error analyzing audio:', error);
    return NextResponse.json({
      error: 'Failed to analyze audio',
      details: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Increase payload limit for audio files
// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '10mb'
//     }
//   }
// };