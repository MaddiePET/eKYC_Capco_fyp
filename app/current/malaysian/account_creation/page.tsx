"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import Label from "@/components/form/Label";
import EyeIcon from "@/icons/eye.svg";
import EyeCloseIcon from "@/icons/eye-close.svg";
import { loadFromStorage } from "@/lib/storage";
import { useFormData } from "@/context/FormContext";

type Step = "profile" | "password" | "pending";

export default function CurrentMalaysianAccountCreation() {
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
    const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);

  const { formData, setFormData } = useFormData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Attempt to get contact info from local storage
    const savedContactData = loadFromStorage("contactInfo", {} as any);
    
    // Fallback chain just like the personal page
    const emailToSet = 
      formData?.businessContact?.bus_email || 
      formData?.personalInfo?.email || 
      savedContactData?.email || 
      savedContactData?.email_address || 
      "";
      
    setUserEmail(emailToSet);
  }, [formData]);

  const avatarOptions: string[] = [
    "https://api.dicebear.com/7.x/initials/svg?seed=MP&backgroundColor=9B8EC7",
    "https://api.dicebear.com/7.x/initials/svg?seed=AT&backgroundColor=FFD369",
    "https://api.dicebear.com/7.x/initials/svg?seed=JD&backgroundColor=B7A3E3",
    "https://api.dicebear.com/7.x/initials/svg?seed=GP&backgroundColor=F4ABC4",
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

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const storedPersonalInfo = loadFromStorage("personalInfo", {} as any);
      const storedContactInfo = loadFromStorage("contactInfo", {} as any);
      const storedBusinessContact = loadFromStorage("businessContact", {} as any); 
      const storedBusinessParticulars = loadFromStorage("businessParticulars", {} as any);
      const storedHomeAddress = loadFromStorage("homeAddress", {} as any);
      const selectedBusiness = loadFromStorage("selectedBusiness", {} as any);
      const ssmData = loadFromStorage("ssmCompanyData", loadFromStorage("companyData", {} as any));

      const normalizedBusiness = {
        registration_number:
          formData.businessParticulars?.reg_no ||
          storedBusinessParticulars.reg_no ||
          selectedBusiness.brn ||
          ssmData.registration_number || "",
        business_name:
          formData.businessParticulars?.bus_name ||
          storedBusinessParticulars.bus_name ||
          selectedBusiness.name ||
          ssmData.business_name || "",
        start_date:
          formData.businessParticulars?.start_date ||
          storedBusinessParticulars.start_date ||
          selectedBusiness.start_date ||
          ssmData.start_date || null,
        business_type:
          formData.businessParticulars?.bus_type ||
          storedBusinessParticulars.bus_type ||
          selectedBusiness.type ||
          ssmData.business_type || "",
        role: formData.businessParticulars?.role || storedBusinessParticulars.role || "Owner",
        msic_code:
          formData.businessParticulars?.msic_code ||
          storedBusinessParticulars.msic_code ||
          selectedBusiness.msicCode ||
          ssmData.msic_code || "",
        msic_name:
          formData.businessParticulars?.msic_name ||
          storedBusinessParticulars.msic_name ||
          selectedBusiness.msicName ||
          ssmData.msic_name || "",
      };

      const rawBusAddr = formData.businessAddress?.businessAddress || {};
      const rawMailAddr = formData.businessAddress?.mailingAddress || {};
      const storedBiz = selectedBusiness?.address || ssmData?.address || {};

      const addressLine1 = rawBusAddr.addressLine1 || storedBiz.addressLine1 || storedBusinessParticulars.bus_add1 || ssmData.bus_add1 || "";
      const addressLine2 = rawBusAddr.addressLine2 || storedBiz.addressLine2 || storedBusinessParticulars.bus_addr2 || ssmData.bus_addr2 || "";
      const postcode = rawBusAddr.postcode || storedBiz.postcode || storedBusinessParticulars.bus_postcode || ssmData.bus_postcode || "";
      const state = rawBusAddr.state || storedBiz.state || storedBusinessParticulars.bus_state || ssmData.bus_state || "";
      const country = rawBusAddr.country || storedBiz.country || ssmData.country || "Malaysia";

      const finalPayload = {
        journeyId: formData.journeyId || localStorage.getItem("journeyId") || "",
        personalInfo: {
          id_num: formData.idNum || storedPersonalInfo.id_num || storedPersonalInfo.idNumber || "",
          full_name: storedPersonalInfo.full_name || storedPersonalInfo.fullName || "",
          dob: storedPersonalInfo.dob || storedPersonalInfo.dateOfBirth || "",
          id_type: "IC",
          streetAddress: storedHomeAddress.add_1 || storedHomeAddress.streetAddress || "",
          city: storedHomeAddress.add_2 || storedHomeAddress.city || "",
          postal: storedHomeAddress.postcode || storedHomeAddress.postal || "",
          state: storedHomeAddress.state || "",
          country: "Malaysia",
        },

        businessParticulars: normalizedBusiness,
        businessContact: {
          bus_ph_no: formData.businessContact?.bus_ph_no || storedPersonalInfo.ph_no || "",
          phoneNumber: formData.businessContact?.bus_ph_no || storedPersonalInfo.ph_no || "",
          bus_email: formData.businessContact?.bus_email || storedBusinessContact.bus_email || storedContactInfo.email || userEmail || "",
          email: formData.businessContact?.bus_email || storedBusinessContact.bus_email || storedContactInfo.email || userEmail || "",
        },
        
        businessAddress: {
          preferredBranch: formData.businessAddress?.preferredBranch || "Main Corporate Branch",
          isMailingSameAsBusiness: formData.businessAddress?.isMailingSameAsBusiness ?? true,
          businessAddress: {
            addressLine1: addressLine1,
            addressLine2: addressLine2, 
            postcode: postcode,
            state: state,
            country: country,
          },
          mailingAddress: {
            addressLine1: rawMailAddr.addressLine1 || addressLine1,
            addressLine2: rawMailAddr.addressLine2 || addressLine2,
            postcode: rawMailAddr.postcode || postcode,
            state: rawMailAddr.state || state,
            country: rawMailAddr.country || country,
          },
        },
        account: {
          username: username.trim(),
          password: password,
          securityPhrase: securityPhrase,
          profilePreview: profilePreview || "",
        },
      };

      console.log("Sending Malaysian application payload verification: ", finalPayload);

      const res = await fetch("/api/application/msian_current_account", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(finalPayload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to complete current account registration.");
      }

      setFormData((prev) => ({
        ...prev,
        account: {
          username: username.trim(),
          securityPhrase: securityPhrase,
          profilePreview: profilePreview || "",
        },
      }));

      setStep("pending");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("An unhandled database tracking runtime exception occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (step === "profile") {
      try {
        setIsValidatingUsername(true);
        setUsernameError(null);
        
        const res = await fetch(`/api/auth/check_existing_username?username=${encodeURIComponent(username.trim())}`);
        const data = await res.json();
        
        if (data.exists) {
          setUsernameError("This username is already taken. Please choose another.");
          return;
        }
        
        setStep("password");
      } catch (err) {
        setUsernameError("Unable to verify username availability. Please try again.");
      } finally {
        setIsValidatingUsername(false);
      }
    } else if (step === "password") {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (step === "password") {
      setStep("profile");
    } else if (step === "pending") {
      setStep("password");
    } else {
      router.push("/current/malaysian/supporting_documents");
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

        <Link href="/" className="flex items-center gap-2">
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

      <div className="relative w-full max-w-md z-10">
        {step === "profile" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Create Your Account
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your profile photo and username to get started.
              </p>
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
                      <img 
                        src={profilePreview} 
                        className="w-full h-full object-cover" 
                        alt="Profile" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase bg-white/20 backdrop-blur-sm px-2 py-1 rounded">Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <svg 
                        className="w-8 h-8 mx-auto text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" 
                        />
                      </svg>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Upload</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  {avatarOptions.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfilePreview(url)}
                      className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden ${
                        profilePreview === url 
                          ? "border-[#3D405B] scale-110" 
                          : "border-transparent"
                      }`}
                    >
                      <img 
                        src={url} 
                        alt="Avatar option" 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              {usernameError && (
                <div className="mb-4 p-3 text-xs text-center font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {usernameError}
                </div>
              )}

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Username<span className="text-error-500">*</span>
                </Label>

                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E]"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsernameError(null);
                    setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, "").replace(/^./, (c) => c.toUpperCase()));
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={username.length < 5 || !profilePreview || isValidatingUsername}
                className="w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] hover:bg-[#2c2f42] disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isValidatingUsername ? "Checking Availability..." : "Continue"}
              </button>            
            </div>
          </div>
        )}

        {step === "password" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Secure Your Account
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set a strong password and a security phrase.
              </p>
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
                    onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                  />

                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword 
                      ? <EyeIcon className="w-5 h-5" /> 
                      : <EyeCloseIcon className="w-5 h-5" />
                    }
                  </button>
                </div>

                {password.length > 0 && !isPasswordValid && (
                  <div className="mt-2 text-[10px] space-y-1 animate-in slide-in-from-top-1 fade-in duration-300">
                    <p className={password.length >= 8 ? "text-green-500" : "text-gray-400"}>
                      {password.length >= 8 ? "✓" : "○"} At least 8 characters
                    </p>
                    <p className={/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}>
                      {/[0-9]/.test(password) ? "✓" : "○"} At least one number
                    </p>
                    <p className={/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                      {/[A-Z]/.test(password) ? "✓" : "○"} At least one capital letter
                    </p>
                    <p className={/[a-z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                      {/[a-z]/.test(password) ? "✓" : "○"} At least one lowercase letter
                    </p>
                    <p className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-400"}>
                      {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} At least one special character
                    </p>
                  </div>
                )}

                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${
                      password.length === 0 ? 'w-0' :
                      score <= 1 ? 'w-1/4 bg-red-500' :
                      score === 2 ? 'w-2/4 bg-yellow-500' :
                      score === 3 ? 'w-3/4 bg-blue-400' : 'w-full bg-green-500'
                    }`} 
                  />
                </div>
                
                <p className={`text-[10px] mt-1 italic font-bold uppercase transition-colors ${
                  score <= 1 ? 'text-red-500' :
                  score === 2 ? 'text-yellow-600' :
                  score === 3 ? 'text-blue-400' : 'text-green-500'
                }`}>
                  {getPasswordStrength()}
                </p>
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
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ""))}
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
                className="w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] hover:bg-[#2c2f42] disabled:bg-gray-200 disabled:text-gray-400"
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
                <svg 
                  className="w-10 h-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
            </div>

            <h1 className="mb-4 font-bold text-gray-800 text-title-sm dark:text-white">
              Verification Pending
            </h1>

            <p className="mb-2 text-sm text-gray-500">
              We've sent a confirmation email to
            </p>

            <p className="mb-6 font-bold text-blue-700 dark:text-blue-400">
              {userEmail}
            </p>

            <button 
              type="button" 
              onClick={() => router.push("/")} 
              className="w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B]"
            >
              Finish
            </button>
          </div>
        )}

        {step !== "pending" && (
          <div className="mt-5 text-center">
            <p className="text-sm font-normal">
              <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
              
              <Link 
                href="/contact_support" 
                className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
               >
                Contact Support
              </Link>
            </p>
          </div>
        )}
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}