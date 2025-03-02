import { NextResponse } from 'next/server';
import * as dotenv from 'dotenv';
import { ElevenLabsClient } from 'elevenlabs';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error('Missing ELEVENLABS_API_KEY in environment variables');
}

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

const createAudioStreamFromText = async (text: string): Promise<Buffer> => {
  const audioStream = await client.generate({
    voice: 'JBFqnCBsd6RMkjVDRZzb',
    model_id: 'eleven_turbo_v2_5',
    text,
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: 'Missing text parameter' },
        { status: 400 }
      );
    }

    const audioBuffer = await createAudioStreamFromText(text);
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Error generating audio' },
      { status: 500 }
    );
  }
}