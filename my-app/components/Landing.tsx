"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Landing = () => {
  return (
    <HeroHighlight>
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto font-serif "
      >
        Ace Your Career with <br />
        <Highlight className="text-black dark:text-white font-extrabold">
          AI-Driven
        </Highlight> Mock Interviews <br />
        Perfect Your {' '}
        <span className="text-violet-400 " >Skills</span>{' '}, Impress Every Recruiter
        <div className="justify-center mt-2 font-sans"><Link href="/dashboard">
          <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] ">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white backdrop-blur-3xl">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </button>
          </Link>
        </div>
      </motion.h1>
    </HeroHighlight>
  );
}

export default Landing;