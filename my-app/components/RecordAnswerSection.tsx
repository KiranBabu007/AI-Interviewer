"use client";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface RecordAnswerSectionProps {
  mockInterviewQuestion: { question: string }[];
  activeQuestionIndex: number;
  interviewData: any;
}

const RecordAnswerSection: React.FC<RecordAnswerSectionProps> = ({ mockInterviewQuestion, activeQuestionIndex, interviewData }) => {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const {
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  useEffect(() => {
    results.map((result) => {
      if (typeof result !== 'string' && result.transcript) {
        setUserAnswer((prevAns) => prevAns + result.transcript);
      }
    });
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [userAnswer]);

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

  return (
    <div className='flex flex-col justify-center items-center '>
      <div className='flex flex-col justify-center items-center rounded-lg bg-black mt-20'>
        <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt='webcam image' />
        <Webcam mirrored={true} style={{ height: 300, width: '100%', zIndex: 10 }} />
      </div>
      
      <Button disabled={loading} variant="outline" className="my-10" onClick={StartStopRecording}>
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
    </div>
  );
};

export default RecordAnswerSection;