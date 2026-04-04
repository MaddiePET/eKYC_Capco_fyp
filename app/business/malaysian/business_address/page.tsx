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

interface Address {
  streetAddress: string;
  postal: string;
  city: string;
  state: string;
  country: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const BRANCHES: Branch[] = [
  { id: "subang-jaya", name: "Subang Jaya Branch", lat: 3.0738, lng: 101.5883, address: "Jalan SS 15, Subang Jaya" },
  { id: "kuala-lumpur", name: "KL Main Branch", lat: 3.1390, lng: 101.6869, address: "Bukit Bintang, Kuala Lumpur" },
  { id: "petaling-jaya", name: "Petaling Jaya Branch", lat: 3.1073, lng: 101.6067, address: "Section 00, Petaling Jaya" },
];

export default function BusinessMalaysianBusinessAddress() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [businessAddress, setBusinessAddress] = useState<Address>({
    streetAddress: "Jalan SS15/1H",
    postal: "40000",
    city: "Subang Jaya",
    state: "Selangor",
    country: "Malaysia",
  });

  const [useBusinessAsMailing, setUseBusinessAsMailing] = useState<boolean | null>(null);

  const [mailingAddress, setMailingAddress] = useState<Address>({
    streetAddress: "",
    postal: "",
    city: "",
    state: "",
    country: "",
  });

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [userAddressLabel, setUserAddressLabel] = useState<string>("");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [preferredBranch, setPreferredBranch] = useState<string>("");

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111;
  };

  const handleRequestLocation = (): void => {
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
          setUserAddressLabel(data.display_name.split(',').slice(0, 3).join(','));
        } catch (e) {
          setUserAddressLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
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

  const handleBack = (): void => {
    if (step === 1) {
      router.push("/business/malaysian/business_particulars");
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      if (useBusinessAsMailing) {
        setStep(1);
      } else {
        setStep(2);
      }
    }
  };

  const handleStep1Submit = (): void => {
    if (useBusinessAsMailing === true) {
      setMailingAddress({ ...businessAddress });
      setStep(3);
    } else {
      if (!mailingAddress.streetAddress) setMailingAddress({ ...businessAddress });
      setStep(2);
    }
  };

  const handleStep2Submit = (): void => {
    setStep(3);
  };

  const handleFinalSubmit = (): void => {
    router.push("/business/malaysian/contact");
  };

  const inputClasses = "w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none";

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

      <div className={`relative w-full z-10 animate-in fade-in duration-500 ${step === 3 ? 'max-w-2xl' : 'max-w-md'}`}>
        {step === 1 && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md whitespace-nowrap">
                Verify Your Business Address
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                If your business address is different from the registered business address on your MyKad below, please update it.
              </p>

              <div className="relative p-4 mb-8 rounded-2xl border-2 transition-all duration-300 text-center backdrop-blur-sm border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 text-center">
                  Jalan SS15/1H, 40000 Subang Jaya, Selangor, Malaysia
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Registered MyKad Address</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Street Address <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClasses} 
                    value={businessAddress.streetAddress} 
                    onChange={(e) => setBusinessAddress({...businessAddress, streetAddress: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Zip Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={businessAddress.postal} 
                      onChange={(e) => setBusinessAddress({...businessAddress, postal: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">City <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={businessAddress.city} 
                      onChange={(e) => setBusinessAddress({...businessAddress, city: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">State <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={businessAddress.state} 
                      onChange={(e) => setBusinessAddress({...businessAddress, state: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Country <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={businessAddress.country} 
                      onChange={(e) => setBusinessAddress({...businessAddress, country: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Keep business address as mailing address? <span className="text-red-500">*</span></label>
                <div className="flex justify-center gap-8 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input 
                      type="radio" 
                      name="sameAddress" 
                      className="w-4 h-4 accent-[#3D405B]" 
                      checked={useBusinessAsMailing === true} 
                      onChange={() => setUseBusinessAsMailing(true)}
                    /> Yes
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input 
                      type="radio" 
                      name="sameAddress" 
                      className="w-4 h-4 accent-[#3D405B]" 
                      checked={useBusinessAsMailing === false} 
                      onChange={() => setUseBusinessAsMailing(false)}
                    /> No
                  </label>
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6">
                  By clicking continue, you confirm that the information provided is accurate and belongs to you.
                </p>
                <button 
                  onClick={handleStep1Submit} 
                  disabled={useBusinessAsMailing === null} 
                  className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs active:scale-[0.98] ${
                    useBusinessAsMailing !== null 
                      ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
             <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md whitespace-nowrap">
                Verify Your Mailing Address
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                If your mailing address is different from the registered business address below, please update it.
              </p>

              <div className="relative p-4 mb-8 rounded-2xl border-2 transition-all duration-300 text-center backdrop-blur-sm border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 text-center">
                  {`${businessAddress.streetAddress}, ${businessAddress.postal} ${businessAddress.city}, ${businessAddress.state}, ${businessAddress.country}`}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Registered Business Address</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Street Address <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className={inputClasses} 
                    value={mailingAddress.streetAddress} 
                    onChange={(e) => setMailingAddress({...mailingAddress, streetAddress: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Postal Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={mailingAddress.postal} 
                      onChange={(e) => setMailingAddress({...mailingAddress, postal: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">City <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={mailingAddress.city} 
                      onChange={(e) => setMailingAddress({...mailingAddress, city: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">State <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={mailingAddress.state} 
                      onChange={(e) => setMailingAddress({...mailingAddress, state: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Country <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      value={mailingAddress.country} 
                      onChange={(e) => setMailingAddress({...mailingAddress, country: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By clicking continue, you confirm that the information provided is accurate and belongs to you.
                </p>
                <button 
                  onClick={handleStep2Submit} 
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
             <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md whitespace-nowrap">
                Select Your Preferred Branch
              </h1>
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
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{userAddressLabel}</p>
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
               <button 
                 onClick={handleFinalSubmit} 
                 disabled={!preferredBranch} 
                 className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs active:scale-[0.98] ${
                    preferredBranch 
                      ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
               >
                 Continue
               </button>
            </div>
          </div>
        )}

        <div className="mt-5 text-center">
            <p className="text-sm font-normal">
                <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
                <Link href="/support" className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Contact Support
                </Link>
            </p>
        </div>
      </div>

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">        
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}