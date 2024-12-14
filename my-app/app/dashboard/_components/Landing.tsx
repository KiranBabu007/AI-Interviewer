"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight"
type Props = {}

const Landing = (props: Props) => {
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
      </motion.h1>
    </HeroHighlight>
  )
}

export default Landing