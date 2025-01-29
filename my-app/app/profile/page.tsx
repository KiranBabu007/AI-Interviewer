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

  const getTagColor = (score) => {
    if (score >= 8) return 'bg-emerald-500/80 text-emerald-50';
    if (score >= 5) return 'bg-amber-500/80 text-amber-50';
    return 'bg-rose-500/80 text-rose-50';
  };

  const parseTags = (tags) => {
    try {
      const parsedTags = JSON.parse(tags);
      return Object.entries(parsedTags).map(([skill, score]) => ({
        skill,
        score
      }));
    } catch (error) {
      console.error("Error parsing tags:", error);
      return [];
    }
  };

  const tags = parseTags(interview?.tags || '{}');

  return (
    <Card className="bg-white/5 hover:bg-white/10 transition-colors duration-200 border-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-white">{interview?.jobPosition}</h3>
            <p className="text-sm text-gray-400">{interview?.jobExperience}</p>
            <p className="text-xs text-gray-500 mt-1">
              Created At: {interview?.createdAt}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`text-sm px-3 py-1.5 rounded-full font-medium ${getTagColor(tag.score)}`}
              >
                {tag.skill} • {tag.score}
              </span>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full hover:bg-white/10" 
            onClick={onFeedbackPress}
          >
            View Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Page = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userStats = [
    { 
      label: 'Completed Interviews',
      value: '24',
      icon: Calendar 
    },
    { 
      label: 'Average Score',
      value: '8.5/10',
      icon: Activity 
    },
    { 
      label: 'Total Hours',
      value: '12.5',
      icon: FileText 
    },
    { 
      label: 'Upcoming Sessions',
      value: '3',
      icon: Bell 
    }
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
    <div className="min-h-screen bg-black bg-grid-white/[0.2] relative">
      <div className="absolute pointer-events-none inset-0 flex bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 relative z-20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/20">
            {user?.imageUrl ? (
              <Image 
                src={user.imageUrl} 
                alt={user.fullName || 'Profile'} 
                className="object-cover"
                fill
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-neutral-700 to-neutral-900 flex items-center justify-center">
                <User size={40} className="text-white/80" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-400">
              {user?.fullName || user?.firstName || 'Welcome'}
            </h1>
            <p className="text-lg text-gray-400">
              {user?.primaryEmailAddress?.emailAddress || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {userStats.map((stat, index) => (
            <Card key={index} className="bg-white/5 hover:bg-white/10 transition-colors duration-200 border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-white/10">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Previous Interviews */}
          <Card className="lg:col-span-2 bg-white/5 border-0">
            <CardHeader className="p-6">
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                Previous Mock Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {isLoading ? (
                <div className="text-white/80">Loading interviews...</div>
              ) : (
                <div className="space-y-6">
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
          <Card className="bg-white/5 border-0">
            <CardHeader className="p-6">
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <Activity className="w-6 h-6" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                {[
                  { icon: Bell, text: "Interview reminder set for tomorrow", time: "2h ago" },
                  { icon: FileText, text: "Resume updated with new experience", time: "5h ago" },
                  { icon: Settings, text: "Profile settings changed", time: "1d ago" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 text-gray-300">
                    <div className="p-2 rounded-full bg-white/10 mt-1">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{item.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
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