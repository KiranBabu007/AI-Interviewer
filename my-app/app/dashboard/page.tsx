"use client"
import AIInterview from "@/components/AddInterview";
import React, { useState } from "react";
import { Mic, Video, CheckCircle } from 'lucide-react';

const page = () => {
  const [audioPermission, setAudioPermission] = useState(false);
  const [videoPermission, setVideoPermission] = useState(false);

  const requestPermissions = async (type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: type === 'audio',
        video: type === 'video'
      });
      if (type === 'audio') setAudioPermission(true);
      if (type === 'video') setVideoPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error(`${type} permission denied:`, err);
    }
  };

  return (
    <div className="z-20">
      <div className="h-screen w-full dark:bg-black bg-white dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex">
        <div className="absolute pointer-events-none inset-0 flex dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        {/* Left Panel */}
        <div className="w-1/2 py-8 px-20 justify-start flex flex-col">
          <p className="text-2xl sm:text-5xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500">
            Welcome to AI-Interviewer
          </p>
          <p className="font-bold font-sm relative z-20 text-gray-300 mt-2 opacity-80">
            Setup your Desired Interview Details
          </p>
          <div className="pt-8 grid grid-cols-1 z-20">
            <AIInterview />
          </div>
        </div>

        {/* Right Panel - Instructions */}
        <div className="w-1/2 py-8 px-20 relative z-20 text-white">
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
          
          {/* Permissions */}
          <div className="mb-8">
            <h3 className="text-xl mb-4">Enable Permissions</h3>
            <div className="space-y-4">
              <button
                onClick={() => requestPermissions('audio')}
                className={`flex items-center space-x-2 p-2 text-black rounded ${
                  audioPermission ? 'bg-green-400' : 'bg-white hover:bg-gray-100'
                }`}
              >
                {audioPermission ? <CheckCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{audioPermission ? 'Microphone Enabled' : 'Enable Microphone'}</span>
              </button>
              
              <button
                onClick={() => requestPermissions('video')}
                className={`flex items-center text-black space-x-2 p-2 rounded ${
                  videoPermission ? 'bg-green-400' : 'bg-white hover:bg-gray-100'
                }`}
              >
                {videoPermission ? <CheckCircle className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                <span>{videoPermission ? 'Camera Enabled' : 'Enable Camera'}</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 bg-white p-8 rounded-lg bg-opacity-20">
            <h3 className="text-xl mb-4">Interview Guidelines</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Ensure you're in a quiet environment</li>
              <li>Position yourself in front of the camera</li>
              <li>Speak clearly and maintain eye contact</li>
              <li>Have your resume ready for reference</li>
              <li>The interview will last approximately 15-20 minutes</li>
              <li>You can pause or end the interview at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
