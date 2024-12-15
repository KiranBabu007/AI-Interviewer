import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";

const AboutUs = () => {
  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 relative">
      <div className="text-center">
        <h2 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans font-bold tracking-tight">
          About Us
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 mt-4">
          We are a team of experienced professionals dedicated to providing top-notch services and expert advice. Our mission is to help our clients achieve their goals by leveraging our deep industry knowledge and innovative solutions.
        </p>
      </div>
    </BackgroundLines>
  );
};

export default AboutUs;