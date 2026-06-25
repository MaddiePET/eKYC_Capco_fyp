"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import { BRANCHES } from "@/data/branches";
import { 
  malaysian_occupations, 
  malaysian_employment_types, 
  malaysian_source_of_income, 
  income_range 
} from "@/data/application";

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111;
};

const CustomSelect = ({ label, value, onChange, options, required = false }: CustomSelectProps) => (
  <div className="relative">
    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
      {label} 
      {required && <span className="text-red-500">*</span>}
    </label>

    <div className="relative">
      <select 
        required={required} 
        className={`w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none ${
          !value ? "!text-gray-400" : ""
        }`} 
        value={value} 
        onChange={onChange}
      >
        <option value="" disabled className="text-gray-400">
          Please Select
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-gray-800 dark:text-white">
            {opt.label}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <svg 
          className="w-4 h-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>
    </div>
  </div>
);

export default function SavingsMalaysianApplication() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    occupation: "",
    incomeRange: "",
    employmentType: "",
    sourceOfIncome: "",
    isOfAge: null as boolean | null,
    userAge: null as number | null,
  });
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [preferredBranch, setPreferredBranch] = useState("");

  const isFormValid = 
    formData.occupation !== "" &&
    formData.incomeRange !== "" &&
    formData.employmentType !== "" &&
    formData.sourceOfIncome !== "" &&
    formData.isOfAge === true;

  useEffect(() => {
    setMounted(true);

    try {
      const personalInfoStr = localStorage.getItem("personalInfo");
      
      if (personalInfoStr) {
        const personalInfo = JSON.parse(personalInfoStr);

        if (personalInfo.dob) {
          const dobDate = new Date(personalInfo.dob);
          const today = new Date();
          let age = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            age--;
          }
          
          if (age >= 18) {
            setFormData(prev => ({ ...prev, isOfAge: true, userAge: age }));
          } else {
            setFormData(prev => ({ ...prev, isOfAge: false, userAge: age }));
          }
        }
      }
    } catch (error) {
      console.error("Error parsing personalInfo for age verification:", error);
    }
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

  const handleNext = () => {
    try {
      localStorage.setItem(
        "savingsApplication",
        JSON.stringify({
          occupation: formData.occupation,
          monthly_income: formData.incomeRange,
          income_source: formData.sourceOfIncome,
          employment_type: formData.employmentType,
          is18: formData.isOfAge,
        })
      );
      setStep(2);
    } catch (error: any) {
      console.error("Malaysian savings account application error:", error);
    }
  };
  
  const selectedBranchDetails = BRANCHES.find(
    (branch) => branch.id === preferredBranch
  );

  const handleFinalSubmit = () => {
    if (!selectedBranchDetails) {
      alert("Please select a branch before continuing.");
      return;
    }

    localStorage.setItem(
      "branchInfo",
      JSON.stringify({
        branch: selectedBranchDetails.name,
      })
    );
    router.push("/savings/malaysian/account_creation");
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.push("/savings/malaysian/mailing_address");
    }
  };

  if (!mounted) return null;

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
      
      <div className="absolute bottom-0 left-0 w-full leading-none z-0 pointer-events-none opacity-20">
        <svg 
          className="relative block w-full h-24 sm:h-32 md:h-48 lg:h-64" 
          preserveAspectRatio="none" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320"
        >
          <path 
            className="fill-[#F0CA8E]" 
            d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
          />
        </svg>
      </div>

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto z-20 overflow-hidden">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back
        </button>
        <Link 
          href="/" 
          className="flex items-center gap-2"
        >
          <Image 
            src="/images/logo/logo-light.svg" 
            alt="Logo" 
            width={40} 
            height={40} 
            className="block dark:invert-0 invert" 
          />
          <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-gray-800 dark:text-white truncate">
            DTCOB
          </h1>
        </Link>
      </div>

      <div className="relative w-full max-w-2xl z-10">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Savings Account Malaysian Application
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please provide your employment details to proceed with the registration.
              </p>
            </div>
            
            <form 
              onSubmit={handleNext} 
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <CustomSelect 
                  label="Occupation" 
                  required 
                  value={formData.occupation} 
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  options={malaysian_occupations}
                />
                <CustomSelect 
                  label="Monthly Income Range" 
                  required 
                  value={formData.incomeRange} 
                  onChange={(e) => setFormData({...formData, incomeRange: e.target.value})}
                  options={income_range}
                />
                <CustomSelect 
                  label="Employment Type" 
                  required 
                  value={formData.employmentType} 
                  onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                  options={malaysian_employment_types}
                />
                <CustomSelect 
                  label="Source of Income" 
                  required 
                  value={formData.sourceOfIncome} 
                  onChange={(e) => setFormData({...formData, sourceOfIncome: e.target.value})}
                  options={malaysian_source_of_income}
                />
              </div>

              <div className="pt-4 text-center">
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Are you 18 years or older?<span className="text-red-500">*</span>
                </label>
                
                {formData.isOfAge === true ? (
                  <div className="flex justify-center items-center gap-2 mt-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-2.5 px-4 rounded-lg inline-flex border border-green-200 dark:border-green-800/50">
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    Verified: {formData.userAge} years old
                  </div>
                ) : formData.isOfAge === false ? (
                  <div className="flex justify-center items-center gap-2 mt-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 py-2.5 px-4 rounded-lg inline-flex border border-red-200 dark:border-red-800/50">
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                      />
                    </svg>
                    You are {formData.userAge} years old. You must be at least 18 to apply.
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-2 mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 py-2.5 px-4 rounded-lg inline-flex border border-gray-200 dark:border-gray-700">
                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-300 rounded-full" />
                    Checking eligibility...
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col items-center">
                <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                  By clicking continue, you confirm that the information provided is accurate and belongs to you.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button 
                    type="button" 
                    onClick={() => router.push("/personal/malaysian/mailing_address")} 
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!isFormValid} 
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 shadow-theme-xs"
                  >
                    Continue
                  </button>
                </div>

                <div className="mt-5 text-center">
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
                    <Link 
                      href="/contact_support" 
                      className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
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
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md whitespace-nowrap">
                Select Your Preferred Branch Location
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select your primary branch location for in-person services.
              </p>
            </div>

            <div className="mb-8">
              {!userLocation ? (
                <>
                  <div className="p-6 mb-4 bg-blue-50 border-2 rounded-xl text-center border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>

                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-1">
                      Enable Location Services
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Find the nearest branches to you.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestLocation}
                    disabled={isLocating}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition-all bg-blue-600 border border-transparent rounded-xl shadow-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    {isLocating ? "Locating..." : "Use My Current Location"}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 p-4 border-2 rounded-xl border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      Current Location
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {userAddress}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUserLocation(null)}
                    className="text-sm font-bold text-blue-600 dark:text-blue-400"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                Available Branches<span className="text-red-500">*</span>
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
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                        {branch.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {branch.address}
                      </p>
                    </div>

                    {distance && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-md">
                        {distance} km
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-10 flex flex-col items-center">
              <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                By clicking continue, you confirm that the information provided is accurate and belongs to you.
              </p>
              <button 
                type="button"
                onClick={handleFinalSubmit} 
                disabled={!preferredBranch} 
                className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs active:scale-[0.98] ${
                  preferredBranch
                    ? "bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                }`}
              >
                Continue
              </button>

              <div className="mt-5 text-center">
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
                  <Link 
                    href="/contact_support" 
                    className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}