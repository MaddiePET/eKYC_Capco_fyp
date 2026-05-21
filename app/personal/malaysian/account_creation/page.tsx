"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import Label from "@/components/form/Label";
import EyeIcon from "@/icons/eye.svg";
import EyeCloseIcon from "@/icons/eye-close.svg";

type Step = "profile" | "password" | "pending";

export default function PersonalMalaysianAccountCreation() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("profile");
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [securityPhrase, setSecurityPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);

    // Retrieve email from storage fallback securely
    const savedEmailData = localStorage.getItem("nonMsianEmail") || localStorage.getItem("contactInfo");
    if (savedEmailData) {
      const parsed = JSON.parse(savedEmailData);
      setUserEmail(parsed.email || parsed.email_address || "");
    }
  }, []);

  const avatarOptions: string[] = [
    "https://api.dicebear.com/7.x/initials/svg?seed=JD&backgroundColor=3D405B",
    "https://api.dicebear.com/7.x/initials/svg?seed=Business&backgroundColor=1e293b",
    "https://api.dicebear.com/7.x/initials/svg?seed=DT&backgroundColor=0ea5e9",
  ];

  const phraseOptions: string[] = ["Whale Hello There!", "Sofa So Good..", "Donut Worry Be Happy!"];
  const isPasswordValid = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}/.test(password);
  const score = (password.length >= 8 ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const getPasswordStrength = (): string => {
    if (password.length === 0) return "";
    if (score <= 1) return "Weak";
    if (score === 2) return "Medium";
    if (score === 3) return "Strong";
    return "Very Strong";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setProfilePreview(dataUrl); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === "profile") setStep("password");
    else if (step === "password") setStep("pending");
  };

  const handleBack = () => {
    if (step === "password") setStep("profile");
    else if (step === "pending") setStep("password");
    else router.push("/personal/malaysian/application");
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Parse current active local storage states
      const journeyId = localStorage.getItem("journeyId") || "";
      const phoneVerification = JSON.parse(localStorage.getItem("phoneVerification") || "{}");
      const personalInfo = JSON.parse(localStorage.getItem("personalInfo") || "{}");
      const storedHomeAddress = JSON.parse(localStorage.getItem("homeAddress") || "{}");
      const contactInfo = JSON.parse(localStorage.getItem("contactInfo") || "{}");
      const storedMailingAddress = JSON.parse(localStorage.getItem("mailingAddress") || "{}");
      const branchInfo = JSON.parse(localStorage.getItem("branchInfo") || "{}");
      const savingsApplication = JSON.parse(localStorage.getItem("savingsApplication") || "{}");

      const homeAddress = {
        add_type: storedHomeAddress.add_type || "Home",
        add_1: storedHomeAddress.add_1 || storedHomeAddress.streetAddress1 || storedHomeAddress.streetAddress || "",
        add_2: storedHomeAddress.add_2 || storedHomeAddress.streetAddress2 || storedHomeAddress.city || "",
        postcode: storedHomeAddress.postcode || storedHomeAddress.postal || "",
        state: storedHomeAddress.state || "",
        country: storedHomeAddress.country || "Malaysia",
      };

      const mailingAddress = {
        add_type: storedMailingAddress.add_type || "Mailing",
        add_1: storedMailingAddress.add_1 || storedMailingAddress.streetAddress1 || storedMailingAddress.streetAddress || homeAddress.add_1,
        add_2: storedMailingAddress.add_2 || storedMailingAddress.streetAddress2 || storedMailingAddress.city || homeAddress.add_2,
        postcode: storedMailingAddress.postcode || storedMailingAddress.postal || homeAddress.postcode,
        state: storedMailingAddress.state || homeAddress.state,
        country: storedMailingAddress.country || homeAddress.country || "Malaysia",
      };

      if (!homeAddress.add_1 || !homeAddress.postcode || !homeAddress.state) {
        throw new Error("Home address is incomplete. Please go back and fill in the address parameters.");
      }

      // Construct verified structured payload matching backend API requirements
      const payload = {
        journeyId,
        customer: {
          id_num: personalInfo.id_num || personalInfo.ic_num || "",
          full_name: personalInfo.full_name || "",
          id_type: personalInfo.id_type || "IC",
          dob: personalInfo.dob || "",
          ph_no: phoneVerification.ph_no || phoneVerification.phone_number || "",
          email: contactInfo.email || contactInfo.email_address || userEmail || "",
          country: personalInfo.country || "Malaysia",
        },
        homeAddress,
        mailingAddress,
        savingsAccount: {
          occupation: savingsApplication.occupation || "",
          monthly_income: savingsApplication.monthly_income || "",
          income_source: savingsApplication.income_source || "",
          employment_type: savingsApplication.employment_type || "",
          is18: savingsApplication.is18 !== undefined ? savingsApplication.is18 : true,
        },
        user: {
          username,
          password,
          status: "PENDING",
          img: profilePreview || null,
          sec_phrase: securityPhrase,
          branch: branchInfo.branch || "Main Branch",
        },
      };

      const response = await fetch("/api/msian_savings_account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to finalize account creation.");
      }

      console.log("Final submission success:", result);

      // Clean persistent state structures on confirmation
      localStorage.removeItem("phoneVerification");
      localStorage.removeItem("personalInfo");
      localStorage.removeItem("homeAddress");
      localStorage.removeItem("contactInfo");
      localStorage.removeItem("mailingAddress");
      localStorage.removeItem("savingsApplication");

      setStep("pending");
    } catch (error: any) {
      console.error("Final submission error:", error);
      setSubmitError(error.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
      {/* Background SVGs */}
      <div className="absolute top-0 left-0 w-full leading-none z-0 pointer-events-none opacity-20">
        <svg className="relative block w-full h-24 sm:h-32 md:h-48 lg:h-64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path className="fill-[#3D405B]/80" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,117.3C672,117,768,171,864,192C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
          <path className="fill-[#3D405B]" d="M0,128L48,138.7C96,149,192,171,288,176C384,181,480,171,576,144C672,117,768,75,864,69.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
      </div>

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto z-20 overflow-hidden">
        <button type="button" onClick={handleBack} className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white">
          <ChevronLeftIcon className="w-5 h-5" /> Back
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo/logo-light.svg" alt="Logo" width={40} height={40} className="block dark:invert-0 invert" />
          <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-gray-800 dark:text-white truncate">DTCOB</h1>
        </Link>
      </div>

      <div className="relative w-full max-w-md z-10">
        {step === "profile" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">Create Your Account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose your profile photo and username to get started.</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group w-28 h-28 rounded-full border-2 border-dashed transition-all cursor-pointer flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900 ${
                    profilePreview ? "border-[#F0CA8E]" : "border-gray-300 dark:border-gray-700 hover:border-[#F0CA8E]"
                  }`}
                >
                  {profilePreview ? (
                    <>
                      <img src={profilePreview} className="w-full h-full object-cover" alt="Profile" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase bg-white/20 backdrop-blur-sm px-2 py-1 rounded">Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Upload</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="mt-4 flex gap-3">
                  {avatarOptions.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfilePreview(url)}
                      className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden ${
                        profilePreview === url ? "border-[#3D405B] scale-110" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Username<span className="text-error-500">*</span>
                </Label>
                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E]"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={username.length < 5 || !profilePreview}
                className="w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] hover:bg-[#2c2f42] disabled:bg-gray-200 disabled:text-gray-400"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "password" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">Secure Your Account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set a strong password and a security phrase.</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Security Phrase<span className="text-error-500">*</span>
                </Label>
                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E]"
                  placeholder="Enter your security phrase"
                  value={securityPhrase}
                  onChange={(e) => setSecurityPhrase(e.target.value.replace(/[^a-zA-Z!,.\s]/g, ""))}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {phraseOptions.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSecurityPhrase(phrase)}
                      className="px-3 py-1.5 text-[11px] font-medium rounded-md border-2 text-gray-600 hover:border-[#3D405B]"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Password<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeCloseIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Confirm Password<span className="text-error-500">*</span>
                </Label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!password || !securityPhrase || password !== confirmPassword || !isPasswordValid || isSubmitting}
                className="w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] hover:bg-[#2c2f42] disabled:bg-gray-200"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        )}

        {step === "pending" && (
          <div className="text-center animate-in fade-in duration-700">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="mb-4 font-bold text-gray-800 text-title-sm dark:text-white">Verification Pending</h1>
            <p className="mb-2 text-sm text-gray-500">We've sent a confirmation email to</p>
            <p className="mb-6 font-bold text-blue-700 dark:text-blue-400">{userEmail}</p>
            <button type="button" onClick={() => router.push("/")} className="w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B]">
              Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}