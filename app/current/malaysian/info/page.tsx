"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import { saveToStorage } from "@/lib/storage";
import { useFormData } from "@/context/FormContext";

export default function CurrentMalaysianInfo() {
  const router = useRouter();
  const { formData: globalFormData, setFormData: setGlobalFormData } = useFormData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<"idle" | "fetching" | "done" | "not-found">("idle");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gender: "",
    fullName: "",
    nric: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    phoneCode: "+60",
    phoneNumber: "",
    add1: "",
    add2: "",
    postal: "",
    state: "",
    country: "Malaysia",
  });

  const searchParams = useSearchParams();
  const custIdFromParams =
  searchParams.get("cust_id") ||
  (typeof window !== "undefined" ? localStorage.getItem("currentCustId") : "") ||
  "";
  
  const mode =
  searchParams.get("mode") ||
  (typeof window !== "undefined" ? localStorage.getItem("mode") : "") ||
  "new_user";

  const idNumFromParams =
    searchParams.get("id_num") ||
    (typeof window !== "undefined" ? localStorage.getItem("id_num") : "") ||
    "";

  console.log("INFO PAGE LOADED");
  console.log("mode:", mode);
  console.log("custIdFromParams:", custIdFromParams);
  console.log("idNumFromParams:", idNumFromParams);
  
  const journeyId = searchParams.get("journeyId") || (typeof window !== "undefined" ? localStorage.getItem("journeyId") : "") || "";

  const formatDateForFields = (value: unknown) => {
    if (!value) return { day: "", month: "January", year: "" };
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];
      return {
        day: date.getDate().toString().padStart(2, "0"),
        month: monthNames[date.getMonth()] || "",
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
        month: ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December",][month - 1] || "",
        year,
      };
    }

    return { day: "", month: "", year: "" };
  };

  const normalizeGender = (raw: any) => {
    if (!raw) return "";
    const val = String(raw).trim().toUpperCase();
    if (val === "M" || val === "MALE") return "M";
    if (val === "F" || val === "FEMALE") return "F";
    if (val === "NB" || val === "NON-BINARY" || val === "NON_BINARY") return "NB";
    if (val === "NONE" || val === "PREFER NOT TO SAY" || val === "PREFER_NOT_TO_SAY") return "NONE";
    return "";
  };

  const normalizeIdentity = (identity: any, idType: string, idNum: string) => {
    const dob = identity.dob || identity.birth_date || identity.date_of_birth || identity.dob_date || identity.dobDate || "";
    const { day, month, year } = formatDateForFields(dob);
    
    return {
      gender: normalizeGender(identity.gender || identity.sex),
      fullName: identity.full_name || identity.name || identity.fullName || "",
      nric: identity.ic_number || identity.nric || identity.id_num || idNum,
      dobDay: day || "",
      dobMonth: month,
      dobYear: year || "",
      phoneCode: "+60",
      phoneNumber: identity.ph_no || identity.phone_number || identity.phoneNumber || "",
      add1: identity.add1 || identity.address_line_1 || identity.address || identity.home_address || "",
      add2: identity.add2 || identity.address_line_2 || "",
      postal: identity.postcode || identity.postal_code || identity.postal || "",
      state: identity.state || "",
      country: identity.country || "Malaysia",
    };
  };

  const fetchIdentity = async (idType: string, idNum: string) => {
    if (!idNum) return;
    setLookupStatus("fetching");
    setLookupError(null);

    try {
      const response = await fetch(`/api/identity/lookup?id_type=${encodeURIComponent(idType)}&id_num=${encodeURIComponent(idNum)}`);
      const data = await response.json();

      if (response.ok && data.success && data.identity) {
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

    if (mode) localStorage.setItem("mode", mode);
    if (journeyId) localStorage.setItem("journeyId", journeyId);
    if (idNumFromParams) localStorage.setItem("id_num", idNumFromParams);
    localStorage.setItem("id_type", "ic");

    if (mode === "new_user") {
      fetchIdentity("ic", idNumFromParams);
    }
  }, [mode, journeyId, idNumFromParams]);

  useEffect(() => {
    async function loadExistingCustomer() {
      if (mode !== "existing_customer") return;

      if (!custIdFromParams && !idNumFromParams) return;

      try {
        const lookupUrl = custIdFromParams
          ? `/api/customer/lookup?cust_id=${encodeURIComponent(custIdFromParams)}`
          : `/api/customer/lookup?id_num=${encodeURIComponent(idNumFromParams)}`;

        console.log("INFO PAGE MODE:", mode);
        console.log("INFO PAGE CUSTOMER LOOKUP URL:", lookupUrl);
        const res = await fetch(lookupUrl);
        const data = await res.json();

        if (!data.success) {
          alert("Unable to load your existing customer details. Please log in again.");
          router.push("/login");
          return;
        }

        const customer = data.customer;
        const { day, month, year } = formatDateForFields(customer.dob);

        setFormData((prev) => ({
          ...prev,
          gender: normalizeGender(customer.gender),
          nric: customer.id_num || "",
          fullName: customer.full_name || "",
          dobDay: day || "",
          dobMonth: month || "",
          dobYear: year || "",
          phoneNumber: (customer.ph_no || "").replace(/^\+?60/, ""),
          add1: customer.add_1 || "",
          add2: customer.add_2 || "",
          postal: customer.postcode || "",
          state: customer.state || "",
          country: customer.country || "Malaysia",
        }));
      } catch (error) {
        console.error("Existing customer load error:", error);
        alert("Unable to load existing customer details.");
      }
    }

    loadExistingCustomer();
  }, [mode, custIdFromParams, idNumFromParams]);

  const handleNext = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

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

      const dob = `${formData.dobYear}-${monthMap[formData.dobMonth]}-${formData.dobDay}`;
      const fullPhone = `${formData.phoneCode}${formData.phoneNumber}`;

      const personalInfo = {
        gender: formData.gender,
        id_num: formData.nric,
        full_name: formData.fullName,
        id_type: "NRIC",
        dob,
        ph_no: fullPhone,
        country: formData.country,
      };

      const homeAddress = {
        add_type: "Home",
        add_1: formData.add1,
        add_2: formData.add2,
        postcode: formData.postal,
        state: formData.state,
        country: formData.country,
      };

      saveToStorage("personalInfo", personalInfo);
      saveToStorage("homeAddress", homeAddress);
      saveToStorage("id_num", formData.nric);
      saveToStorage("id_type", "ic");

      setGlobalFormData({
        ...globalFormData,
        applicationMode: mode,
        journeyId,
        idType: "ic",
        idNum: formData.nric,
        personalInfo: {
          ...personalInfo,
          fullName: formData.fullName,
          full_name: formData.fullName,
          id_type: "IC",
          add1: formData.add1,
          add2: formData.add2,
          postal: formData.postal,
          state: formData.state,
          country: formData.country,
        },
        homeAddress,
      });

      router.push(
        `/current/malaysian/business_particulars?id_type=ic&id_num=${encodeURIComponent(
          formData.nric
        )}&journeyId=${encodeURIComponent(journeyId)}&mode=${encodeURIComponent(mode)}`
      );
    } catch (error) { 
      console.error("Submission error:", error);
      setSubmitError("Failed to save application data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    formData.gender !== "" &&
    formData.fullName.trim() !== "" &&
    formData.nric.trim() !== "" &&
    formData.phoneNumber.trim() !== "" &&
    formData.add1.trim() !== "" &&
    formData.postal.trim() !== "" &&
    formData.add2.trim() !== "" &&
    formData.state.trim() !== "";

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
        {mode !== "existing_customer" ? (
          <button
            type="button"
            onClick={() =>
              router.push(
                `/current/malaysian/otp?journeyId=${encodeURIComponent(journeyId)}`
              )
            }
            className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </button>
        ) : (
          <div />
        )}

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

      <div className="relative w-full max-w-4xl mt-10 z-10 ">
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
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Full Name<span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                  <input
                    type="text"
                    readOnly
                    className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none"
                    value={formData.fullName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    NRIC<span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    <input
                      type="text"
                      readOnly
                      className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none"
                      value={formData.nric}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Gender<span className="text-red-500">*</span>
                  </label>

                  {mode === "existing_customer" ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                      <input
                        type="text"
                        readOnly
                        className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                        value={
                          formData.gender === "M" ? "M" :
                          formData.gender === "F" ? "F" :
                          formData.gender === "NB" ? "Non-binary" :
                          formData.gender === "NONE" ? "Prefer not to say" : formData.gender
                        }
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <select 
                        value={formData.gender} 
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                        className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                      >
                        <option value="" disabled>Select</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="NB">Non-binary</option>
                        <option value="NONE">Prefer not to say</option>
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
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Date of Birth<span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    <input
                      type="text"
                      readOnly
                      className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                      value={formData.dobDay}
                    />
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    <input
                      type="text"
                      readOnly
                      className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                      value={formData.dobMonth}
                    />
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    <input
                      type="text"
                      readOnly
                      className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                      value={formData.dobYear}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Mobile Number<span className="text-red-500">*</span>
                </label>

                <div className="flex mt-2">
                  <div className="flex items-center gap-2 px-4 border-2 border-r-0 rounded-l-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20">
                    <img 
                      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/MY.svg`} 
                      alt="MY" 
                      className="w-5 h-auto rounded-sm" 
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{formData.phoneCode}</span>
                  </div>

                  <div className="flex-1 flex items-center gap-2 px-4 py-2.5 border-2 rounded-r-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    <input
                      type="text"
                      readOnly
                      className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                      value={formData.phoneNumber}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Address 1<span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                  <input
                    type="text"
                    readOnly
                    className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                    value={formData.add1}
                  />
                </div>
              </div>
            
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Address 2<span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                  <input
                    type="text"
                    readOnly
                    className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                    value={formData.add2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Postal Code<span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    <input
                      type="text"
                      readOnly
                      className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                      value={formData.postal}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    State<span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                  <input
                    type="text"
                    readOnly
                    className="w-full min-w-0 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                    value={formData.state}
                  />
                </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Country<span className="text-red-500">*</span>
                </label>

                <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-not-allowed bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{formData.country}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-4 flex flex-col items-center">
              <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                By clicking continue, you confirm that the information provided is accurate and belongs to you.
              </p>
              <button 
                onClick={handleNext} 
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
                    href="/contact_support" 
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

      <footer className="relative mt-12 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}