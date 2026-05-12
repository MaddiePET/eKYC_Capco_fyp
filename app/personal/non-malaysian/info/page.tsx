"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

export default function PersonalNonMalaysianInfo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const journeyId = searchParams.get("journeyId") || "";

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    fullName: "",
    passportNumber: "",
    dobDay: "",
    dobMonth: "January",
    dobYear: "",
    issuingOffice: "",
    nationality: "",
    issueDate: "",
    expiryDate: "",
  });
  const [lookupStatus, setLookupStatus] = useState<"idle" | "fetching" | "done" | "not-found">("idle");
  const [lookupError, setLookupError] = useState<string | null>(null);

  const formatDateForFields = (value: unknown) => {
    if (!value) return { day: "", month: "January", year: "" };
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return {
        day: date.getDate().toString().padStart(2, "0"),
        month: monthNames[date.getMonth()] || "January",
        year: date.getFullYear().toString(),
      };
    }

    const isoMatch = String(value).match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = Number(isoMatch[2]);
      const day = Number(isoMatch[3]);
      return {
        day: day.toString().padStart(2, "0"),
        month: [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ][month - 1] || "January",
        year,
      };
    }

    return { day: "", month: "January", year: "" };
  };

  const normalizeIdentity = (identity: any, idType: string, idNum: string) => {
    const dob = identity.dob || identity.birth_date || identity.date_of_birth || identity.dob_date || identity.dobDate || "";
    const { day, month, year } = formatDateForFields(dob);
    return {
      title: identity.title || "",
      fullName: identity.full_name || identity.name || identity.fullName || "",
      passportNumber: identity.passport_number || identity.passport_no || identity.passportNo || identity.document_number || idNum,
      dobDay: day || "",
      dobMonth: month,
      dobYear: year || "",
      issuingOffice: identity.pp_issue_office || identity.issuing_office || identity.issue_place || identity.issueOffice || identity.issuingOffice || identity.issue_office || "",
      nationality: identity.nationality || identity.country || "",
      issueDate: identity.pp_issue_date || identity.issue_date || identity.issued_date || "",
      expiryDate: identity.exp_date || identity.pp_exp_date || identity.expiry_date || identity.expiry || identity.expiryDate || "",
    };
  };

  const fetchIdentity = async (idType: string, idNum: string) => {
    if (!idNum) return;
    setLookupStatus("fetching");
    setLookupError(null);

    try {
      const response = await fetch(`/api/identity/lookup?id_type=${encodeURIComponent(idType)}&id_num=${encodeURIComponent(idNum)}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const identityData = data.formData || data.identity;

        setFormData((prev) => ({
          ...prev,
          ...normalizeIdentity(identityData, idType, idNum),
        }));
        setLookupStatus("done");
      } else {
        setLookupStatus("not-found");
        setLookupError(data.message || "No identity data found.");
      }
    } catch (error: any) {
      setLookupStatus("not-found");
      setLookupError(error?.message || "Unable to load identity data.");
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const currentJourneyId = searchParams.get("journeyId") || "";
    const savedJourneyId = localStorage.getItem("nonMsianJourneyId");

    if (savedJourneyId && savedJourneyId !== currentJourneyId) {
      localStorage.removeItem("nonMsianInfo");
      localStorage.removeItem("nonMsianAddress");
      localStorage.removeItem("nonMsianApplication");
      localStorage.removeItem("nonMsianEmail");
      localStorage.removeItem("nonMsianPhone");
      localStorage.removeItem("nonMsianIdType");
      localStorage.removeItem("nonMsianIdNum");
    }

    localStorage.setItem("nonMsianJourneyId", currentJourneyId);

    const savedInfo = JSON.parse(localStorage.getItem("nonMsianInfo") || "{}") || {};

    const queryParams = new URLSearchParams(window.location.search);

    const idType =
      queryParams.get("id_type") ||
      localStorage.getItem("nonMsianIdType") ||
      savedInfo.id_type ||
      "passport";

    const idNum =
      queryParams.get("id_num") ||
      localStorage.getItem("nonMsianIdNum") ||
      savedInfo.id_num ||
      "";

    if (idNum) {
      localStorage.setItem("nonMsianIdType", idType);
      localStorage.setItem("nonMsianIdNum", idNum);

      setFormData((prev) => ({
        ...prev,
        passportNumber: idNum,
      }));

      fetchIdentity(idType, idNum);
    }
  }, []);

  const handleNavigation = () => {
    //convert month name into month number
    const months: Record<string, string> = {
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

    // save passport and personal details for final submission
    const nonMsianInfo = {
      id_type: "Passport",
      id_num: formData.passportNumber,
      full_name: formData.fullName,
      dob: `${formData.dobYear}-${months[formData.dobMonth]}-${formData.dobDay}`,

      non_msian_details: {
        pp_issue_office: formData.issuingOffice,
        pp_issue_date: formData.issueDate,
        pp_exp_date: formData.expiryDate,
        nationality: formData.nationality,
      },
    };

    localStorage.setItem("nonMsianInfo", JSON.stringify(nonMsianInfo));

    localStorage.setItem("nonMsianIdType", "passport");
    localStorage.setItem("nonMsianIdNum", formData.passportNumber);
    localStorage.setItem("nonMsianJourneyId", journeyId);

    router.push(
      `/personal/non-malaysian/address?id_type=passport&id_num=${encodeURIComponent(
        formData.passportNumber
      )}&journeyId=${encodeURIComponent(journeyId)}`
    );
  };

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

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
        <button
          type="button"
          onClick={() => 
            router.push(
              `/personal/non-malaysian/email?journeyId=${encodeURIComponent(journeyId)}`
            )
          }
          className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          
          Back
        </button>

        <Link href="/" className="flex items-center gap-2">
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
        </Link>
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
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Title<span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                    >
                      {["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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

                <div className="col-span-3">
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Full Name<span className="text-red-500">*</span>
                  </label>

                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                    readOnly 
                    />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Passport Number<span className="text-red-500">*</span>
                </label>

                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed" 
                  value={formData.passportNumber} 
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })} 
                  readOnly
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Date of Birth<span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <select 
                      value={formData.dobDay} 
                      onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed"
                      disabled
                    >
                      {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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
                          strokeWidth="2" d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select 
                      value={formData.dobMonth} 
                      onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed"
                      disabled
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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
                          strokeWidth="2" d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select 
                      value={formData.dobYear} 
                      onChange={(e) => setFormData({ ...formData, dobYear: e.target.value })} 
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed"
                      disabled
                    >
                      {Array.from({ length: 100 }, (_, i) => (2025 - i).toString()).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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
                          strokeWidth="2" d="M19 9l-7 7-7-7" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  ID Issuing Office<span className="text-red-500">*</span>
                </label>

                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed" 
                  value={formData.issuingOffice} 
                  onChange={(e) => setFormData({ ...formData, issuingOffice: e.target.value })} 
                  readOnly
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Nationality<span className="text-red-500">*</span>
                </label>

                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed" 
                  value={formData.nationality} 
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} 
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Date of Issue<span className="text-red-500">*</span>
                  </label>

                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed" 
                    value={formData.issueDate} 
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} 
                    readOnly
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Date of Expiry <span className="text-red-500">*</span>
                  </label>

                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none cursor-not-allowed" 
                    value={formData.expiryDate} 
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} 
                    readOnly
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
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-500 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}