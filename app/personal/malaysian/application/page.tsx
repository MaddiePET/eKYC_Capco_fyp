"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

const BRANCHES: Branch[] = [
  { id: "subang-jaya", name: "Subang Jaya Branch", lat: 3.0738, lng: 101.5883, address: "Jalan SS 15, Subang Jaya" },
  { id: "kuala-lumpur", name: "KL Main Branch", lat: 3.1390, lng: 101.6869, address: "Bukit Bintang, Kuala Lumpur" },
  { id: "petaling-jaya", name: "Petaling Jaya Branch", lat: 3.1073, lng: 101.6067, address: "Section 00, Petaling Jaya" },
];

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111;
};

const CustomSelect = ({ label, value, onChange, options, required = false }: CustomSelectProps) => (
  <div className="relative">
    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select 
        required={required} 
        className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
        value={value} 
        onChange={onChange}
      >
        <option value="">Please Select</option>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export default function PersonalMalaysianApplication() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);

  // Controls loading state while saving savings account data
  const [isSubmitting, setIsSubmitting] = useState(false);

 // Stores any error message if submission fails
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    occupation: "",
    incomeRange: "",
    employmentType: "",
    sourceOfIncome: "",
    isOfAge: null as boolean | null,
  });
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [preferredBranch, setPreferredBranch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRequestLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setUserAddress(data.display_name.split(',').slice(0, 3).join(','));
        } catch (e) {
          setUserAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setIsLocating(false);
      },
      () => {
        alert("Location access denied.");
        setIsLocating(false);
      }
    );
  };

  const sortedBranches = [...BRANCHES].sort((a, b) => {
    if (!userLocation) return 0;
    const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return distA - distB;
  });

 // Handle Step 1 submission for personal account application
 // Purpose:
 // 1. Save occupation and income-related details into the Savings_account table
 // 2. Move to the next screen only if the database insert succeeds
 const handleNextStep = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
   setIsSubmitting(true);
   setSubmitError(null);

    const response = await fetch("/api/application/savings-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: 1, // temporary placeholder
        occupation: formData.occupation,
        monthly_income: formData.incomeRange,
        income_source: formData.sourceOfIncome,
        employment_type: formData.employmentType,
        is18: formData.isOfAge,
        add_id: 1, // temporary placeholder
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to save savings account.");
    }

    console.log("Savings account saved:", result.data);

    // Move to next step only after successful save
    setStep(2);
  } catch (error: any) {
    console.error("Savings account submission error:", error);
    setSubmitError(error.message || "Failed to save savings account.");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/personal/malaysian/account_creation");
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.push("/personal/malaysian/face_verification");
    }
  };

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
          onClick={handleBack}
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

      <div className="relative w-full max-w-2xl z-10">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">Personal Account Application</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please provide your employment details to proceed with the registration.</p>
            </div>
            
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <CustomSelect 
                  label="Occupation" 
                  required 
                  value={formData.occupation} 
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  options={[
                    {value: "accounting", label: "Accounting"},
                    {value: "student", label: "Student"},
                    {value: "engineer", label: "Engineer"}
                  ]}
                />
                <CustomSelect 
                  label="Monthly Income Range" 
                  required 
                  value={formData.incomeRange} 
                  onChange={(e) => setFormData({...formData, incomeRange: e.target.value})}
                  options={[
                    {value: "1-1000", label: "RM1 - RM1,000"},
                    {value: "1001-3000", label: "RM1,001 - RM3,000"}
                  ]}
                />
                <CustomSelect 
                  label="Employment Type" 
                  required 
                  value={formData.employmentType} 
                  onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                  options={[
                    {value: "government", label: "Government"},
                    {value: "private", label: "Private"}
                  ]}
                />
                <CustomSelect 
                  label="Source of Income" 
                  required 
                  value={formData.sourceOfIncome} 
                  onChange={(e) => setFormData({...formData, sourceOfIncome: e.target.value})}
                  options={[
                    {value: "salary", label: "Salary"}
                  ]}
                />
              </div>

              <div className="pt-4 text-center">
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Are you at least 18 years old? <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center gap-8 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-white">
                        <input type="radio" name="age" checked={formData.isOfAge === true} className="w-4 h-4 accent-[#3D405B]" onChange={() => setFormData({...formData, isOfAge: true})}/> Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-white">
                        <input type="radio" name="age" checked={formData.isOfAge === false} className="w-4 h-4 accent-[#3D405B]" onChange={() => setFormData({...formData, isOfAge: false})}/> No
                    </label>
                </div>
              </div>
               {submitError &&(
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600-sm text-center">
                  {submitError}
                </div>
               )}
              <div className="pt-4 flex flex-col items-center">
                <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                  By clicking continue, you confirm that the information provided is accurate and belongs to you.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    type="button" 
                    onClick={() => router.push("/personal_malaysian_face_verification")} 
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    Cancel
                  </button>

                  <button 
                    type="submit" 
                    disabled={!formData.isOfAge || isSubmitting} 
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 shadow-theme-xs"
                  >
                    {isSubmitting ? "Saving..." : "Continue"}
                  </button>
                </div>
                <div className="mt-5 text-center">
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
                    <Link href="/support" className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      Contact Support
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">Select Your Preferred Branch</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a branch based on your current location.</p>
            </div>

            <div className="mb-8">
              {!userLocation ? (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-center dark:bg-blue-900/30 dark:border-blue-500/50">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-blue-800 dark:text-blue-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Enable Location Services</h3>
                  <p className="text-xs text-blue-800 dark:text-blue-200/70 mb-3">To suggest the nearest branches to you.</p>
                  <button onClick={handleRequestLocation} disabled={isLocating} className="text-sm font-bold text-blue-700 hover:text-blue-800 dark:text-blue-400">
                    {isLocating ? "Locating..." : "Use My Current Location"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-[#3D405B]/5 border-2 border-[#3D405B]/20 rounded-xl">
                   <div className="flex-shrink-0 w-8 h-8 bg-[#3D405B] text-white rounded-lg flex items-center justify-center">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <p className="text-xs text-gray-500 dark:text-gray-400">Current Location</p>
                     <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{userAddress}</p>
                   </div>
                   <button onClick={() => setUserLocation(null)} className="text-xs font-bold text-[#3D405B] dark:text-blue-400">Change</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                Available Branches <span className="text-red-500">*</span>
              </label>
              {sortedBranches.map((branch) => {
                const distance = userLocation ? getDistance(userLocation.lat, userLocation.lng, branch.lat, branch.lng).toFixed(1) : null;
                const isSelected = preferredBranch === branch.id;

                return (
                  <div 
                    key={branch.id}
                    onClick={() => setPreferredBranch(branch.id)}
                    className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      isSelected 
                      ? 'border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40' 
                      : 'border-gray-200 bg-white hover:border-[#F0CA8E] dark:bg-gray-900/90 dark:border-[#5c6185] dark:hover:border-[#F0CA8E]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[#F0CA8E] text-[#3D405B] dark:text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white">{branch.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{branch.address}</p>
                    </div>
                    {distance && <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-md">{distance} km</span>}
                  </div>
                );
              })}
            </div>

            <div className="pt-10 flex flex-col items-center">
              <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                By clicking continue, you confirm that all selected information is correct.
              </p>
              <form onSubmit={handleFinalSubmit} className="w-full">
                <button 
                  type="submit" 
                  disabled={!preferredBranch} 
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 shadow-theme-xs"
                >
                  Continue
                </button>
              </form>
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
        )}
      </div>

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}