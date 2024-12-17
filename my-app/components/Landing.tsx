"use client";
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

const Landing = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    setLoading(true);
    // Simulate an async action (like API call or route change)
    setTimeout(() => {
      router.push('/dashboard');
      setLoading(false);
    }, 400);
  };

  return (
    <HeroHighlight>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [20, -5, 0] }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto font-serif"
      >
        Ace Your Career with <br />
        <Highlight className="text-black dark:text-white font-extrabold">
          AI-Driven
        </Highlight> Mock Interviews <br />
        Perfect Your {' '}
        <span className="text-violet-400">Skills</span>{' '}
        , Impress Every Recruiter
        
        <div className="justify-center mt-2 font-sans">
          <button 
            onClick={handleGetStarted}
            disabled={loading}
            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white backdrop-blur-3xl">
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </span>
          </button>
        </div>
      </motion.h1>
    </HeroHighlight>
  );
};

export default Landing;