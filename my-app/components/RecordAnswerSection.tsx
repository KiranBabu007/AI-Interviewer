"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle, Play, Pause } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface InterviewData {
  mockId?: string;
  jobPosition?: string;
}

interface RecordAnswerSectionProps {
  mockInterviewQuestion: { question: string }[];
  activeQuestionIndex: number;
  interviewData: InterviewData | null;
}

const RecordAnswerSection: React.FC<RecordAnswerSectionProps> = ({ 
  mockInterviewQuestion, 
  activeQuestionIndex, 
  interviewData 
}) => {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

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

  const completeTranscript = results.map(result => 
    typeof result === 'string' ? result : result.transcript
  ).join(' ');

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Send audio for analysis
        await analyzeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('question', mockInterviewQuestion[activeQuestionIndex].question);
      formData.append('mockid', interviewData?.mockId || '');
      formData.append('user', user?.primaryEmailAddress?.emailAddress || '');
      
      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze audio');
      }
      
    } catch (error) {
      console.error('Error analyzing audio:', error);
    } finally {
      setResults([]);
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    
    if (isPlaying) {
      audioElementRef.current.pause();
    } else {
      audioElementRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const UpdateUserAnswer = useCallback(async () => {
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
  }, [
    mockInterviewQuestion, 
    activeQuestionIndex, 
    interviewData, 
    userAnswer, 
    user?.primaryEmailAddress?.emailAddress, 
    setResults
  ]);

  useEffect(() => {
    setUserAnswer(completeTranscript);
  }, [completeTranscript]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [isRecording, userAnswer, UpdateUserAnswer]);

  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
      stopAudioRecording();
    } else {
      startSpeechToText();
      startAudioRecording();
    }
  };

  useEffect(() => {
    const audioElement = audioElementRef.current;
    if (audioElement) {
      const handleEnded = () => setIsPlaying(false);
      audioElement.addEventListener('ended', handleEnded);
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

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
      <div className='flex flex-col justify-center items-center rounded-lg bg-black'>
        <Image src={'/webcam.png'} width={200} height={200} className='absolute' alt='webcam image' />
        <Webcam mirrored={true} style={{ height: 300, width: '100%', zIndex: 10 }} />
      </div>
      
      <div className="flex gap-2 my-3">
        <Button disabled={loading} variant="outline" onClick={StartStopRecording}>
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

        {audioURL && (
          <Button 
            variant="outline" 
            onClick={togglePlayback}
            className="flex gap-2 items-center"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'} Recording
          </Button>
        )}
      </div>

      {audioURL && (
        <audio ref={audioElementRef} src={audioURL} className="hidden" />
      )}

      <Card className="w-full max-w-2xl">
        <CardContent className="pt-3">
          <div>
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