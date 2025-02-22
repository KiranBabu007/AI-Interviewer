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

interface QuestionsSectionProps {
  mockInterviewQuestion: { question: string }[];
  activeQuestionIndex: number;
}

interface Config {
  simliAPIKey: string;
  faceId: string;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  mockInterviewQuestion,
  activeQuestionIndex,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Ref to store the currently playing audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const CONFIG: Config = {
    simliAPIKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY || '',
    faceId: 'tmp9i8bbq7c',
  };

  /**
   * Calls our API route to generate TTS audio from the given text,
   * then creates a Blob URL and plays it.
   */
  const generateTextToSpeechAudio = async (text: string) => {
    if (!text) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate audio: ${response.statusText}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // If there's already an audio playing, stop it and revoke its URL.
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();

      // Clean up the blob URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
    } catch (error) {
      console.error('Error generating TTS audio:', error);
      // Fallback to browser speech synthesis
      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to automatically play TTS when question changes or component mounts
  useEffect(() => {
    generateTextToSpeechAudio(mockInterviewQuestion[activeQuestionIndex]?.question);

    // Cleanup function to stop audio when the component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [mockInterviewQuestion[activeQuestionIndex]?.question]);

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

      {/* Centered large volume button */}
      <div className="flex flex-col items-center my-5">
      <h2 className="text-md md:text-lg text-white">
            {mockInterviewQuestion[activeQuestionIndex]?.question}
          </h2>
        <Volume2 
          size={80} // Increase the icon size
          className={`cursor-pointer bg-black text-white rounded-full p-4 ${isLoading ? 'opacity-50' : ''}`}
          onClick={() =>
            !isLoading &&
            generateTextToSpeechAudio(mockInterviewQuestion[activeQuestionIndex]?.question)
          } 
        />
        {isLoading && <span className="mt-2 text-sm text-gray-400"></span>}
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
