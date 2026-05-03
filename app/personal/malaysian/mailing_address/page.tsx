"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

export default function PersonalMalaysianMailingAddress() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mailingData, setMailingData] = useState({
    permanentAddress: "Jalan SS15/1H, 40000 Subang Jaya, Selangor, Malaysia",
    streetAddress: "Jalan SS15/1H",
    postal: "40000",
    city: "Subang Jaya",
    state: "Selangor",
    country: "Malaysia",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

const handleNavigation = async () => {
  try {
    setIsSubmitting(true);
    setSubmitError(null);

    localStorage.setItem(
      "mailingAddress",
      JSON.stringify({
        add_type: "Mailing",
        add_1: mailingData.streetAddress,
        add_2: mailingData.city,
        postcode: mailingData.postal,
        state: mailingData.state,
        country: mailingData.country,
      })
    );

    router.push("/personal/malaysian/application");
  } catch (error: any) {
    console.error("Mailing address save error:", error);
    setSubmitError(error.message || "Failed to save mailing address.");
  } finally {
    setIsSubmitting(false);
  }
};
  const isFormValid = 
    mailingData.streetAddress.trim() !== "" &&
    mailingData.postal.trim() !== "" &&
    mailingData.city.trim() !== "" &&
    mailingData.state.trim() !== "" &&
    mailingData.country.trim() !== "";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-full leading-none z-0 pointer-events-none opacity-20">
        <svg 
          className="relative block w-full h-24 sm:h-32 md:h-48 lg:h-64" 
          preserveAspectRatio="none" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            className="fill-[#3D405B]/80" 
            d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,192C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />

          <path 
            className="fill-[#3D405B]" 
            d="M0,128L48,138.7C96,149,192,171,288,176C384,181,480,171,576,144C672,117,768,75,864,69.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </svg>
      </div>

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
        <button
          type="button"
          onClick={() => router.push("/personal/malaysian/info")}
          className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          
          Back
        </button>

        <div className="flex items-center gap-2">
          <Image 
            src="/images/logo/logo-light.svg" 
            alt="Logo" 
            width={40} 
            height={40} 
            className="block dark:invert-0 invert" 
          />

          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-800 dark:text-white">
            DTCOB
          </h1>
        </div>
      </div>

      <div className="relative w-full max-w-md animate-in fade-in duration-500 z-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md whitespace-nowrap">
            Verify Your Mailing Address
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            If your mailing address is different from the registered address on your MyKad below, please update it.
          </p>

          <div className="relative p-4 mb-8 rounded-2xl border-2 transition-all duration-300 text-center backdrop-blur-sm border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 text-center">
              {mailingData.permanentAddress}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Registered Address
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                Street Address 
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                value={mailingData.streetAddress}
                onChange={(e) => setMailingData({ ...mailingData, streetAddress: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Postal Code 
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                  value={mailingData.postal}
                  onChange={(e) => setMailingData({ ...mailingData, postal: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  City 
                  <span className="text-red-500">
                    *
                  </span>
                </label>
                
                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                  value={mailingData.city}
                  onChange={(e) => setMailingData({ ...mailingData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  State 
                  <span className="text-red-500">
                    *
                  </span>
                </label>
                
                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                  value={mailingData.state}
                  onChange={(e) => setMailingData({ ...mailingData, state: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Country 
                  <span className="text-red-500">
                    *
                  </span>
                </label>
                
                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                  value={mailingData.country}
                  onChange={(e) => setMailingData({ ...mailingData, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By clicking continue, you confirm that the information provided is accurate and belongs to you.
            </p>

            <button 
              onClick={() => router.push("/personal/malaysian/face_verification")} 
              disabled={!isFormValid}
              className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs relative z-10 active:scale-[0.98] ${
                isFormValid 
                  ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
              }`}
            >
              Continue
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm font-normal">
            <span className="text-gray-500 dark:text-gray-400">
              Having trouble? 
            </span>

            <Link 
              href="/support" 
              className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}