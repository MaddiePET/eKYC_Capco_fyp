"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function CurrentMalaysianMobileFaceCapture() {
  const MAX_ATTEMPTS = 3;

  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);

  const [thresholdFailed, setThresholdFailed] = useState(false);
  const [thresholdMessage, setThresholdMessage] = useState("");

  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isUploadingFace, setIsUploadingFace] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const journeyId = searchParams.get("journeyId") || "";

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
    if (totalChecks === 0) return null;
    return Number(((passedChecks / totalChecks) * 100).toFixed(2));
  };

  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!journeyId) return;

      try {
        const res = await fetch(`/api/ekyc/status?journeyId=${journeyId}`);
        const data = await res.json();

        if (data.status === "face_failed") {
          setFailCount(MAX_ATTEMPTS);
          setErrorMessage("Too many failed attempts. Please refer to your desktop screen.");
        } else if (data.status === "face_verified") {
          setSuccess(true);
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    };

    checkInitialStatus();
  }, [journeyId]);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (failCount >= MAX_ATTEMPTS) return;

    const selfieFile = event.target.files?.[0];
    if (!selfieFile || !journeyId) return;

    const idCardUrl = localStorage.getItem("ekyc_id_image_url");
    if (!idCardUrl) {
      setErrorMessage("ID Document not found. Please rescan your MyKad first.");
      return;
    }

    setIsUploadingFace(true);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await fetch("/api/ekyc/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          status: "face_processing",
        }),
      });

      const fileExtension = selfieFile.name.split(".").pop();
      const fileName = `selfie_${journeyId}_${Date.now()}.${fileExtension}`;
      const filePath = `selfies/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("identity-docs")
        .upload(filePath, selfieFile, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("identity_documents")
        .insert({
          file_path: filePath,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Failed to track uploaded file:", dbError);
        throw dbError;
      }

      const { data: { publicUrl: selfiePublicUrl } } = supabase.storage
        .from("identity-docs")
        .getPublicUrl(filePath);

      setFaceImage(selfiePublicUrl);

      const faceApiRes = await fetch("/api/ekyc/okayface", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          selfieUrl: selfiePublicUrl,
          idCardUrl: idCardUrl
        })
      });
      const faceResult = await faceApiRes.json();

      if (faceResult.status === "success") {
        const liveApiRes = await fetch("/api/ekyc/okaylive", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journeyId,
            selfieUrl: selfiePublicUrl,
            idCardUrl,
          }) 
        });
        const liveResult = await liveApiRes.json();
        if (!liveApiRes.ok) throw new Error(liveResult.message || "OkayLive failed");

        const scorecardRes = await fetch(`/api/ekyc/scorecard?journeyId=${encodeURIComponent(journeyId)}`);
        const scorecardResult = await scorecardRes.json();
  
        if (!scorecardRes.ok || scorecardResult.status !== "success") {
          throw new Error(scorecardResult.error || "Scorecard check failed");
        }

        const scorecardList = scorecardResult.scorecardResultList as any[] | undefined;
        const hasFailedFacialVerification = scorecardList?.some((item) =>
          item.checkResultList?.some(
           (check: any) =>
             check.checkType === "facialVerification" &&
             check.checkStatus === "F"
          )
        );

        if (hasFailedFacialVerification) {
          throw new Error ("Face does not match the MyKad photo");
        }

        const score = calculateScorecardResult(scorecardResult);

        await fetch("/api/ekyc/status" , {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            journeyId,
            status:"face_verified",
            scorecard: scorecardResult,
          }),
        });

        if (score === null || score < SCORECARD_PASS_THRESHOLD) {
          setThresholdMessage(
            score === null 
            ? "No scorecard checks were found. Please proceed to the desktop page." 
            : `Your verification score is ${score}%, which is below the required threshold of ${SCORECARD_PASS_THRESHOLD}%. Please proceed to the desktop page.`
          );
          setThresholdFailed(true);
          return;
        }

        const cleanupRes = await fetch("/api/ekyc/purge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selfieUrl: selfiePublicUrl, idCardUrl }),
        });

        if (!cleanupRes.ok) {
          console.warn("Cleanup after scorecard returned non-ok:", cleanupRes.status);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        setSuccess(true);

      } else {
        throw new Error(faceResult.message || "Face could not be verified");
      }
    } catch (error: any) {
      setFaceImage(null);
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);
      const remaining = MAX_ATTEMPTS - newFailCount;
      const reason = error.message.toLowerCase();

      if (remaining > 0) {
        setErrorMessage(
          `Verification failed: ${reason}. You have ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.`
        );
        
        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journeyId, status: "face_failed_attempt" }),
        });
      } else {
        setErrorMessage(
          "Too many failed attempts. Please refer to your desktop screen."
        );

        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ 
            journeyId, 
            status: "face_failed" 
          }),
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsLoading(false);
      setIsUploadingFace(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 pt-24 pb-6 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
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

      <header className="absolute top-6 left-0 w-full px-8 flex justify-end items-center max-w-7xl mx-auto z-20">
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
      </header>

      <main className="relative w-full max-w-2xl z-10 flex flex-col items-center">
        {thresholdFailed || failCount >= MAX_ATTEMPTS ? (
          <div className="flex flex-col items-center w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 mb-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-md">
              <svg 
                className="w-10 h-10" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="3" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {thresholdFailed ? thresholdMessage : "Too many failed attempts. Please refer to your desktop screen."}
              </p>
            </div>

            <div className="w-full max-w-xs py-3 px-4 rounded-xl border backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600">
              <p className="font-semibold text-sm text-center text-gray-900 dark:text-gray-100">
                You may now close this window and return to your desktop screen to restart.
              </p>
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 mb-6 bg-green-100 text-green-500 rounded-full flex items-center justify-center shadow-md">
              <svg 
                className="w-10 h-10" 
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

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Scan Successful!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your face has been securely matched with your MyKad.
              </p>
            </div>

            <div className="w-full max-w-xs py-3 px-4 rounded-xl border backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600">
              <p className="font-semibold text-sm text-center text-gray-900 dark:text-gray-100">
                You may now close this window and return to your desktop screen to continue.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="mb-6 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Verify Your Face
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please position your face clearly in the frame.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 w-full p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium shadow-sm">
                {errorMessage}
              </div>
            )}

            {isUploadingFace && !success && !errorMessage && (
              <div className="mb-4 w-full max-w-xs rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm flex flex-col items-center">
                <p className="text-sm font-semibold text-center">Face Image Received</p>
                <p className="mt-1 text-xs leading-5 text-emerald-800 text-center">
                  Your face image is being verified. This may take a few moments. Please do not close this window.
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              capture="user"
              ref={fileInputRef}
              onChange={handleCapture}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || failCount >= MAX_ATTEMPTS}
              className={`w-full max-w-xs py-3 px-4 rounded-xl flex items-center justify-between border transition-all backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600 ${
                isLoading || failCount >= MAX_ATTEMPTS
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                  : "hover:bg-white hover:border-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800/60"
              }`}
            >
              <span className="font-semibold text-sm">
                {isUploadingFace 
                  ? "Verifying" 
                  : faceImage 
                  ? "Verified" 
                  : failCount > 0 
                  ? "Try Again" 
                  : "Open Camera"}
              </span>

              {isLoading ? (
                <div className="animate-spin w-6 h-6 border-4 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300 rounded-full" />
              ) : (
                <svg 
                  className="w-6 h-6 text-[#3D405B] dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.5" 
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.5" 
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" 
                  />
                </svg>
              )}
            </button>
          </div>
        )}

        <section className="mt-4 w-full max-w-md mx-auto relative z-10">
          <div className="text-center">
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
            <div className="p-4 rounded-xl flex gap-3 border transition-all backdrop-blur-sm bg-amber-50/80 border-amber-200 dark:bg-amber-900/20 dark:border-amber-500/40">
              <svg 
                className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>

              <div className="text-xs leading-relaxed text-amber-900 dark:text-amber-100">
                <p className="font-bold mb-1 text-amber-800 dark:text-amber-300">
                  Important Notice:
                </p> 
                <ul className="list-disc ml-4 space-y-1">
                  <li>Ensure mobile and desktop tabs are open.</li>
                  <li>Ensure your internet connection is fast and stable.</li>
                  <li>Ensure your entire face is clearly within the frame and in focus.</li>
                  <li>Ensure you are not wearing a hat, glasses, or a mask for the best accuracy.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-500 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}