
import React from "react";

import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import Image from "next/image";

const content = [
  {
    title: "Choose Your Interview Type",
    description: 
      "Start by selecting between Technical or HR interview modes. For technical interviews, specify your role (e.g., Developer, Designer) and experience level. HR interviews focus on soft skills and general competencies.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--purple-500),var(--blue-500))] flex items-center justify-center text-white">
        <Image src="/intselect.png" width={400} height={400} alt="" />
      </div>
    ),
  },
  {
    title: "Setup Your Environment",
    description:
      "Enable your camera and microphone permissions. These are essential for a realistic interview experience, allowing our AI to analyze both your verbal responses and non-verbal cues for comprehensive feedback.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--blue-500),var(--cyan-500))] flex items-center justify-center text-white">
        <Image src="/cam.png" width={400} height={400} alt=""/>
      </div>
    ),
  },
  {
    title: "Interactive AI Interview",
    description:
      "Engage in a dynamic conversation with our AI interviewer. Answer questions naturally through speech, just like in a real interview. The AI adapts its questions based on your responses, creating a personalized interview experience.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--emerald-500),var(--green-500))] flex items-center justify-center text-white">
        <Image src="/question.png" width={400} height={400} alt=""/>
      </div>
    ),
  },
  {
    title: "Real-time Recording & Analysis",
    description:
      "Your responses are recorded and analyzed in real-time. Our AI evaluates your communication skills, technical knowledge, and professional competencies throughout the interview session.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
        <Image src="/webcam.png" width={400} height={400} alt="" className="rounded-lg"/>
      </div>
    ),
  },
  {
    title: "Comprehensive Performance Report",
    description:
      "Receive a detailed evaluation report immediately after your interview. Get insights on your strengths, areas for improvement, and specific recommendations to enhance your interview performance.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--red-500),var(--pink-500))] flex items-center justify-center text-white">
        <Image src="/report2.png" width={400} height={400} alt="" className="rounded-lg"/>
      </div>
    ),
  }
];
export default function HowItWorks() {
  return (
    <div className="pt-10 bg-black">
      <StickyScroll content={content} />
    </div>
  );
}

