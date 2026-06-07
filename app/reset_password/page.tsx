"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import EyeCloseIcon from "@/icons/eye-close.svg";
import EyeIcon from "@/icons/eye.svg";
import Label from "@/components/form/Label";

export default function ResetPassword() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"verify" | "reset" | "success">("verify");
  
  const [username, setUsername] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPasswordValid = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}/.test(newPassword);
  const score = (newPassword.length >= 8 ? 1 : 0) + (/[0-9]/.test(newPassword) ? 1 : 0) + (/[A-Z]/.test(newPassword) ? 1 : 0) + (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0);

  const getPasswordStrength = (): string => {
    if (newPassword.length === 0) return "";
    if (score <= 1) return "Weak";
    if (score === 2) return "Medium";
    if (score === 3) return "Strong";
    return "Very Strong";
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", username, idNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verification failed.");
      }

      setStep("reset");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage("Password does not meet the security requirements.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", username, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password.");
      }

      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950" />;
  }

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

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto z-20">
        {step !== "success" && (
          <button 
            type="button" 
            onClick={() => {
              if (step === "reset") {
                setStep("verify");
              } else {
                router.push("/login");
              }
            }} 
            className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeftIcon className="w-5 h-5" />

            Back
          </button>
        )}

        <Link 
          href="/" 
          className={`flex items-center gap-2 ${step === 'success' ? 'mx-auto' : ''}`}
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

      <div className="relative w-full max-w-md z-10"> 
        {step === "verify" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Reset Password
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please enter your username and registered MyKad / Passport number to verify your identity.
              </p>
            </div>
            
            {errorMessage && (
              <div className="mb-4 p-3 text-xs text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <Label className="block mb-2 text-gray-800 dark:text-white/90">
                  Username<span className="text-error-500">*</span>
                </Label>

                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, "").replace(/^./, (c) => c.toUpperCase()))}
                  required
                />
              </div>

              <div>
                <Label className="block mb-2 text-gray-800 dark:text-white/90">
                  MyKad / Passport No.<span className="text-error-500">*</span>
                </Label>

                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white"
                  placeholder="Enter your MyKad / Passport number"
                  value={idNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setIdNumber("");
                      return;
                    }
                    const firstChar = value.charAt(0).toUpperCase();
                    const secondChar = value.charAt(1).toUpperCase();
                    if (/[A-Z]/.test(firstChar + secondChar)) {
                      const rest = value.slice(2).replace(/[^0-9]/g, "");
                      setIdNumber(firstChar + secondChar + rest);
                    }
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:opacity-70"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        )}

        {step === "reset" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Create New Password
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your identity has been successfully verified. Please enter your new password below.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 text-xs text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {errorMessage}
              </div>
            )}

            <form 
              onSubmit={handleReset} 
              className="space-y-5"
            >
              <div>
                <Label className="block mb-2 text-gray-800 dark:text-white/90">
                  New Password<span className="text-error-500">*</span>
                </Label>

                <div className="relative">
                  <input
                    className="w-full px-4 py-2.5 pr-10 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.replace(/\s/g, ""))}
                    required
                  />

                  <span 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute z-30 cursor-pointer -translate-y-1/2 right-4 top-1/2"
                  >
                    {showPassword ? <EyeIcon className="w-5 h-5 fill-gray-500" /> : <EyeCloseIcon className="w-5 h-5 fill-gray-500" />}
                  </span>
                </div>

                {newPassword.length > 0 && !isPasswordValid && (
                  <div className="mt-2 text-[10px] space-y-1 animate-in slide-in-from-top-1 fade-in duration-300">
                    <p className={newPassword.length >= 8 ? "text-green-500" : "text-gray-400"}>
                      {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters
                    </p>
                    <p className={/[0-9]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[0-9]/.test(newPassword) ? "✓" : "○"} At least one number
                    </p>
                    <p className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least one capital letter
                    </p>
                    <p className={/[a-z]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[a-z]/.test(newPassword) ? "✓" : "○"} At least one lowercase letter
                    </p>
                    <p className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"} At least one special character
                    </p>
                  </div>
                )}

                <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${
                      newPassword.length === 0 ? 'w-0' :
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
                <Label className="block mb-2 text-gray-800 dark:text-white/90">
                  Confirm Password<span className="text-error-500">*</span>
                </Label>

                <input
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ""))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!newPassword || !isPasswordValid || newPassword !== confirmPassword || isLoading}
                className="w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] hover:bg-[#2c2f42] disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-green-100 rounded-full dark:bg-green-900/30">
              <svg 
                className="w-8 h-8 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
              Password Reset Complete
            </h1>
            
            <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
              Your password has been successfully updated. You can now log in using your new credentials.
            </p>

            <button 
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
            >
              Go to Log In
            </button>
          </div>
        )}
      </div>

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

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}