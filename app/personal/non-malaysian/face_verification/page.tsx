"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

type ScanStatus = "idle" | "scanning" | "success" | "error";

export default function PersonalNonMalaysianFaceVerification() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanInstruction, setScanInstruction] = useState("Slowly rotate your head 360°");

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      streamRef.current = stream;
      setErrorMessage(null);
      setStatus("idle");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      
      setStatus("error");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera access denied. Please allow camera access in your browser settings.");
      } else {
        setErrorMessage("Could not connect to camera.");
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    startCamera();
    
    return () => {
      isMountedRef.current = false;
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      stopCamera();
    };
  }, []);

  const handleStartScan = () => {
    if (status === "error") return;
    setStatus("scanning");
    setProgress(0);
    
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    
    scanIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 1;

        if (nextProgress < 25) setScanInstruction("Slowly turn your head left");
        else if (nextProgress < 50) setScanInstruction("Slowly turn your head right");
        else if (nextProgress < 75) setScanInstruction("Look up and down");
        else setScanInstruction("Finalizing scan...");

        if (nextProgress >= 100) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          setStatus("success");
          stopCamera(); 
          return 100;
        }
        return nextProgress;
      });
    }, 60);
  };

  const handleRetake = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(null);
    startCamera(); 
  };

  const handleBack = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    stopCamera();
    router.push("/personal/non-malaysian/phone");
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

      <div className="relative w-full max-w-md animate-in fade-in duration-500 z-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md whitespace-nowrap">
            {status === "success" ? "Verification Successful" : "Verify Your Face"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {status === "success" 
              ? "Verification complete! You can now proceed." 
              : "Position your face in the center and follow the 360° rotation prompts."}
          </p>
        </div>

        <div className={`relative mb-8 overflow-hidden aspect-square rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${status === "error" ? "border-red-500 ring-4 ring-red-500/10" : "border-[#F0CA8E] bg-white/90 shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20"} flex items-center justify-center`}>
          {status === "error" ? (
            <div className="px-6 text-center">
              <div className="flex justify-center mb-4 text-red-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{errorMessage}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`object-cover w-full h-full bg-black ${status === "success" ? "hidden" : "opacity-100"}`}
            />
          )}

          {status === "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <svg className="absolute w-[85%] h-[85%] -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  stroke="#F0CA8E"
                  strokeWidth="8"
                  fill="transparent"
                  pathLength="100"
                  strokeDasharray="100" 
                  strokeDashoffset={100 - progress}
                  strokeLinecap="round"
                  className="transition-all duration-150 ease-linear"
                />
              </svg>

              <div className="z-20 p-6 text-center">
                <p className="mb-2 text-xl font-bold text-white drop-shadow-md">{progress}%</p>
                <p className="px-4 py-2 text-xs font-semibold text-white uppercase tracking-wider bg-[#3D405B] rounded-full">
                  {scanInstruction}
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <div className="p-4 mb-4 bg-green-100 rounded-full dark:bg-green-900/30">
                  <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-gray-800 dark:text-white">Face Captured</p>
              </div>
            </div>
          )}

          {status === "idle" && (
            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-white/60 rounded-full" />
            </div>
          )}
        </div>

        <div className="space-y-3 relative z-10">
          {(status === "idle" || status === "error") && (
            <button onClick={handleStartScan} disabled={status === "error"} className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs relative z-10 bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]">
              Start Face Scan
            </button>
          )}

          {status === "scanning" && (
            <button disabled className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs relative z-10 bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600">
              Capturing Face...
            </button>
          )}

          {status === "success" && (
            <>
              <button onClick={() => router.push("/personal/non-malaysian/application")} className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs relative z-10 bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]">
                Continue
              </button>
              <button onClick={handleRetake} className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900">
                Retake Photo
              </button>
            </>
          )}
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm font-normal">
            <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
            <Link href="/support" className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Contact Support
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-4">
            <div className="p-4 rounded-xl flex gap-3 border transition-all bg-amber-50/80 backdrop-blur-sm border-amber-200 dark:bg-amber-900/20 dark:border-amber-500/40">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-100">
                  <p className="font-bold mb-1 text-amber-800 dark:text-amber-300">Important Notice:</p>
                  <p>Ensure you are not wearing a hat, glasses, or a mask for the best accuracy.</p>
                </div>
            </div>

            <div className="p-4 rounded-xl flex gap-3 border transition-all bg-blue-50/80 backdrop-blur-sm border-blue-200 dark:bg-blue-900/30 dark:border-blue-500/50">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <p className="text-xs leading-relaxed text-blue-900 dark:text-blue-100">Your biometric data is encrypted and processed securely for <span className="font-bold text-blue-700 dark:text-blue-300">identity verification</span> only.</p>
            </div>
        </div>
      </div>

      <p className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </p>
    </div>
  );
}