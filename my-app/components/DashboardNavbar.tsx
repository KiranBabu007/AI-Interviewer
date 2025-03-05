"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X, ArrowLeft, Settings, Grid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DashboardNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-[100] font-sans w-full transition-all duration-300 ${
        scrolled 
          ? "bg-black bg-opacity-90 shadow-xl border-b border-gray-800/40" 
          : "bg-black bg-opacity-75"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/dashboard">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                    <Grid size={20} className="text-white" />
                  </div>
                  <span className="text-white font-medium">Dashboard</span>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-6">
              <div className="flex space-x-2">
                <Link href="/">
                  <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white flex items-center">
                    <ArrowLeft size={16} className="mr-1.5" />
                    <span>Back to Home</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard/settings">
              <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white flex items-center">
                <Settings size={16} className="mr-1.5" />
                <span>Settings</span>
              </div>
            </Link>
            <div className="relative">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <UserButton afterSignOutUrl="/" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md bg-gray-800 hover:bg-gray-700"
            >
              {isOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black bg-opacity-90"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/">
                <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white">
                  Back to Home
                </div>
              </Link>
              <Link href="/dashboard/settings">
                <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white">
                  Settings
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default DashboardNavbar;