"use client"
import AIInterview from "@/components/AddInterview";
import React, { useState } from "react";
import { Mic, Video, CheckCircle, ShieldCheck, Volume2, MessagesSquare } from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                AI-Powered Interview Practice
              </h1>
              <p className="text-gray-400 text-lg">
                Perfect your interview skills with our intelligent system
              </p>
            </div>

            <Separator className="my-6 bg-gray-800" />

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Device Permissions</CardTitle>
                <CardDescription className="text-gray-400">Enable access to your camera and microphone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => requestPermissions('audio')}
                  variant={audioPermission ? "secondary" : "outline"}
                  className="w-full justify-start gap-2 border-gray-700 hover:bg-gray-800"
                >
                  {audioPermission ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  {audioPermission ? 'Microphone Enabled' : 'Enable Microphone'}
                </Button>

                <Button
                  onClick={() => requestPermissions('video')}
                  variant={videoPermission ? "secondary" : "outline"}
                  className="w-full justify-start gap-2 border-gray-700 hover:bg-gray-800"
                >
                  {videoPermission ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  {videoPermission ? 'Camera Enabled' : 'Enable Camera'}
                </Button>
              </CardContent>
            </Card>

            <Separator className="my-6 bg-gray-800" />

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Key Features</CardTitle>
                <CardDescription className="text-gray-400">What makes our AI interviewer special</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-white mt-1" />
                  <div>
                    <h3 className="font-medium text-white">Secure Environment</h3>
                    <p className="text-sm text-gray-400">Private and confidential sessions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Volume2 className="w-5 h-5 text-white mt-1" />
                  <div>
                    <h3 className="font-medium text-white">Voice Analysis</h3>
                    <p className="text-sm text-gray-400">Real-time feedback on speech</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessagesSquare className="w-5 h-5 text-white mt-1" />
                  <div>
                    <h3 className="font-medium text-white">Smart Responses</h3>
                    <p className="text-sm text-gray-400">Adaptive conversation flow</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
              <CardHeader>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit bg-gray-800 text-white">Setup Required</Badge>
                  <CardTitle className="text-white">Interview Configuration</CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize your interview experience
                  </CardDescription>
                </div>
              </CardHeader>
              <Separator className="mb-6 bg-gray-800" />
              <CardContent>
                <AIInterview />
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Interview Guidelines</CardTitle>
                <CardDescription className="text-gray-400">Follow these tips for the best experience</CardDescription>
              </CardHeader>
              <Separator className="mb-6 bg-gray-800" />
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
                      <span className="text-gray-400">{tip}</span>
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