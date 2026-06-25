"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import { QRCodeSVG } from "qrcode.react";

export default function SavingsMalaysianMyKadQRCode() {
  const router = useRouter();

  const [mobileUrl, setMobileUrl] = useState<string>("");
  const [journeyId, setJourneyId] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hostWarning, setHostWarning] = useState<string | null>(null);
  const [duplicateAccountPopup, setDuplicateAccountPopup] = useState(false);
  const [duplicateAccountMessage, setDuplicateAccountMessage] = useState("");

  const checkExistingSavingsAccount = async (idNum: string) => {
    const response = await fetch("/api/application/check_existing_savings_account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_num: idNum }),
    });

    const result = await response.json();

    if (response.status === 409) {
      setDuplicateAccountMessage(
        result.error || "You already have an account with us. Please log in to continue."
      );
      setDuplicateAccountPopup(true);
      return true;
    }

    if (!response.ok) {
      throw new Error(result.error || "Failed to check existing savings account.");
    }

    return false;
  };

  useEffect(() => {
    const jId = localStorage.getItem("journeyId") || "";

    if (!jId) {
      console.error("Journey ID missing");
      return;
    }

    if (!localStorage.getItem("journeyId")) {
      localStorage.setItem("journeyId", jId);
    }

    setJourneyId(jId);

    const origin = window.location.origin;
    const targetUrl = `${origin}/savings/malaysian/mykad/mobile?journeyId=${jId}`;

    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      setHostWarning(
        "This app is loaded from localhost, which is not reachable from your phone. Open the app from your laptop IP or tunnel URL and refresh."
      );
    }

    setMobileUrl(targetUrl);

    const checkStatus = setInterval(async () => {
      try {
        const res = await fetch(`/api/ekyc/status?journeyId=${jId}`);
        
        const rawText = await res.text();

        if (!rawText || rawText.trim() === "") {
          return;
        }

        const data = JSON.parse(rawText);

        if (data.status === "processing") {
          setIsProcessing(true);
        } else if (data.status === "verified") {
          setIsProcessing(false);
          const detectedIdNum = data.id_num;

          if (!detectedIdNum) {
            setIsFailed(true);
            clearInterval(checkStatus);
            return;
          }

          const hasExistingAccount = await checkExistingSavingsAccount(detectedIdNum);

          if (hasExistingAccount) {
            clearInterval(checkStatus);
            return;
          }

          setIsVerified(true);
          clearInterval(checkStatus);
        } else if (data.status === "duplicate") {
          setIsProcessing(false);
          const detectedIdNum = data.id_num;
          if (detectedIdNum) {
            await checkExistingSavingsAccount(detectedIdNum);
          }
          clearInterval(checkStatus);
        } else if (data.status === "failed") {
          setIsProcessing(false);
          setIsFailed(true);
          clearInterval(checkStatus);
        } else if (data.status === "failed_attempt") {
          setIsProcessing(false);
        }
      } catch (error) {
        console.warn("Verification status polling skipped due to a temporary network connection break.");
      }
    }, 500);

    return () => clearInterval(checkStatus);
  }, []);

  const handleNext = () => {
    if (isVerified) {
      router.push(
        `/savings/malaysian/face_verification?journeyId=${encodeURIComponent(journeyId)}`
      );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
      {duplicateAccountPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Account Already Exists
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {duplicateAccountMessage}
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3 px-4 bg-[#3D405B] text-white font-bold rounded-xl hover:bg-[#2c2f42] transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Too Many Attempts
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Verification failed after multiple attempts. Please return to the home page to restart.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 bg-[#3D405B] text-white font-bold rounded-xl hover:bg-[#2c2f42] transition-colors"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      )}

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

      <header className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
        <button
          type="button"
          onClick={() => router.push("/savings/nationality_selection")}
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
      </header>

      <main className="relative w-full max-w-5xl z-10 px-2 sm:px-4">
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            MyKad Verification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Please use your mobile device camera to scan the QR code below and securely capture your MyKad front.
          </p>
        </div>

        {hostWarning && (
          <div className="mb-6 w-full max-w-md mx-auto p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium shadow-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 whitespace-pre-line">            
            {hostWarning}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-6">
          <div className="lg:col-span-5 flex flex-col">
            <div className="w-full bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col justify-center h-full">
              <div className="flex flex-col items-center w-full">
                <div
                  className={`p-6 rounded-3xl shadow-xl border transition-all duration-500 ${
                    isVerified
                      ? "border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20" 
                      : isProcessing
                      ? "border-emerald-200 bg-white shadow-lg ring-4 ring-emerald-200 dark:bg-gray-900 dark:border-emerald-800"
                      : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800"
                  }`}
                >
                  {mobileUrl ? (
                    <div className="relative">
                      <QRCodeSVG
                        value={mobileUrl}
                        size={200}
                        level="H"
                        className={`rounded-xl transition-all duration-500 ${
                          isVerified || isFailed || duplicateAccountPopup || isProcessing
                            ? "opacity-20 blur-md"
                            : "opacity-100"
                        }`}
                      />

                      {isProcessing && !isVerified && !isFailed && !duplicateAccountPopup && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          <div className="animate-spin w-12 h-12 border-4 border-[#3D405B] border-t-transparent dark:border-gray-400 dark:border-t-transparent rounded-full mb-3" />
                          <span className="font-bold text-gray-900 dark:text-white text-center text-sm px-2">
                            MyKad Images Received
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 text-center px-4 leading-normal">
                            Your MyKad images are being verified. This may take a few moments. Please do not close this window.
                          </span>
                        </div>
                      )}

                      {isVerified && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center shadow-md">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="mt-3 font-bold text-sm text-gray-900 dark:text-white">Verified Successfully</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-[200px] h-[200px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                  )}
                </div>

                {!isVerified && !isFailed && !duplicateAccountPopup && !isProcessing && (
                  <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0CA8E] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F0CA8E]" />
                    </span>
                    Waiting for MyKad scan...
                  </div>
                )}
              </div>
              
              <div className="mt-6 w-full">
                <button
                  onClick={handleNext}
                  disabled={!isVerified}
                  className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-xl shadow-theme-xs ${
                    isVerified
                      ? "bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-650"
                  }`}
                >
                  Continue
                </button>
                <div className="mt-4 text-center">
                  <p className="text-xs">
                    <span className="text-gray-500 dark:text-gray-450">Having trouble? </span>
                    <Link
                      href="/contact_support"
                      className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-350 transition-colors"
                    >
                      Contact Support
                    </Link>
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl flex gap-3 border transition-all backdrop-blur-sm bg-blue-50/80 border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/50">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      />
                    </svg>
                    <p className="text-xs leading-relaxed text-blue-900 dark:text-blue-100">
                      Your data is encrypted and processed securely. We only use this information for <span className="font-bold text-blue-700 dark:text-blue-300">mandatory identity verification</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-center">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
                MyKad Capture Guidelines
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                To pass mandatory identity verification, your MyKad capture must comply with the framing requirements below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> 
                <div className="flex flex-col border border-green-200 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-green-600 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-xs font-bold text-green-600">Fits Corner Guides</span>
                  </div>
                  
                  <div className="w-full h-32 bg-gray-50 dark:bg-gray-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-dashed border-green-200">
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-green-200"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-green-200"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-green-200"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-green-200"></div>

                    <div className="absolute inset-3 rounded-xl overflow-hidden flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/fake_mykad.jpg"
                          alt="Correctly framed MyKad sample"
                          fill
                          sizes="(max-width: 640px) 100vw, 200px"
                          className="object-contain"
                          priority
                        />
                      </div>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-green-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Align the front and back pages inside the guided frame on your mobile screen.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Ensure the camera is focused so the image is clear and readable.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col border border-red-200 rounded-2xl bg-rose-50/20 dark:bg-rose-950/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center text-xs font-bold">
                      ✕
                    </div>
                    <span className="text-xs font-bold text-red-600">Cropped / Blurry / Glare Spot</span>
                  </div>

                  <div className="w-full h-32 bg-gray-50 dark:bg-gray-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-dashed border-red-200">
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-200"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-200"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-200"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-200"></div>
                    
                    <div className="absolute -left-4 top-6 w-28 h-18 bg-amber-50 dark:bg-gray-800 rounded-xl p-1.5 shadow-sm rotate-[3deg]">
                      <Image
                        src="/images/fake_mykad.jpg"
                        alt="Incorrectly framed MyKad sample"
                        fill
                        sizes="(max-width: 640px) 100vw, 200px"
                        className="object-cover object-left blur-[0.5px]"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-bl from-white/90 via-white/20 to-transparent pointer-events-none" />
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full blur-md opacity-80 pointer-events-none" />
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-red-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>Avoid holding the camera too far away. Ensure the MyKad fills the center.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>Do not capture cropped, or blurry photos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>Avoid overhead light sources reflecting directly on the card surface or holographic text.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative mt-12 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}