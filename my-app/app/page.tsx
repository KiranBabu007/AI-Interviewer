"use client"
import React, { useRef } from 'react'
import Landing from '@/components/Landing'
import AboutUs from '@/components/About'
import HowItWorks  from '@/components/HowItWorks'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const Page = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const activeSection = 'home'; // or any logic to determine the active section

  const scrollToAboutUs = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="overflow-auto scrollbar-hide">
      <Navbar 
        onAboutClick={scrollToAboutUs} 
        onHowItWorksClick={scrollToHowItWorks} 
        activeSection={activeSection}
      />
      {/* Add a spacer div to push content down */}
      <div className="h-16"></div>
      <div ref={homeRef}>
        <Landing />
      </div>
      <div ref={aboutRef}>
        <AboutUs />
      </div>
      <div ref={howItWorksRef}>
        <HowItWorks />
      </div>
      <div><Footer/></div>
    </div>
  )
}

export default Page
