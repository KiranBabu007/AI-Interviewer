// app/api/transcribe/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert the File to a Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Create form data for Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', new Blob([buffer]), 'audio.mp3');
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('language', 'en');

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const transcription = await response.json();

    return NextResponse.json(transcription);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}