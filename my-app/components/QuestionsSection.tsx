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

interface Config {
  ttsAPIKey: string;
  simliAPIKey: string;
  faceId: string;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  mockInterviewQuestion,
  activeQuestionIndex,
}) => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadVideoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const preloadHlsRef = useRef<Hls | null>(null);
  const bufferCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const CONFIG: Config = {
    ttsAPIKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
    simliAPIKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY || '',
    faceId: 'tmp9i8bbq7c',
  };

  const generateAvatarVideo = async (text: string) => {
    setIsLoading(true);
    setShowVideo(false);
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
      const data = await response.json();
      setVideoUrl(data.hls_url);
    } catch (error) {
      console.error('Error generating avatar video:', error);
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkBufferStatus = () => {
    if (!preloadVideoRef.current) return;
    
    const video = preloadVideoRef.current;
    const buffered = video.buffered;
    
    if (buffered.length > 0) {
      const duration = video.duration;
      const bufferedEnd = buffered.end(buffered.length - 1);
      const bufferedStart = buffered.start(0);
      
      const bufferPercentage = (bufferedEnd / duration) * 100;
      setLoadingProgress(Math.min(bufferPercentage, 100));

      // Check if video is fully buffered
      if (bufferedEnd >= duration - 0.5 && bufferedStart <= 0.5) {
        if (bufferCheckIntervalRef.current) {
          clearInterval(bufferCheckIntervalRef.current);
          bufferCheckIntervalRef.current = null;
        }
        
        // Now we can show the actual video player
        setShowVideo(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(console.error);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (preloadHlsRef.current) {
        preloadHlsRef.current.destroy();
      }
    };
  }, []);
  
  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (preloadHlsRef.current) {
      preloadHlsRef.current.destroy();
      preloadHlsRef.current = null;
    }
    setVideoUrl('');
    setShowVideo(false);
    setLoadingProgress(0);
  }, [activeQuestionIndex]);

  useEffect(() => {
    if (!videoUrl) return;

    if (Hls.isSupported()) {
      // Setup preload video
      if (preloadHlsRef.current) {
        preloadHlsRef.current.destroy();
      }

      const preloadHls = new Hls({
        maxBufferLength: 60,
        maxMaxBufferLength: 600,
        maxBufferSize: 600 * 1000 * 1000,
        maxBufferHole: 0.1,
        lowLatencyMode: false,
        backBufferLength: 90,
        enableWorker: true,
        startPosition: 0,
        debug: false
      });

      preloadHlsRef.current = preloadHls;
      if (preloadVideoRef.current) {
        preloadHls.loadSource(videoUrl);
        preloadHls.attachMedia(preloadVideoRef.current);
      }

      preloadHls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (bufferCheckIntervalRef.current) {
          clearInterval(bufferCheckIntervalRef.current);
        }
        bufferCheckIntervalRef.current = setInterval(checkBufferStatus, 1000);
      });

      // Setup main video player
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxBufferLength: 60,
        maxMaxBufferLength: 600,
        maxBufferSize: 600 * 1000 * 1000,
        maxBufferHole: 0.1,
        lowLatencyMode: false,
        backBufferLength: 90,
        enableWorker: true,
        startPosition: 0,
        debug: false
      });

      hlsRef.current = hls;
      if (videoRef.current) {
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
      }

    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for Safari
      if (preloadVideoRef.current) preloadVideoRef.current.src = videoUrl;
      if (videoRef.current) videoRef.current.src = videoUrl;
      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
      }
      bufferCheckIntervalRef.current = setInterval(checkBufferStatus, 1000);
    }

  }, [videoUrl]);

  return mockInterviewQuestion ? (
    <div className="p-5 z-10 rounded-lg my-10">
      {/* Hidden preload video element */}
      <video
        ref={preloadVideoRef}
        className="hidden"
        preload="auto"
        muted
      />

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
            {!showVideo ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 rounded-lg">
                <div className="text-white mb-2">
                  Thinking... {Math.round(loadingProgress)}%
                </div>
                <div className="w-64 h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            ) : null}
            <video
              ref={videoRef}
              className={`rounded-lg w-full h-full ${!showVideo ? 'hidden' : ''}`}
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