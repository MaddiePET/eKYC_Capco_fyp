"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
<<<<<<< HEAD
=======
import { useFormData } from "@/context/FormContext";
>>>>>>> 3ead2a0cdccffb152bf1b55ee989dc604c264246

interface Business {
  id: string;
  brn: string;
  name: string;
  type: string;
  start_date: string;
}

const linked_businesses: Business[] = [
  { id: "bus_1", brn: "202112345678", name: "GoGo Sdn Bhd", type: "Sole Proprietorship", start_date: "2011-01-01" },
  { id: "bus_2", brn: "202212345678", name: "Boleh Sdn Bhd", type: "Partnership", start_date: "2012-02-02" },
  { id: "bus_3", brn: "202312345678", name: "Ash Trevino Sdn Bhd", type: "Sole Proprietorship", start_date: "2013-03-03" },
];

export default function BusinessMalaysianBusinessParticulars() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");

<<<<<<< HEAD
=======
  const { formData: globalFormData, setFormData: setGlobalFormData } = useFormData();

>>>>>>> 3ead2a0cdccffb152bf1b55ee989dc604c264246
  const [formData, setFormData] = useState({
    businessName: "",
    brn: "",
    day: "",
    month: "",
    year: "",
    businessType: "",
  });

<<<<<<< HEAD
=======
    const monthMap: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

>>>>>>> 3ead2a0cdccffb152bf1b55ee989dc604c264246
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      const biz = linked_businesses.find(b => b.id === selectedBusinessId);
      if (biz) {
        const [y, m, d] = biz.start_date.split("-");
        setFormData({
          businessName: biz.name,
          brn: biz.brn,
          day: d,
          month: [
            "January", "February", "March", "April", "May", "June", "July", "August", "September", 
            "October", "November", "December"
          ][parseInt(m) - 1],
          year: y,
          businessType: biz.type,
        });
      }
    }
  }, [selectedBusinessId]);

  const handleBack = () => {
    if (step === 1) {
      router.push("/business/malaysian/email");
    } else {
      setStep(1);
    }
  };

  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleFinalSubmit = () => {
<<<<<<< HEAD
    router.push("/business/malaysian/business_address");
  };
=======
  setGlobalFormData({
    ...globalFormData,
    businessParticulars: {
      businessName: formData.businessName,
      brn: formData.brn,
      startDate: `${formData.year}-${monthMap[formData.month]}-${formData.day}`,
      businessType: formData.businessType,
    },
  });

  router.push("/business/malaysian/business_address");
};
>>>>>>> 3ead2a0cdccffb152bf1b55ee989dc604c264246

  const inputClasses = "w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none";
  const readOnlyClasses = "w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400";

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

      <div className={`relative w-full z-10 ${step === 1 ? "max-w-md" : "max-w-xl"}`}>
        {step === 1 && (
          <div>
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Select Your Registered Business
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Which of the following business would you like to register an account for?
              </p>
            </div>

            <div className="space-y-4">
              {linked_businesses.map((business) => {
                const isSelected = selectedBusinessId === business.id;
                return (
                  <div 
                    key={business.id}
                    onClick={() => setSelectedBusinessId(business.id)}
                    className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                      isSelected
                        ? "border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#3D405B]/40"
                        : "border-gray-200 bg-white hover:border-[#F0CA8E]/50 dark:bg-gray-900/90 dark:border-gray-800"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? "border-[#3D405B] bg-[#3D405B]"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white">{business.name}</h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">BRN: {business.brn}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button 
                type="button"
                onClick={handleNextStep1} 
                disabled={!selectedBusinessId} 
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 active:scale-[0.98]"
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
        )}

        {step === 2 && (
          <div>
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Verify Your Business Particulars
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If your business particulars are different from the registered business on your MyKad below, please update it.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={inputClasses} 
                    value={formData.businessName} 
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Business Registration Number (BRN) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className={readOnlyClasses} 
                    value={formData.brn} 
                    readOnly 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Operation Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <select 
                        value={formData.day} 
                        onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                        className={inputClasses}
                      >
                        <option value="" disabled>Day</option>
                        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    <div className="relative">
                      <select 
                        value={formData.month} 
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        className={inputClasses}
                      >
                        <option value="" disabled>Month</option>
                        {[
                          "January", "February", "March", "April", "May", "June", "July", "August", "September", 
                          "October", "November", "December"
                        ].map(month => <option key={month} value={month}>{month}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    <div className="relative">
                      <select 
                        value={formData.year} 
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className={inputClasses}
                      >
                        <option value="" disabled>Year</option>
                        {Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i)).map(year => <option key={year} value={year}>{year}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.businessType} 
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className={inputClasses}
                    >
                      <option value="" disabled>Select Type</option>
                      {[
                        "Sole Proprietorship", "Partnership", "Private Limited (Sdn Bhd)", "Limited Liability Partnership (LLP)"
                      ].map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center w-full mx-auto">
                <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">
                  By clicking continue, you confirm that the information provided is accurate and belongs to you.
                </p>

                <div className="w-full">
                  <button 
                    type="button"
                    onClick={handleFinalSubmit} 
                    disabled={!formData.businessName || !formData.day || !formData.month || !formData.year || !formData.businessType}
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
                
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
          </div>
        )}
      </div>

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}