import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Volume2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Hls from 'hls.js';

interface QuestionsSectionProps {
  mockInterviewQuestion: { question: string }[];
  activeQuestionIndex: number;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  mockInterviewQuestion,
  activeQuestionIndex,
}) => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Configure your API keys and face ID
  const CONFIG = {
    ttsAPIKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
    simliAPIKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY || '',
    faceId: 'tmp9i8bbq7c', // Replace with your preferred face ID
  };

  const generateAvatarVideo = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.simli.ai/textToVideoStream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...CONFIG,
          requestBody: {
            audioProvider: 'ElevenLabs',
            text: text,
            voiceName: 'pMsXgVXv3BLzUgSXRplE',
            model_id: 'eleven_turbo_v2',
            voice_settings: {
              stability: 0.1,
              similarity_boost: 0.3,
              style: 0.2
            }
          }
        })
      });
      console.log('response', response);
      const data = await response.json();
      setVideoUrl(data.hls_url);
    } catch (error) {
      console.error('Error generating avatar video:', error);
      // Fallback to basic text-to-speech if avatar generation fails
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup previous HLS instance when question changes
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setVideoUrl('');
  }, [activeQuestionIndex]);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    if (Hls.isSupported()) {
      // Cleanup previous instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000, // 60MB
        maxBufferHole: 0.5,
        lowLatencyMode: true,
        backBufferLength: 30
      });

      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(console.error);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, destroying HLS instance:', data);
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = videoUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play().catch(console.error);
      });
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  return mockInterviewQuestion ? (
    <div className="p-5 z-10 rounded-lg my-10">
      <div className="mb-5">
        <AlertDialog>
          <AlertDialogTrigger className="h-9 px-6 text-sm bg-red-700 text-white rounded-lg hover:bg-red-800 z-50">
            Go back to Dashboard
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This would interrupt the ongoing interview
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/dashboard')}>
                Proceed to Dashboard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      

      <div className="my-5">
        {videoUrl ? (
          <div className="relative w-full aspect-video max-w-lg mx-auto mb-5">
            <video
              ref={videoRef}
              className="rounded-lg w-full h-full"
              controls
              playsInline
              autoPlay
            >
              Your browser does not support HLS video playback.
            </video>
          </div>
        ) : (
          <h2 className="text-md md:text-lg text-white">
            {mockInterviewQuestion[activeQuestionIndex]?.question}
          </h2>
        )}

        <Volume2 
          className={`cursor-pointer bg-black text-white ${isLoading ? 'opacity-50' : ''}`}
          onClick={() => !isLoading && generateAvatarVideo(mockInterviewQuestion[activeQuestionIndex]?.question)} 
        />
        {isLoading && <span className="ml-2 text-sm text-gray-400">Generating avatar response...</span>}
      </div>

      <div className="border rounded-lg p-5 opacity-70 bg-gray-100 mt-20">
        <h2 className="flex gap-2 items-center text-primary">
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <h2 className="text-sm text-primary my-2">
          Click on Record Answer when you want to answer the question. At the end of the interview, we will give you the feedback along with the correct answer for each question and your answer to compare it.
        </h2>
      </div>
    </div>
  ) : null;
};

export default QuestionsSection;