"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface RecordAnswerSectionProps {
  mockInterviewQuestion: { question: string }[];
  activeQuestionIndex: number;
  interviewData: string[];
}

const RecordAnswerSection: React.FC<RecordAnswerSectionProps> = ({ mockInterviewQuestion, activeQuestionIndex, interviewData }) => {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  // Combine final results into complete transcript
  const completeTranscript = results.map(result => 
    typeof result === 'string' ? result : result.transcript
  ).join(' ');

  useEffect(() => {
    setUserAnswer(completeTranscript);
  }, [completeTranscript]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [isRecording, userAnswer]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mockInterviewQuestion,
          activeQuestionIndex,
          interviewData,
          userAnswer,
          userEmail: user?.primaryEmailAddress?.emailAddress
        })
      });

      const result = await response.json();
      console.log('result:', result);
      if (response.ok) {
        setUserAnswer('');
      } else {
        console.error('Error saving answer:', result.error);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setResults([]);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-2xl p-6">
        <CardContent>
          <p className="text-red-500">Web Speech API is not available in this browser 🤷‍</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='flex flex-col justify-center items-center rounded-lg bg-black  '>
        <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt='webcam image' />
        <Webcam mirrored={true} style={{ height: 300, width: '100%', zIndex: 10 }} />
      </div>
      
      <Button disabled={loading} variant="outline" className="my-3" onClick={StartStopRecording}>
        {isRecording ? (
          <h2 className="text-red-600 items-center animate-pulse flex gap-2">
            <StopCircle /> Stop Recording...
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>

      {/* Transcription Display */}
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-3">
          <div >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Answer:</h3>
              {isRecording && (
                <span className="text-sm text-red-500 animate-pulse">
                  Recording in progress...
                </span>
              )}
            </div>
            <div className="text-gray-700 min-h-[100px] whitespace-pre-wrap">
              {completeTranscript}
              {/* Show interim results in a slightly different style */}
              {interimResult && (
                <span className="text-gray-500 italic"> {interimResult}</span>
              )}
              {!completeTranscript && !interimResult && (
                <span className="text-gray-400">
                  Start speaking to see your answer appear here...
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordAnswerSection;