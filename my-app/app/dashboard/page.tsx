import AIInterview from "@/components/AddInterview";
import React from "react";

const page = () => {
  return (
    <div>
      <div className="h-screen w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex flex-col ">
        <div className="absolute pointer-events-none inset-0 flex dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="py-8 px-20 justify-start flex flex-col">
          <p className="text-2xl sm:text-5xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500">
            Welcome to AI-Interviewer
          </p>
          <p className="font-bold font-sm relative z-20 text-gray-300 mt-2 opacity-80">
            Setup your Desired Interview Details
          </p>
          <div className="pt-8 grid grid-cols-1 z-20 md:grid-cols-3">
        <AIInterview />
      
      </div>
        </div>
        
      </div>
      
    </div>
  );
};

export default page;
