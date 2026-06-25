"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import { useFormData } from "@/context/FormContext";
import { saveToStorage } from "@/lib/storage";

interface Business {
  id: string;
  brn: string;
  name: string;
  type: string;
  start_date: string;
  msicCode: string;
  msicName: string;

  address?: {
    addressLine1: string;
    addressLine2: string;
    postcode: string;
    state: string;
    country: string;
  };
}

export default function CurrentMalaysianBusinessParticulars() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const journeyId =
    searchParams.get("journeyId") ||
    (typeof window !== "undefined" ? localStorage.getItem("journeyId") : "") ||
    "";

  const idType =
    searchParams.get("id_type") ||
    (typeof window !== "undefined" ? localStorage.getItem("id_type") : "") ||
    "ic";

  const idNum =
    searchParams.get("id_num") ||
    (typeof window !== "undefined" ? localStorage.getItem("id_num") : "") ||
    "";

  const mode =
    searchParams.get("mode") ||
    (typeof window !== "undefined" ? localStorage.getItem("mode") : "") ||
    "new_user";

  const { formData: globalFormData, setFormData: setGlobalFormData } =
    useFormData();

  const [mounted, setMounted] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [selectedBusinessBrn, setSelectedBusinessBrn] = useState<string>("");

  const [linkedBusinesses, setLinkedBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState<boolean>(true);
  const [businessError, setBusinessError] = useState<string>("");

  const [businessAlreadyRegistered, setBusinessAlreadyRegistered] =
    useState<boolean>(false);

  const [existingAccountNo, setExistingAccountNo] = useState<string>("");
  const [checkingExistingBusiness, setCheckingExistingBusiness] =
    useState<boolean>(false);

  const [solePropBlockedMessage, setSolePropBlockedMessage] = useState("");

  const [sameCustomerBlockedMessage, setSameCustomerBlockedMessage] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    brn: "",
    msicCode: "",
    msicName: "",
    day: "",
    month: "",
    year: "",
    businessType: "",
    role: "",
    businessAddress: {
      addressLine1: "",
      addressLine2: "",
      postcode: "",
      state: "",
      country: "Malaysia",
    },
  });

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    if (journeyId) localStorage.setItem("journeyId", journeyId);
    if (idType) localStorage.setItem("id_type", idType);
    if (idNum) localStorage.setItem("id_num", idNum);
    if (mode) localStorage.setItem("mode", mode);
  }, [journeyId, idType, idNum, mode]);

  useEffect(() => {
    const verifySession = async () => {
      if (mode === "existing_customer") {
        return;
      }

      const jId =
        typeof window !== "undefined"
          ? localStorage.getItem("journeyId") || journeyId
          : journeyId;

      if (!jId) {
        router.push("/current/user_verification");
        return;
      }

      try {
        const res = await fetch(
          `/api/ekyc/status?journeyId=${encodeURIComponent(jId)}`
        );

        const data = await res.json();

        if (data.status !== "face_verified") {
          router.push("/current/malaysian/face_verification");
        }
      } catch (e) {
        console.error("Session verification failed", e);
      }
    };

    verifySession();
  }, [mode, journeyId, router]);

  useEffect(() => {
    async function fetchLinkedBusinesses() {
      try {
        if (!idNum) {
          setBusinessError("MyKad number is missing. Please return to the previous step.");
          setLoadingBusinesses(false);
          return;
        }

        const response = await fetch(
          `/api/identity/lookup?lookup=ssm_businesses&id_num=${encodeURIComponent(
            idNum
          )}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setBusinessError(data.message || "Failed to retrieve linked businesses.");
          setLoadingBusinesses(false);
          return;
        }

        setLinkedBusinesses(data.businesses || []);
      } catch (error) {
        console.error(error);
        setBusinessError("Unable to load linked businesses.");
      } finally {
        setLoadingBusinesses(false);
      }
    }

    fetchLinkedBusinesses();
  }, [idNum]);

  const checkExistingCurrentAccount = async (
    regNo: string,
    businessType: string
  ) => {
    setBusinessAlreadyRegistered(false);
    setExistingAccountNo("");
    setSolePropBlockedMessage("");
    setSameCustomerBlockedMessage("");

    if (!regNo) {
      return;
    }

    try {
      setCheckingExistingBusiness(true);

      const response = await fetch(
        `/api/current_account/check_business?reg_no=${encodeURIComponent(
          regNo
        )}&id_num=${encodeURIComponent(idNum)}`
      );

      const data = await response.json();

      const currentSelectedBiz = linkedBusinesses.find(
        (b) => b.brn === selectedBusinessBrn
      );

      if (!currentSelectedBiz || currentSelectedBiz.brn !== regNo) {
        return;
      }

      const isSoleProp = businessType
        .toLowerCase()
        .includes("sole proprietorship");

      console.log("CHECKING REG NO:", regNo);
      console.log("CURRENT SELECTED BRN:", currentSelectedBiz.brn);
      console.log("CHECK BUSINESS DATA:", data);
      console.log("IS SOLE PROP:", isSoleProp);

      if (!response.ok || !data.success) {
        setBusinessAlreadyRegistered(false);
        setExistingAccountNo("");
        return;
      }

      if (!data.exists) {
        setBusinessAlreadyRegistered(false);
        setExistingAccountNo("");
        setSolePropBlockedMessage("");
        setSameCustomerBlockedMessage("");
        return;
      }

      setBusinessAlreadyRegistered(true);
      setExistingAccountNo(data.account_no || "");

      if (isSoleProp) {
        setSolePropBlockedMessage(
          "You have already registered a current account for this business. "
        );
        setSameCustomerBlockedMessage("");
        return;
      }

      if (data.same_customer_linked === true) {
        setSameCustomerBlockedMessage(
          "You have already registered a current account for this business. Your partner may create a current account using their IC number."
        );
        setSolePropBlockedMessage("");
        return;
      }

      setSolePropBlockedMessage("");
      setSameCustomerBlockedMessage("");
    } catch (error) {
      console.error("Failed to check existing current account:", error);

      setBusinessAlreadyRegistered(false);
      setExistingAccountNo("");
      setSolePropBlockedMessage("");
      setSameCustomerBlockedMessage("");
    } finally {
      setCheckingExistingBusiness(false);
    }
  };

  useEffect(() => {
  if (!selectedBusinessBrn) return;

  const biz = linkedBusinesses.find((b) => b.brn === selectedBusinessBrn);

  if (!biz) return;

    const [y = "", m = "", d = ""] = (biz.start_date || "").split("-");

    const extractedAddress = biz.address || {
      addressLine1: (biz as any).bus_add1 || "",
      addressLine2: (biz as any).bus_addr2 || "",
      postcode: (biz as any).bus_postcode || "",
      state: (biz as any).bus_state || "",
      country: (biz as any).country || "Malaysia",
    };

    const isSoleProp = (biz.type || "")
      .toLowerCase()
      .includes("sole proprietorship");

    setFormData({
      businessName: biz.name || "",
      brn: biz.brn || "",
      msicCode: biz.msicCode || "",
      msicName: biz.msicName || "",
      day: d || "",
      month: m || "",
      year: y || "",
      businessType: biz.type || "",
      role: isSoleProp ? "Checker & Maker" : "",
      businessAddress: extractedAddress,
    });

    if (biz.brn) {
      checkExistingCurrentAccount(biz.brn, biz.type || "");
    }
  }, [selectedBusinessBrn, linkedBusinesses]);

  const handleBack = () => {
    if (step === 1) {
      router.push(
        `/current/malaysian/info?id_type=${encodeURIComponent(
          idType
        )}&id_num=${encodeURIComponent(idNum)}&journeyId=${encodeURIComponent(
          journeyId
        )}`
      );
    } else {
      setStep(1);
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleFinalSubmit = () => {
    const biz = linkedBusinesses.find((b) => b.brn === selectedBusinessBrn);

    if (!biz) {
      setBusinessError("Please select a business before continuing.");
      return;
    }

    const normalizedBusiness = {
      reg_no: biz.brn || "",
      bus_name: biz.name || "",
      start_date: biz.start_date || "",
      bus_type: biz.type || "",
      msic_code: biz.msicCode || "",
      msic_name: biz.msicName || "",
      role: formData.role || "Owner",
      bus_add1: formData.businessAddress.addressLine1,
      bus_addr2: formData.businessAddress.addressLine2,
      bus_postcode: formData.businessAddress.postcode,
      bus_state: formData.businessAddress.state,
      current_account_exists: businessAlreadyRegistered,
      existing_account_no: existingAccountNo,
    };

    const businessAddressData = {
      businessAddress: formData.businessAddress,
      mailingAddress: {
        addressLine1: "",
        addressLine2: "",
        postcode: "",
        state: "",
        country: "Malaysia",
      },
      isMailingSameAsBusiness: null,
      preferredBranch: "",
    };

    saveToStorage("selectedBusiness", biz);
    saveToStorage("businessParticulars", normalizedBusiness);
    saveToStorage("ssmCompanyData", biz);
    saveToStorage("businessAddress", businessAddressData);

    localStorage.setItem(
      "currentAccountExists",
      businessAlreadyRegistered ? "true" : "false"
    );

    localStorage.setItem("existingAccountNo", existingAccountNo || "");

    saveToStorage("currentAccountExists", businessAlreadyRegistered);
    saveToStorage("existingAccountNo", existingAccountNo);

    setGlobalFormData({
      ...globalFormData,
      journeyId,
      idType,
      idNum,
      applicationMode: mode,
      businessParticulars: {
        bus_name: formData.businessName,
        reg_no: formData.brn,
        start_date: `${formData.year}-${formData.month.padStart(
          2,
          "0"
        )}-${formData.day.padStart(2, "0")}`,
        bus_type: formData.businessType,
        role: formData.role,
        msic_code: formData.msicCode,
        msic_name: formData.msicName,
        currentAccountExists: businessAlreadyRegistered,
        existingAccountNo,
      },
      businessAddress: businessAddressData,
    });

    router.push(
      `/current/malaysian/business_address?id_type=${encodeURIComponent(
        idType
      )}&id_num=${encodeURIComponent(idNum)}&journeyId=${encodeURIComponent(
        journeyId
      )}&mode=${encodeURIComponent(mode)}&current_account_exists=${encodeURIComponent(
        businessAlreadyRegistered ? "true" : "false"
      )}&existing_account_no=${encodeURIComponent(existingAccountNo || "")}`
    );
  };

  const isFormValid =
    formData.businessName.trim() !== "" &&
    formData.brn.trim() !== "" &&
    formData.msicCode.trim() !== "" &&
    formData.msicName.trim() !== "" &&
    formData.day.trim() !== "" &&
    formData.month.trim() !== "" &&
    formData.year.trim() !== "" &&
    formData.businessType.trim() !== "" &&
    formData.role.trim() !== "" &&
    !checkingExistingBusiness &&
    !solePropBlockedMessage &&
    !sameCustomerBlockedMessage;

  const isSoleProprietorship = formData.businessType
    .toLowerCase()
    .includes("sole proprietorship");

  const roleOptions = isSoleProprietorship
    ? ["Checker & Maker"]
    : ["Checker", "Maker"];

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

      <div className={`relative w-full z-10 ${step === 1 ? "max-w-md" : "max-w-2xl"}`}>
        {step === 1 && (
          <div>
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Select a Business for Account Registration
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The following businesses are found linked to your IC number.
              </p>
            </div>

            <div className="space-y-4">
              {loadingBusinesses && (
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Loading linked businesses...
                </p>
              )}
              {businessError && (
                <div className="mb-4 w-full p-3 rounded-lg border text-xs text-center font-medium shadow-sm bg-red-50/80 border-red-200 dark:bg-red-900/30 dark:border-red-500/50 text-red-500">
                  {businessError}
                </div>
              )}
              {!loadingBusinesses && !businessError && linkedBusinesses.length === 0 && (
                <div className="mb-4 w-full p-3 rounded-lg border text-xs text-center font-medium shadow-sm bg-red-50/80 border-red-200 dark:bg-red-900/30 dark:border-red-500/50 text-red-500">
                  <p>No registered business linked with your MyKad number.</p>
                </div>
              )}


              {linkedBusinesses.map((business) => {
                const isSelected = selectedBusinessBrn === business.brn;
                
                return (
                  <div
                    key={business.brn}
                    onClick={() => setSelectedBusinessBrn(business.brn)}
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
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                        {business.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                        BRN: {business.brn}
                      </p>
                    </div>
                  </div>
                );
              })}

              {solePropBlockedMessage && (
                <p className="text-sm text-center text-red-500 font-medium">
                  {solePropBlockedMessage}
                </p>
              )}

              {sameCustomerBlockedMessage && (
                <p className="text-sm text-center text-red-500 font-medium">
                  {sameCustomerBlockedMessage}
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center">
              {!loadingBusinesses && !businessError && linkedBusinesses.length === 0 ? (
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] active:scale-[0.98]"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    !selectedBusinessBrn ||
                    loadingBusinesses ||
                    checkingExistingBusiness ||
                    !!solePropBlockedMessage ||
                    !!sameCustomerBlockedMessage
                  }
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 active:scale-[0.98]"
                >
                  Continue
                </button>
              )}

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

        {step === 2 && (
          <div>
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Verify Your Business Particulars
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The below is the registered business particulars with SSM.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {businessAlreadyRegistered && (
                    <div className="md:col-span-2 rounded-xl text-center border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-500/40 dark:bg-green-900/20 dark:text-green-200">
                      <p>An existing business current account has been registered for this business.</p>
                      <p>Business address and contact verification are not required.</p>  
                    </div>
                  )}

                  {checkingExistingBusiness && (
                    <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      Checking whether this business already has a current account...
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                      Business Name<span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                      <input
                        type="text"
                        readOnly
                        className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                        value={formData.businessName}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                      Business Registration Number (BRN)<span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                      <input 
                        type="text" 
                        readOnly
                        className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                        value={formData.brn} 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                          MSIC Code<span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                          <input
                            type="text"
                            readOnly
                            className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                            value={formData.msicCode}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                          MSIC Name<span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                          <input
                            type="text"
                            readOnly
                            className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                            value={formData.msicName}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                      Operation Start Date<span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                        <input
                          type="text"
                          readOnly
                          className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                          value={formData.day}
                        />
                      </div>

                      <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                        <input
                          type="text"
                          readOnly
                          className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                          value={formData.month}
                        />
                      </div>

                      <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                        <input
                          type="text"
                          readOnly
                          className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                          value={formData.year}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                          Business Type<span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                          <input
                            type="text"
                            readOnly
                            className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                            value={formData.businessType}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                          Role<span className="text-red-500">*</span>
                        </label>

                        {isSoleProprietorship ? (
                          <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                            <input
                              type="text"
                              readOnly
                              className="w-full text-sm font-bold text-gray-700 dark:text-gray-200 bg-transparent outline-none cursor-not-allowed"
                              value={formData.role}
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={formData.role}
                              onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                              }
                              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                            >
                              <option value="" disabled>
                                Select Role
                              </option>

                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {role}
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 flex flex-col items-center w-full mx-auto">
                  <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">
                    By clicking continue, you confirm that the information provided is accurate and belongs to you.
                  </p>

                  <div className="w-full">
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={!isFormValid}
                      className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs active:scale-[0.98] ${
                        isFormValid 
                          ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                      }`}
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