"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import Label from "@/components/form/Label";

type Step = "confirm" | "change" | "otp";

export default function PersonalMalaysianPhone() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("confirm");
  const [phoneNumber, setPhoneNumber] = useState("123456789");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleGlobalBack = () => {
    if (step === "otp") setStep("confirm");
    else if (step === "change") setStep("confirm");
    else router.push("/personal/malaysian/mykad");
  };

  const handleSendOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setTimer(60);
    }, 800);
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    if (cleanValue.length > 1) {
      const pastedChars = cleanValue.slice(0, 6).split("");
      pastedChars.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      otpInputs.current[Math.min(index + pastedChars.length, 5)]?.focus();
    } else {
      newOtp[index] = cleanValue;
      setOtp(newOtp);
      if (index < 5) otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

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
          onClick={handleGlobalBack}
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
        {step === "confirm" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Phone Number Verification
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Is this still your current mobile number?
              </p>
            </div>

            <div className="relative p-4 mb-6 rounded-2xl border-2 transition-all duration-300 text-center backdrop-blur-sm
              border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 
              dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                +60 ****** {phoneNumber.slice(-2)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Registered Mobile Number
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
              >
                {isLoading ? "Sending Code..." : "Yes, send code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("change")}
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
              >
                No, change number
              </button>
            </div>

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
          </div>
        )}

        {step === "change" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md whitespace-nowrap">
                Update Your Phone Number
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please provide your new mobile number to proceed with the registration.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2 text-gray-800 dark:text-white/90">Mobile Number <span className="text-red-500">*</span></Label>
                  <div className="flex mt-2">
                    <div className="flex items-center gap-2 px-4 border-2 border-r-0 rounded-l-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20">
                      <img
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/MY.svg`}
                        alt="MY"
                        className="w-5 h-auto rounded-sm shadow-sm"
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">+60</span>
                    </div>
                    <input
                      autoFocus
                      className="w-full px-4 py-2.5 text-sm font-medium transition-all bg-white border-2 rounded-r-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                      placeholder="123456789"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || phoneNumber.length < 9} 
                  className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs ${
                    phoneNumber.length >= 9 && !isLoading
                      ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  }`}
                >
                  {isLoading ? "Processing..." : "Continue"}
                </button>
              </div>
            </form>

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
          </div>
        )}

        {step === "otp" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Verify Your Phone Number
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We've sent a 6-digit code to <span className="font-bold text-gray-900 dark:text-white">+60 {phoneNumber}</span>. Please provide the code to proceed with the registration.
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  ref={(el) => { otpInputs.current[index] = el; }}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-bold transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => router.push("/personal/malaysian/info")}
                disabled={otp.join("").length < 6}
                className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs ${otp.join("").length === 6 ? 'bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]' : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'}`}
              >
                Verify
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resend code in <span className="font-bold text-blue-600 dark:text-blue-400">{timer}s</span>
                  </p>
                ) : (
                  <button type="button" onClick={handleSendOtp} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
                    Resend Code
                  </button>
                )}
              </div>
            </div>

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
          </div>
        )}

        <div className="mt-8 p-4 rounded-xl flex gap-3 border transition-all backdrop-blur-sm
          bg-blue-50/80 border-blue-200 
          dark:bg-blue-900/30 dark:border-blue-500/50 dark:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <p className="text-xs leading-relaxed text-blue-900 dark:text-blue-100">
            Standard SMS rates may apply. Your mobile number is used solely for <span className="font-bold text-blue-700 dark:text-blue-300">secure account registration</span> and <span className="font-bold text-blue-700 dark:text-blue-300">identity verification</span>.
          </p>
        </div>
      </div>

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}