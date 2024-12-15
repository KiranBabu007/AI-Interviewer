"use client"
import React, { useRef } from 'react'
import Landing from '../../components/Landing'
import AboutUs from '@/components/About'
import HowItWorks  from '@/components/HowItWorks'
import Navbar from '@/components/Navbar'

const page = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToAboutUs = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div>
    <Navbar onAboutClick={scrollToAboutUs} onHowItWorksClick={scrollToHowItWorks} />
    <Landing />
    <div ref={aboutRef}>
      <AboutUs />
    </div>
    <div ref={howItWorksRef}>
        <HowItWorks />
      </div>
  </div>
  )
}

export default page
