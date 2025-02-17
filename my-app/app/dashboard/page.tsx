"use client"
import AIInterview from "@/components/AddInterview";
import React, { useState } from "react";
import { Mic, Video, CheckCircle, MessagesSquare, BarChart3, Globe2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const [audioPermission, setAudioPermission] = useState(false);
  const [videoPermission, setVideoPermission] = useState(false);

  const requestPermissions = async (type: 'audio' | 'video') => {
    try {
      if ((type === 'audio' && audioPermission) || (type === 'video' && videoPermission)) {
        if (type === 'audio') setAudioPermission(false);
        if (type === 'video') setVideoPermission(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: type === 'audio',
        video: type === 'video'
      });
      
      if (type === 'audio') setAudioPermission(true);
      if (type === 'video') setVideoPermission(true);
      
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error(`${type} permission error:`, err);
      if (type === 'audio') setAudioPermission(false);
      if (type === 'video') setVideoPermission(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative font-sans">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent font-display">
                AI-Powered Interview Practice
              </h1>
              <p className="text-white/60 text-lg font-normal leading-relaxed">
                Perfect your interview skills with our intelligent system
              </p>
            </div>

            <Separator className="my-6 bg-white/10" />

            <Card className="bg-black/50 border border-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-black font-semibold">Device Permissions</CardTitle>
                <CardDescription className="text-white/60 font-normal">Enable access to your camera and microphone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => requestPermissions('audio')}
                  variant={audioPermission ? "secondary" : "outline"}
                  className="w-full justify-start gap-2 border-white/10 hover:bg-white/5 hover:text-white text-black font-medium"
                >
                  {audioPermission ? (
                    <CheckCircle className="w-4 h-4 text-black" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {audioPermission ? 'Microphone Enabled' : 'Enable Microphone'}
                </Button>

                <Button
                  onClick={() => requestPermissions('video')}
                  variant={videoPermission ? "secondary" : "outline"}
                  className="w-full justify-start gap-2 border-white/10 hover:bg-white/5 hover:text-white text-black font-medium"
                >
                  {videoPermission ? (
                    <CheckCircle className="w-4 h-4 text-black" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  {videoPermission ? 'Camera Enabled' : 'Enable Camera'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border border-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white font-semibold">Key Features</CardTitle>
                <CardDescription className="text-white/60 font-normal">Advanced interview preparation tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MessagesSquare className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Personalized Questions</h3>
                    <p className="text-sm text-white/60 font-normal">Tailored questions based on HR, technical, or resume-specific requirements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Comprehensive Analysis</h3>
                    <p className="text-sm text-white/60 font-normal">Detailed reports on audio, behavior, and performance scores with actionable feedback</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe2 className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Multi-Language Support</h3>
                    <p className="text-sm text-white/60 font-normal">Practice interviews in multiple languages to match your preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-black/50 border border-white/10 backdrop-blur">
              <CardHeader>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit bg-white/5 text-white border-white/10 font-medium">Setup Required</Badge>
                  <CardTitle className="text-white font-semibold">Interview Configuration</CardTitle>
                  <CardDescription className="text-white/60 font-normal">
                    Customize your interview experience
                  </CardDescription>
                </div>
              </CardHeader>
              <Separator className="mb-6 bg-white/10" />
              <CardContent>
                <AIInterview />
              </CardContent>
            </Card>

            <Card className="bg-black/50 border border-white/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white font-semibold">Interview Guidelines</CardTitle>
                <CardDescription className="text-white/60 font-normal">Follow these tips for the best experience</CardDescription>
              </CardHeader>
              <Separator className="mb-6 bg-white/10" />
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Find a quiet environment with good lighting",
                    "Position yourself centered in the camera frame",
                    "Speak clearly and maintain virtual eye contact",
                    "Have your resume and notes readily available",
                    "Take your time to think before responding"
                  ].map((tip, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span className="text-white/60 font-normal">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;