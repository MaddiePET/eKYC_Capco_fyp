"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

interface AddressFields {
  streetAddress1: string;
  streetAddress2: string;
  postal: string;
  city: string;
  state: string;
  country: string;
}

interface AddressState {
  permanentAddress: AddressFields;
  mailingAddress: AddressFields;
}

interface AddressSectionProps {
  title: string;
  type: keyof AddressState;
}

export default function PersonalNonMalaysianAddress() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  const [addressData, setAddressData] = useState<AddressState>({
    permanentAddress: { streetAddress1: "", streetAddress2: "", postal: "", city: "", state: "", country: "" },
    mailingAddress: { streetAddress1: "", streetAddress2: "", postal: "", city: "", state: "", country: "" }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFormValid = 
    Object.values(addressData.permanentAddress).every(val => val.trim() !== "") &&
    Object.values(addressData.mailingAddress).every(val => val.trim() !== "");

  const handleNavigation = () => router.push('/personal/non-malaysian/email');

  const updateField = (type: keyof AddressState, field: keyof AddressFields, value: string) => {
    setAddressData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const AddressSection = ({ title, type }: AddressSectionProps) => (
    <div className="flex-1">
      <h2 className="block mb-6 text-md font-bold text-[#3D405B] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
        {title}
      </h2>
      <div className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
            placeholder="House no, Building name"
            value={addressData[type].streetAddress1} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(type, 'streetAddress1', e.target.value)} 
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
            Address Line 2 <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
            placeholder="Street name, Area"
            value={addressData[type].streetAddress2} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(type, 'streetAddress2', e.target.value)} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
              placeholder="e.g. 47610"
              value={addressData[type].postal} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(type, 'postal', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              City <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
              placeholder="e.g. Subang Jaya"
              value={addressData[type].city} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(type, 'city', e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              State <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
              placeholder="e.g. Selangor"
              value={addressData[type].state} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(type, 'state', e.target.value)} 
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              Country <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none" 
              placeholder="e.g. United Kingdom"
              value={addressData[type].country} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(type, 'country', e.target.value)} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
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
          onClick={() => router.push('/personal/non-malaysian/info')}
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

      <div className="relative w-full max-w-5xl mt-10 z-10">
        <div className="mb-12 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            Enter Your Address Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please provide your current and permanent residential addresses to proceed with the registration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <AddressSection title="Permanent Home Address" type="permanentAddress" />
          <AddressSection title="Current Mailing Address" type="mailingAddress" />
        </div>

        <div className="mt-16 flex flex-col items-center max-w-xl mx-auto">
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

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 z-10 text-center">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}