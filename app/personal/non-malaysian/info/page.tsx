"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

export default function PersonalNonMalaysianInfo() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    title: "Ms.",
    fullName: "Jane Doe",
    passportNumber: "A0000000",
    dobDay: "01",
    dobMonth: "January",
    dobYear: "2001",
    issuingOffice: "United Kingdom",
    nationality: "British",
    issueDate: "1 January 2021",
    expiryDate: "1 January 2031",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = () => router.push('/personal/non-malaysian/address');

  const isFormValid = 
    formData.fullName.trim() !== "" &&
    formData.passportNumber.trim() !== "" &&
    formData.issuingOffice.trim() !== "" &&
    formData.nationality.trim() !== "" &&
    formData.issueDate.trim() !== "" &&
    formData.expiryDate.trim() !== "";

  if (!mounted) return null;

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
          onClick={() => router.push('/personal/non-malaysian/passport')}
          className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Image src="/images/logo/logo-light.svg" alt="Logo" width={40} height={40} className="block dark:invert-0 invert" />
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-800 dark:text-white">DTCOB</h1>
        </div>
      </div>

      <div className="relative w-full max-w-4xl mt-10 z-10">
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            Verify Your Personal Information
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please make sure all information match your official documents.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Title</label>
                  <div className="relative">
                    <select 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                    >
                      {["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="col-span-3">
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Passport Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
                  value={formData.passportNumber} 
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })} 
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Date of Birth <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <select 
                      value={formData.dobDay} 
                      onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                    >
                      {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <select 
                      value={formData.dobMonth} 
                      onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <select 
                      value={formData.dobYear} 
                      onChange={(e) => setFormData({ ...formData, dobYear: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                    >
                      {Array.from({ length: 100 }, (_, i) => (2025 - i).toString()).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">ID Issuing Office <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
                  value={formData.issuingOffice} 
                  onChange={(e) => setFormData({ ...formData, issuingOffice: e.target.value })} 
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Nationality <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
                  value={formData.nationality} 
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Date of Issue <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
                    value={formData.issueDate} 
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Date of Expiry <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
                    value={formData.expiryDate} 
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-4 flex flex-col items-center">
              <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                By clicking continue, you confirm that the information provided is accurate and belongs to you.
              </p>
              
              <button 
                onClick={handleNavigation} 
                disabled={!isFormValid}
                className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs active:scale-[0.98] ${
                  isFormValid 
                    ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                }`}
              >
                Continue
              </button>

              <div className="mt-5 text-center">
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
                  <Link href="/support" className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="relative mt-12 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}