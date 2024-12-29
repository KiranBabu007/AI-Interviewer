'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation'; 
import { UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';

const Navbar = ({
  onAboutClick,
  onHowItWorksClick,
}: {
  onAboutClick?: () => void;
  onHowItWorksClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); 

  const isHomePage = pathname === '/Home'; 

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <svg
                  className="h-8 w-8"
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
              </Link>
              
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4 font-bold">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm transform transition-transform duration-200 hover:scale-110"
                >
                  Home
                </Link>
                {/* Conditionally show About Us and How It Works */}
                {isHomePage && (
                  <>
                    <button
                      onClick={onAboutClick}
                      className="px-3 py-2 rounded-md text-sm transform transition-transform duration-200 hover:scale-110"
                    >
                      About Us
                    </button>
                    <button
                      onClick={onHowItWorksClick}
                      className="px-3 py-2 rounded-md text-sm transform transition-transform duration-200 hover:scale-110"
                    >
                      How It Works
                    </button>
                  </>
                )}
                
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <UserButton />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
            >
              Home
            </Link>
            {/* Conditionally show About Us and How It Works */}
            {isHomePage && (
              <>
                <button
                  onClick={onAboutClick}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                >
                  About Us
                </button>
                <button
                  onClick={onHowItWorksClick}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                >
                  How It Works
                </button>
              </>
            )}
            <div className="block">
            <div className="ml-4 flex items-center md:ml-6">
              <UserButton />
            </div>
          </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
