"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import Label from "@/components/form/Label";
import EyeIcon from "@/icons/eye.svg";
import EyeCloseIcon from "@/icons/eye-close.svg";
import { useFormData } from "@/context/FormContext";

type Step = "profile" | "password" | "pending";

export default function BusinessMalaysianAccountCreation() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [mounted, setMounted] = useState(false);

  const [username, setUsername] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [securityPhrase, setSecurityPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { formData, setFormData } = useFormData();

  useEffect(() => {
    setMounted(true);
  }, []);

  const avatarOptions: string[] = [
    "https://api.dicebear.com/7.x/initials/svg?seed=JD&backgroundColor=3D405B",
    "https://api.dicebear.com/7.x/initials/svg?seed=Business&backgroundColor=1e293b",
    "https://api.dicebear.com/7.x/initials/svg?seed=DT&backgroundColor=0ea5e9",
  ];

  const phraseOptions: string[] = ["see you", "dear rich", "ash trevino"];

  const getPasswordStrength = (): string => {
    if (password.length === 0) return "";
    if (password.length < 6) return "Weak";
    if (password.length < 10) return "Medium";
    if (password.length < 14) return "Strong";
    return "Very Strong";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
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
    else router.push("/business/malaysian/supporting_documents");
  };

  const handleSubmit = async () => {
  try {
    // combine latest input with global formData
    const finalData = {
      ...formData,
      account: {
        username,
        password,
        securityPhrase,
        profilePreview,
      },
    };

    const res = await fetch("/api/application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalData),
    });

    if (!res.ok) {
      throw new Error("Failed to create account");
    }

    const data = await res.json();

    // update context
    setFormData(finalData);

    // move to success screen
    setStep("pending");

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
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
                    profilePreview
                      ? "border-[#F0CA8E]"
                      : "border-gray-300 dark:border-gray-700 hover:border-[#F0CA8E] dark:hover:border-[#F0CA8E]"
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
                      <svg 
                        className="w-8 h-8 mx-auto text-gray-400 transition-colors group-hover:text-[#F0CA8E]" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <span className="text-[10px] text-gray-400 uppercase font-bold group-hover:text-[#F0CA8E] transition-colors">Upload</span>
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
                      className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden ${profilePreview === url ? 'border-[#3D405B] scale-110' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Select a preset or upload your own</p>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Username <span className="text-error-500">*</span></Label>
                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                  placeholder="e.g. dearrich"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <button 
                type="button" 
                onClick={handleNext} 
                disabled={!username || !profilePreview} 
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
              >
                Continue
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
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Security Phrase <span className="text-error-500">*</span></Label>
                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                  placeholder="e.g. see you rich rich dear"
                  value={securityPhrase}
                  onChange={(e) => setSecurityPhrase(e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {phraseOptions.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSecurityPhrase(phrase)}
                      className="px-3 py-1.5 text-[11px] font-medium rounded-md border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-[#3D405B] hover:text-[#3D405B] transition-colors"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Password <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeCloseIcon className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      password.length === 0 ? 'w-0' :
                      password.length < 6 ? 'w-1/4 bg-red-500' :
                      password.length < 10 ? 'w-2/4 bg-yellow-500' :
                      password.length < 14 ? 'w-3/4 bg-blue-400' : 'w-full bg-green-500'
                    }`} 
                  />
                </div>
                <p className={`text-[10px] mt-1 italic font-bold uppercase transition-colors ${
                  password.length === 0 ? 'text-gray-400' :
                  password.length < 6 ? 'text-red-500' :
                  password.length < 10 ? 'text-yellow-600' :
                  password.length < 14 ? 'text-blue-400' : 'text-green-500'
                }`}>
                  {getPasswordStrength()}
                </p>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">Confirm Password <span className="text-error-500">*</span></Label>
                <input
                  type="password"
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button 
                type="button"
                onClick={handleSubmit} 
                disabled={!password || !securityPhrase || password !== confirmPassword} 
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {step === "pending" && (
          <div className="text-center animate-in fade-in duration-700">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
            </div>
            <h1 className="mb-4 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
              Verification Pending
            </h1>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              We've sent a confirmation email to
            </p>
            <p className="mb-6 font-bold text-blue-700 dark:text-blue-400">personalemail@example.com</p>
            
            <div className="mb-10 p-4 rounded-xl border bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/50">
                <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                  Our team typically reviews applications within <span className="font-bold">24 hours</span>. Any additional documents needed will be informed via email.
                </p>
            </div>

            <button 
              type="button"
              onClick={() => router.push("/")} 
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
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
                href="/support" 
                className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
               >
                 Contact Support
               </Link>
             </p>
           </div>
        )}
      </div>

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}