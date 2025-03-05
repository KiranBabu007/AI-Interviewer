import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { AnimatedTooltip } from "./ui/animated-tooltip";
import sidharthImage from "@/public/sid.webp";
import indrajithImage from "@/public/indra.webp";
import kiranImage from "@/public/kiran.webp";
const AboutUs = () => {

const people = [
  {
    id: 1,
    name: "Sidharth Manikuttan",
    designation: "Software Engineer",
    image: sidharthImage.src
  },{
    id: 2,
    name: "Indrajith S Nair",
    designation: "Software Engineer",
    image:indrajithImage.src
  },
  {
    id: 3,
    name: "Kiran Babu",
    designation: "Software Engineer",
    image:kiranImage.src
  },
];

  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 relative">
      <div className="text-center">
      <h2 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-3xl md:text-4xl lg:text-7xl font-sans font-bold tracking-tight">
          About Us
        </h2>
        <p className="max-w-2xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 mt-8 leading-relaxed">
          We&apos;re building an innovative AI-powered interview preparation platform that helps candidates practice and perfect their interview skills. Our advanced AI technology provides real-time feedback, personalized questions, and comprehensive performance analysis.
        </p>

        

        <div className="mt-10 flex flex-row items-center justify-center mb-10 w-full">
      <AnimatedTooltip items={people} />
    </div>

      </div>
    </BackgroundLines>
  );
};

export default AboutUs;