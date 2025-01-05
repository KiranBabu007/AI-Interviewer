"use client"
import QuestionsSection from "@/components/QuestionsSection";
import RecordAnswerSection from "@/components/RecordAnswerSection";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import React from "react";
import Webcam from "react-webcam";

interface InterviewData {
  mockId?: string;
  createdBy?: string;
}

interface MockInterviewQuestion {
  question: string;
}

const Page = () => {
  const [interviewDetails, setInterviewDetails] = useState<InterviewData | null>(null);
  const [questions, setQuestions] = useState<MockInterviewQuestion[] | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const interviewId = useParams().interviewid;
  const router = useRouter();
  
  const webcamRef = useRef<Webcam>(null);
  const snapshotIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureSnapshot = useCallback(() => {
    if (webcamRef.current && isWebcamReady) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && imageSrc.includes('base64')) {
        setSnapshots(prev => [...prev, imageSrc]);
      } else {
        console.log('Invalid snapshot - waiting for webcam to stabilize');
      }
    }
  }, [isWebcamReady]);

  const startSnapshotCapture = useCallback(() => {
    if (!isWebcamReady) {
      console.log('Webcam not ready yet');
      return;
    }
    setSnapshots([]);
    snapshotIntervalRef.current = setInterval(captureSnapshot, 5000);
  }, [captureSnapshot, isWebcamReady]);

  const stopSnapshotCapture = useCallback(() => {
    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current);
    }
  }, []);

  const base64ToBlob = (base64: string) => {
    try {
      if (!base64.includes('base64,')) {
        throw new Error('Invalid base64 string format');
      }

      const parts = base64.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
    } catch (error) {
      console.error('Error in base64ToBlob:', error);
      throw error;
    }
  };

  const analyzeBehavior = async () => {
    try {
      const formData = new FormData();
      const validSnapshots = snapshots.filter(snapshot => snapshot.includes('base64'));
      
      if (validSnapshots.length === 0) {
        console.warn('No valid snapshots to analyze');
        throw new Error('No valid snapshots available');
      }

      validSnapshots.forEach((snapshot, index) => {
        try {
          const imageBlob = base64ToBlob(snapshot);
          formData.append(`image_${index}`, imageBlob);
          formData.append('mockId', interviewDetails?.mockId || '');
          formData.append('user',interviewDetails?.createdBy || '');
        } catch (error) {
          console.error(`Failed to process snapshot ${index}:`, error);
        }
      });

      
      const response = await fetch('/api/analyze-behavior', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze behavior');
      }

      const data = await response.json();
      console.log('Behavior Analysis Results:', data.analysis);
      router.push(`/dashboard/interview/${interviewDetails?.mockId}/feedback`);
    } catch (error) {
      console.error('Error in analyzeBehavior:', error);
      setIsAnalyzing(false);
      console.log('Navigating to feedback page despite error');
      router.push(`/dashboard/interview/${interviewDetails?.mockId}/feedback`);
    }
  };

  const handleEndInterview = async () => {
    setIsAnalyzing(true);
    stopSnapshotCapture();
    await analyzeBehavior();
  };

  const GetInterviewDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview details');
      }

      const data = await response.json();
      setInterviewDetails(data.interviewData);
      setQuestions(data.mockInterviewQuestions);
    } catch (error: unknown) {
      console.error('Error fetching interview details:', error);
    }
  }, [interviewId]);

  useEffect(() => {
    GetInterviewDetails();
  }, [GetInterviewDetails,activeQuestionIndex]);

  // Only initialize the snapshot capture when webcam is ready
  useEffect(() => {
    if (isWebcamReady) {
      startSnapshotCapture();
    }
    return () => stopSnapshotCapture();
  }, [isWebcamReady, startSnapshotCapture, stopSnapshotCapture]);

  return (
    <div className="relative h-screen w-full bg-neutral-950 flex flex-col overflow-hidden">
      <BackgroundBeams className="absolute inset-0 z-0" />
      
      <div className="relative flex-grow overflow-auto py-8 z-10">
        <div className="container mx-auto px-4 h-full">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 h-full'>
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl h-full">
              <QuestionsSection
                mockInterviewQuestion={questions || []} 
                activeQuestionIndex={activeQuestionIndex}
              />
              <div className="opacity-0 absolute"> {/* Use opacity-0 instead of hidden */}
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={640}
                  height={480}
                  mirrored={true}
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user"
                  }}
                  onUserMedia={() => {
                    console.log('Webcam ready');
                    setIsWebcamReady(true);
                  }}
                  onUserMediaError={(err) => {
                    console.error('Webcam error:', err);
                    setIsWebcamReady(false);
                  }}
                />
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 shadow-xl p-8 flex flex-col space-y-6">
              <RecordAnswerSection
                mockInterviewQuestion={questions || []} 
                activeQuestionIndex={activeQuestionIndex} 
                interviewData={interviewDetails}
              />
              <div className='mt-auto flex justify-end gap-6'>
                {questions && activeQuestionIndex !== 1 && (
                  <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
                    Next Question
                  </Button>
                )}
                {questions && activeQuestionIndex === 1 && (
                  <Button 
                    onClick={handleEndInterview}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing...
                      </div>
                    ) : (
                      "End Interview"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;