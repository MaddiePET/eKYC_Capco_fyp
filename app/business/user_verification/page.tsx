"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

export default function BusinessUserVerification() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new' | null>(null);

  const handleNext = () => {
    if (selectedOption === 'existing') {
      router.push('/login');
    } else if (selectedOption === 'new') {
      router.push('/business/malaysian/mykad');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-full leading-none z-0 pointer-events-none opacity-20">
        <svg className="relative block w-full h-24 sm:h-32 md:h-48 lg:h-64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path className="fill-[#3D405B]/80" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,192C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          <path className="fill-[#3D405B]" d="M0,128L48,138.7C96,149,192,171,288,176C384,181,480,171,576,144C672,117,768,75,864,69.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full leading-none z-0 pointer-events-none opacity-20">
        <svg className="relative block w-full h-24 sm:h-32 md:h-48 lg:h-64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path className="fill-[#F0CA8E]" d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
        </svg>
      </div>

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Home
        </button>
        <div className="flex items-center gap-2">
          <Image src="/images/logo/logo-light.svg" alt="Logo" width={40} height={40} className="block dark:invert-0 invert" />
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-800 dark:text-white">DTCOB</h1>
        </div>
      </div>

      <div className="relative w-full max-w-2xl z-10">
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            Business Account User Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please verify your identity to proceed with account creation or login.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            onClick={() => setSelectedOption('existing')}
            className={`relative cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-sm ${
              selectedOption === 'existing'
                ? 'border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40'
                : 'border-gray-200 bg-white hover:border-[#F0CA8E] dark:bg-gray-900/90 dark:border-[#5c6185] dark:hover:border-[#F0CA8E]'
            }`}
          >
            {selectedOption === 'existing' && (
              <div className="absolute top-3 right-3 bg-[#F0CA8E] text-white p-1 rounded-full shadow-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={`mb-4 p-3 rounded-xl transition-colors ${
              selectedOption === 'existing' ? 'bg-[#F0CA8E] text-[#3D405B] dark:text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-[#F0CA8E]/10 group-hover:text-[#F0CA8E] dark:bg-gray-800'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold mb-2 transition-colors ${selectedOption === 'existing' ? 'text-[#3D405B] dark:text-white' : 'text-[#3D405B] dark:text-white'}`}>
              Existing User
            </h3>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">Log in to your existing business account</p>
          </div>

          <div
            onClick={() => setSelectedOption('new')}
            className={`relative cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center group backdrop-blur-sm ${
              selectedOption === 'new'
                ? 'border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40'
                : 'border-gray-200 bg-white hover:border-[#F0CA8E] dark:bg-gray-900/90 dark:border-[#5c6185] dark:hover:border-[#F0CA8E]'
            }`}
          >
            {selectedOption === 'new' && (
              <div className="absolute top-3 right-3 bg-[#F0CA8E] text-white p-1 rounded-full shadow-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={`mb-4 p-3 rounded-xl transition-colors ${
              selectedOption === 'new' ? 'bg-[#F0CA8E] text-[#3D405B] dark:text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-[#F0CA8E]/10 group-hover:text-[#F0CA8E] dark:bg-gray-800'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold mb-2 transition-colors ${selectedOption === 'new' ? 'text-[#3D405B] dark:text-white' : 'text-[#3D405B] dark:text-white'}`}>
              New User
            </h3>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">Create a new business banking account</p>
          </div>
        </div>

        <div className="mt-6 w-full max-w-md mx-auto relative z-10">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs relative z-10 ${
              selectedOption
                ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
            }`}
          >
            Continue
          </button>

          <div className="mt-5 text-center">
            <p className="text-sm font-normal">
              <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
              <Link 
                href="/support" 
                className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}