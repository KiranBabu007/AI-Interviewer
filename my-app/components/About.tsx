import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { AnimatedTooltip } from "./ui/animated-tooltip";

const AboutUs = () => {

const people = [
  {
    id: 1,
    name: "Kiran Babu",
    designation: "Software Engineer",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQHzwPub7LODng/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1732730797258?e=1740009600&v=beta&t=PL-DrRTl5X4BPLZ-M3r9b9zAtfiZjEHLcEG6BpW8ZOE",
  },
  {
    id: 2,
    name: "Indrajith S Nair",
    designation: "Software Engineer",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQHwPX97jgSJpA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1689488177062?e=1740009600&v=beta&t=ZI4HBMRlmahYgZZuWCPhmESL8O_uLsp7_zpE2y4KlJw",
  },
  {
    id: 3,
    name: "Sidharth Manikuttan",
    designation: "Software Engineer",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQHYc-kTlfUOMA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1721754297801?e=1740009600&v=beta&t=SorNbDX0Oh1CeeAFiWQIaGVgFy3SYPqIG8vVXgORk5E",
  },


];

  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 relative">
      <div className="text-center">
      <h2 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans font-bold tracking-tight">
          About Us
        </h2>
        <p className="max-w-2xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 mt-8 leading-relaxed">
          We're building an innovative AI-powered interview preparation platform that helps candidates practice and perfect their interview skills. Our advanced AI technology provides real-time feedback, personalized questions, and comprehensive performance analysis.
        </p>

        

        <div className="mt-10 flex flex-row items-center justify-center mb-10 w-full">
      <AnimatedTooltip items={people} />
    </div>

      </div>
    </BackgroundLines>
  );
};

export default AboutUs;