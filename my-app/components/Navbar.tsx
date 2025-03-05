"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X, Home, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define available sections for typing
type ActiveSection = "home" | "about" | "howItWorks" | null;

const Navbar = ({
  onAboutClick,
  onHowItWorksClick,
  activeSection = "home", // Add this prop to receive the active section
}: {
  onAboutClick?: () => void;
  onHowItWorksClick?: () => void;
  activeSection?: ActiveSection;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname === "/";

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
          ? "bg-black bg-opacity-85 backdrop-blur-md shadow-xl border-b border-gray-800/40" 
          : "bg-black bg-opacity-60 backdrop-blur-sm"
      }`}
      style={{ backgroundColor: "#111" }} // Fallback background color
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0 z-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/">
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg opacity-70"></div>
                  <svg
                    className="absolute inset-0 h-10 w-10 p-1.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:block ml-6">
              <div className="flex items-center space-x-1">
                <NavLink 
                  href="/" 
                  isActive={activeSection === "home"}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <Home size={16} className="mr-1.5" />
                  <span>Home</span>
                </NavLink>
                
                {isHomePage && (
                  <>
                    <NavButton 
                      onClick={onAboutClick}
                      isActive={activeSection === "about"}
                    >
                      <Info size={16} className="mr-1.5" />
                      <span>About Us</span>
                    </NavButton>
                    
                    <NavButton 
                      onClick={onHowItWorksClick}
                      isActive={activeSection === "howItWorks"}
                    >
                      <HelpCircle size={16} className="mr-1.5" />
                      <span>How It Works</span>
                    </NavButton>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Right Section - User */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative p-0.5"> {/* Added padding for larger appearance */}
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9" // Increased from default size
                    }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <div className="mr-3"> {/* Increased margin */}
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8" // Increased from default size
                  }
                }}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 focus:outline-none"
              aria-label="Open main menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-black bg-opacity-90 backdrop-blur-md"
            style={{ backgroundColor: "#111" }}
          >
            <div className="px-2 py-4 space-y-2">
              <MobileNavLink href="/" isActive={pathname === "/"}>
                <Home size={18} className="mr-2" />
                <span>Home</span>
              </MobileNavLink>
              
              {isHomePage && (
                <>
                  <MobileNavButton onClick={onAboutClick}>
                    <Info size={18} className="mr-2" />
                    <span>About Us</span>
                  </MobileNavButton>
                  
                  <MobileNavButton onClick={onHowItWorksClick}>
                    <HelpCircle size={18} className="mr-2" />
                    <span>How It Works</span>
                  </MobileNavButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading progress bar */}
      <div className={`h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 transition-all duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
    </motion.nav>
  );
};

// Reusable Navigation Components
const NavLink = ({ 
  href, 
  isActive, 
  children,
  onClick
}: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Link href={href} className="relative" onClick={onClick}>
      <div className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
        isActive 
          ? 'text-white' // Removed background gradient
          : 'text-gray-300 hover:bg-gray-800/30 hover:text-white'
      }`}>
        {children}
      </div>
      
    </Link>
  </motion.div>
);

const NavButton = ({ 
  onClick, 
  children,
  isActive
}: { 
  onClick?: () => void; 
  children: React.ReactNode;
  isActive?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`}
  >
    {children}
  </motion.button>
);

const MobileNavLink = ({ 
  href, 
  isActive, 
  children 
}: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode;
}) => (
  <Link href={href}>
    <div 
      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
        isActive 
          ? 'bg-gradient-to-r from-blue-800 to-purple-800 text-white' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {children}
    </div>
  </Link>
);

const MobileNavButton = ({ 
  onClick, 
  children 
}: { 
  onClick?: () => void; 
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
  >
    {children}
  </button>
);

export default Navbar;