"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

import ChevronLeftIcon from "@/icons/chevron-left.svg";

export default function CurrentMalaysianFaceQRCode() {
  const router = useRouter();

  const [mobileUrl, setMobileUrl] = useState<string>("");
  const [journeyId, setJourneyId] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [hostWarning, setHostWarning] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState("");

  const searchParams = useSearchParams();

  const SCORECARD_PASS_THRESHOLD = 70;

  const calculateScorecardResult = (scorecard: any) => {
    const scorecardLists = scorecard?.scorecardResultList || [];

    let totalChecks = 0;
    let passedChecks = 0;

    for (const scorecardItem of scorecardLists) {
      const checks = scorecardItem.checkResultList || [];

      for (const check of checks) {
        totalChecks++;

        if (check.checkStatus === "P") {
          passedChecks++;
        }
      }
    }

    if (totalChecks === 0) {
      return null;
    }

    return Number(((passedChecks / totalChecks) * 100).toFixed(2));
  };

  useEffect(() => {
    const jId = searchParams.get("journeyId") || localStorage.getItem("journeyId");

    if (!jId) {
      console.error("Journey ID missing");
      return;
    }
    
    setJourneyId(jId);

    if (!localStorage.getItem("journeyId")) {
      localStorage.setItem("journeyId", jId);
    }

    const origin = window.location.origin;
    const targetUrl = `${origin}/current/malaysian/face_verification/mobile?journeyId=${jId}`;

    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      setHostWarning(
        "This app is loaded from localhost, which is not reachable from your phone. Open the app from your local network IP or tunnel URL and refresh."
      );
    }

    setMobileUrl(targetUrl);

    const checkStatus = setInterval(async () => {
      try {
        const res = await fetch(`/api/ekyc/status?journeyId=${jId}`);
        const data = await res.json();

        if (data.status === "face_verified") {
          const scorecardResult = calculateScorecardResult(data.scorecard);

          if (scorecardResult === null) {
            setVerificationError("No scorecard checks were found. Please restart verification.");
            setIsFailed(true);
            clearInterval(checkStatus);
            return;
          }

          if (scorecardResult < SCORECARD_PASS_THRESHOLD) {
            setVerificationError(
              `Your eKYC verification score is ${scorecardResult}%, which is below the required threshold of ${SCORECARD_PASS_THRESHOLD}%. Please restart verification.`
            );

            setIsFailed(true);
            clearInterval(checkStatus);
            return;
          }

          setIsVerified(true);
          clearInterval(checkStatus);
        } else if (data.status === "face_failed") {
          setVerificationError("Face verification failed after multiple attempts. Please restart verification.");
          setIsFailed(true);
          clearInterval(checkStatus);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    }, 3000);

    return () => clearInterval(checkStatus);
  }, [searchParams]);

  const handleNext = () => {
    if (isVerified) {
      router.push(
        `/current/malaysian/otp?journeyId=${encodeURIComponent(journeyId || "")}`
      );
    }
  };

  const handleBack = () => {
    router.push(`/current/malaysian/mykad?journeyId=${encodeURIComponent(journeyId || "")}`);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
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
              Verification Not Approved
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {verificationError || "Face verification failed after multiple attempts. Please return to the home page to restart."}            
            </p>

            <button
              onClick={() => router.push("/current/malaysian/mykad")}
              className="w-full py-3 px-4 bg-[#3D405B] text-white font-bold rounded-xl hover:bg-[#2c2f42] transition-colors"
            >
              Restart Verification
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
      </header>

      <main className="relative w-full max-w-2xl z-10">
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            Scan Your Face
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Open your mobile phone camera and scan the QR code below to securely capture a selfie.
          </p>
        </div>

        {hostWarning && (
          <div className="mb-6 w-full max-w-md mx-auto p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium shadow-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 whitespace-pre-line">
            {hostWarning}
          </div>
        )}

        <section className="flex flex-col items-center justify-center mb-8">
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className={`p-6 rounded-3xl shadow-xl border transition-all duration-500 ${
                isVerified
                  ? "border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20"
                  : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800"
              }`}
            >
              {mobileUrl ? (
                <div className="relative">
                  <QRCodeSVG
                    value={mobileUrl}
                    size={220}
                    level="H"
                    className={`rounded-xl transition-all duration-500 ${
                      isVerified || isFailed ? "opacity-30 blur-sm" : "opacity-100"
                    }`}                  
                  />
                  {isVerified && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="w-20 h-20 mb-6 bg-green-100 text-green-500 rounded-full flex items-center justify-center shadow-md">
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

                      <span className="mt-3 font-bold text-gray-900 dark:text-white">Verified Successfully!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-[220px] h-[220px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
              )}
            </div>

            {!isVerified && !isFailed && (
              <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0CA8E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F0CA8E]" />
                </span>

                Waiting for Face scan...
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 w-full max-w-md mx-auto relative z-10">
          <button
            onClick={handleNext}
            disabled={!isVerified}
            className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs relative z-10 ${
              isVerified
                ? "bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            Continue
          </button>

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

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl flex gap-3 border transition-all backdrop-blur-sm bg-blue-50/80 border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/50">
              <svg 
                className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
              
              <p className="text-xs leading-relaxed text-blue-900 dark:text-blue-100">
                Your biometric data is encrypted and processed securely. We only use this information for <span className="font-bold text-blue-700 dark:text-blue-300">mandatory identity verification</span>.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}