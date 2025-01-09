"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Settings, User, Calendar, Bell, Activity, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from 'next/image';

const InterviewItemCard = ({ interview }) => {
  const router = useRouter();
  
  const onFeedbackPress = () => {
    router.push('dashboard/interview/' + interview.mockId + "/feedback");
  };

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <h2 className="font-bold text-white">{interview?.jobPosition}</h2>
      <h2 className="text-sm text-gray-400">{interview?.jobExperience}</h2>
      <h2 className="text-xs text-gray-500">
        Created At: {interview?.createdAt}
      </h2>
      <div className="flex justify-between gap-5 mt-2">
        <Button size="sm" variant="outline" className="w-full" onClick={onFeedbackPress}>
          Feedback
        </Button>
        
      </div>
    </div>
  );
};

const Page = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const userStats = [
    { label: 'Completed Interviews', value: '24' },
    { label: 'Average Score', value: '8.5/10' },
    { label: 'Total Hours', value: '12.5' },
    { label: 'Upcoming Sessions', value: '3' }
  ];

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getInterviewList();
    }
  }, [isLoaded, isSignedIn]);

  const getInterviewList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/interviews', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }

      const interviews = await response.json();
      setInterviewList(interviews);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-black bg-white dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative">
      <div className="absolute pointer-events-none inset-0 flex dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            {user?.imageUrl ? (
              <Image 
                src={user.imageUrl} 
                alt={user.fullName || 'Profile'} 
                width="96" height="96"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-neutral-200 to-neutral-500 flex items-center justify-center">
                <User size={48} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500">
              {user?.fullName || user?.firstName || 'Welcome'}
            </h1>
            <p className="text-gray-400">
              {user?.primaryEmailAddress?.emailAddress || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {userStats.map((stat, index) => (
            <Card key={index} className="bg-white/10 border-0">
              <CardContent className="p-6">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Previous Interviews */}
          <Card className="md:col-span-2 bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Previous Mock Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-white">Loading interviews...</div>
              ) : (
                <div className="space-y-4">
                  {interviewList.map((interview, index) => (
                    <InterviewItemCard 
                      interview={interview} 
                      key={index} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/10 border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { icon: Bell, text: "Interview reminder set" },
                  { icon: FileText, text: "Resume updated" },
                  { icon: Settings, text: "Profile settings changed" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <item.icon className="w-4 h-4" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Page;