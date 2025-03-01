"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Settings, User, Calendar, Bell, Activity, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from "@clerk/nextjs";
import Image from 'next/image';
import GroupedInterviewList from '@/components/GroupedInterviewList';
import { Barchart } from '@/components/ui/barchart';

const Page = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [stats, setStats] = useState({
    completedInterviews: '0',
    averageScore: '0.0',
    totalHours: '12.5',
    upcomingSessions: '3'
  });
  const [isLoading, setIsLoading] = useState(true);

  const userStats = [
    { 
      label: 'Completed Interviews',
      value: stats.completedInterviews,
      icon: Calendar 
    },
    { 
      label: 'Average Score',
      value: `${stats.averageScore}/10`,
      icon: Activity 
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

      const data = await response.json();
      setInterviewList(data.interviews);
      setStats(data.stats);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 mb-12">
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
          {/* Grouped Interview List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="bg-white/5 border-0">
                <CardContent className="p-6">
                  <div className="text-white/80">Loading interviews...</div>
                </CardContent>
              </Card>
            ) : (
              <GroupedInterviewList interviews={interviewList} />
            )}
          </div>

          {/* Recent Activity */}
          <div>
          <Barchart averageScore={parseFloat(stats.averageScore)} />
        </div>
        </div>
        
      </main>
    </div>
  );
};

export default Page;