"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";

export default function CurrentMalaysianMobileMyKadCapture() {
  const MAX_ATTEMPTS = 3;

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [uploadingSide, setUploadingSide] = useState<"front" | "back" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();

  const journeyId = searchParams.get('journeyId');
  
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!journeyId) return;
      try {
        const res = await fetch(`/api/ekyc/status?journeyId=${journeyId}`);
        const data = await res.json();
        
        if (data.status === "failed") {
          setFailCount(MAX_ATTEMPTS);
          setErrorMessage("Too many failed attempts. Please refer to your desktop screen.");
        } else if (data.status === "duplicate") {
          setIsDuplicate(true);
          setDuplicateMessage("You already have an existing current account with this MyKad.");
        } else if (data.status === "verified") {
          setSuccess(true);
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    };

    checkInitialStatus();
  }, [journeyId]);

  useEffect(() => {
    if (!journeyId) {
      alert("Invalid link. Please scan the QR code again from your desktop.");
    }
  }, [journeyId]);

  function extractMyKadNumber(okayIdResult: any) {
    const extractedNumber =
      okayIdResult?.extracted?.passport_no ||
      okayIdResult?.extracted?.id_no ||
      okayIdResult?.extracted?.id_num ||
      okayIdResult?.extracted?.ic_no;

    if (extractedNumber) return extractedNumber;

    const fields =
      okayIdResult?.result?.[0]?.ListVerifiedFields?.pFieldMaps || [];

    const idField = fields.find(
      (field: any) => field.FieldType === 2 || field.wFieldType === 2
    );

    return idField?.Field_Visual || idField?.Field_MRZ || "";
  }

  const handleVerification = useCallback(async (fImgUrl: string, bImgUrl: string) => {
    if (!journeyId || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await fetch("/api/ekyc/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          status: "processing",
        }),
      });

      const frontIdRes = await fetch("/api/ekyc/okayid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          journeyId, 
          supabaseImageUrl: fImgUrl 
        }),
      });

      const frontIdData = await frontIdRes.json();
      if (frontIdData.status !== "success") {
        throw new Error(frontIdData.message || "unrecognized");
      }

      const frontDocRes = await fetch("/api/ekyc/okaydoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          type: "nonpassport",
          imageUrl: fImgUrl,
          isBack: false,
        }),
      });

      const frontDocData = await frontDocRes.json();
      if (frontDocData.status !== "success") {
        throw new Error(frontDocData.message || "not meeting quality standards");
      }

      const backDocRes = await fetch("/api/ekyc/okaydoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          type: "nonpassport",
          imageUrl: bImgUrl,
          isBack: true,
        }),
      });

      const backDocData = await backDocRes.json();

      if (backDocData.status !== "success") {
        throw new Error(backDocData.message || "not meeting quality standards");
      }

      const icNo = extractMyKadNumber(frontIdData);

      if (!icNo) {
        throw new Error("IC number could not be extracted");
      }

      const identityRes = await fetch(
        `/api/identity/lookup?id_type=ic&id_num=${encodeURIComponent(icNo)}`
      );
      const identityData = await identityRes.json();

      if (!identityRes.ok || !identityData.success) {
        throw new Error(
          "Identity was not found in government records"
        );
      }

      const accountCheckRes = await fetch("/api/application/check_existing_current_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_num: icNo }),
      });

      if (accountCheckRes.status === 409) {
        const checkData = await accountCheckRes.json();
        setIsDuplicate(true);
        setDuplicateMessage(checkData.error || "You already have an existing current account with this MyKad.");

        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journeyId,
            status: "duplicate",
            id_type: "ic",
            id_num: icNo,
          }),
        });

        setIsLoading(false);
        return;
      } else if (!accountCheckRes.ok) {
        throw new Error("Failed to verify existing account status");
      }

      localStorage.setItem("ekyc_id_image_url", fImgUrl);

      await fetch("/api/ekyc/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          status: "verified",
          id_type: "ic",
          id_num: icNo,
        }),
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess(true);

    } catch (error: any) {
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);

      const remaining = MAX_ATTEMPTS - newFailCount;
      const reason = error.message.toLowerCase();

      if (remaining > 0) {
        setErrorMessage(`Verification failed: ${reason}. You have ${remaining} attempt${remaining > 1 ? 's' : ''} left.`);
        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journeyId, status: "failed_attempt" })
        });
      } else {
        setErrorMessage(`Too many failed attempts. Please refer to your desktop screen.`);
        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ journeyId, status: "failed" })
        });
      }

      setFrontImage(null);
      setBackImage(null);
      if (frontInputRef.current) frontInputRef.current.value = "";
      if (backInputRef.current) backInputRef.current.value = "";
    } finally {
      setIsLoading(false);
    }
  }, [journeyId, failCount, isLoading]);

  useEffect(() => {
    if (frontImage && backImage && !isLoading && !success && !isDuplicate && failCount < MAX_ATTEMPTS) {
      handleVerification(frontImage, backImage);
    }
  }, [frontImage, backImage, handleVerification, isLoading, success, isDuplicate, failCount]);

  const handleCapture = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    if (failCount >= MAX_ATTEMPTS) return;

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSide(type);
      setIsLoading(true);
      
      const fileExtension = file.name.split(".").pop();
      const fileName = `current_${type}_mykad_${journeyId}_${Date.now()}.${fileExtension}`;
      const filePath = `mykad/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("identity-docs")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("identity-docs")
        .getPublicUrl(filePath);

      if (type === 'front') setFrontImage(publicUrl);
      else setBackImage(publicUrl);

    } catch (e: any) {
      console.error("Supabase storage sync failed:", e.message);
      setErrorMessage("Network asset upload error. Please snap the picture again.");
    } finally {
      setUploadingSide(null);
      setIsLoading(false);
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
        {isDuplicate ? (
          <div className="flex flex-col items-center w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 mb-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-4xl font-bold">!</span>
            </div>

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Already Exists
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {duplicateMessage}
              </p>
            </div>

            <div className="w-full max-w-xs py-3 px-4 rounded-xl border backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600">
              <p className="font-semibold text-sm text-center text-gray-900 dark:text-gray-100">
                You may now close this window and proceed to your desktop screen to log in.
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
                Your MyKad has been securely verified.
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
                Verify Your MyKad
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please take clear photos of your MyKad (front and back) for verification.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 w-full max-w-xs p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium shadow-sm">
                {errorMessage}
              </div>
            )}

            {(frontImage || backImage) && !success && !errorMessage && (
              <div className="mb-4 w-full max-w-xs rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm flex flex-col items-center">
                <p className="text-sm font-semibold text-center">
                  {frontImage && backImage ? "MyKad Images Received" : "MyKad Photo Captured"}
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800 text-center">
                  {frontImage && backImage 
                    ? "Your MyKad images are being verified. This may take a few moments. Please do not close this window."
                    : "Please capture the remaining side to begin verification."
                  }
                </p>
              </div>
            )}

            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={frontInputRef} 
              onChange={(e) => handleCapture(e, 'front')} 
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={backInputRef} 
              onChange={(e) => handleCapture(e, 'back')} 
              className="hidden" 
            />

            <div className="w-full space-y-4 max-w-xs">
              <button
                onClick={() => frontInputRef.current?.click()}
                disabled={isLoading || failCount >= MAX_ATTEMPTS}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border transition-all backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600 
                  ${frontImage ? 'ring-1 shadow-sm' : 'border-gray-300 dark:border-gray-600'}
                  ${isLoading || failCount >= MAX_ATTEMPTS
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                  : "hover:bg-white hover:border-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800/60"
                }`}
              >
                <span className="font-semibold text-sm">
                  {isLoading && frontImage && backImage 
                    ? "Verifying..." 
                    : uploadingSide === 'front'
                    ? "Uploading..."
                    : frontImage
                    ? "Uploaded"
                    : failCount > 0 && failCount < MAX_ATTEMPTS
                    ? "Try Again (Front)"
                    : "Capture Front"}
                </span>
                {uploadingSide === 'front' || (isLoading && frontImage && backImage) ? (
                  <div className="animate-spin w-6 h-6 border-4 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300 rounded-full" />
                ) : (
                  <svg 
                    className={`w-6 h-6 ${frontImage ? 'text-[#3D405B]' : 'text-[#3D405B] dark:text-gray-300'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => backInputRef.current?.click()}
                disabled={isLoading || failCount >= MAX_ATTEMPTS}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border transition-all backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600
                  ${backImage ? 'ring-1 shadow-sm' : 'border-gray-300 dark:border-gray-600'}
                  ${isLoading || failCount >= MAX_ATTEMPTS
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                  : "hover:bg-white hover:border-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800/60"
                }`}
              >
                <span className="font-semibold text-sm">
                  {isLoading && frontImage && backImage 
                    ? "Verifying..." 
                    : uploadingSide === 'back'
                    ? "Uploading..."
                    : backImage
                    ? "Uploaded"
                    : failCount > 0 && failCount < MAX_ATTEMPTS
                    ? "Try Again (Back)"
                    : "Capture Back"}
                </span>
                {uploadingSide === 'back' || (isLoading && frontImage && backImage) ? (
                  <div className="animate-spin w-6 h-6 border-4 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300 rounded-full" />
                ) : (
                  <svg 
                    className={`w-6 h-6 ${backImage ? 'text-[#3D405B]' : 'text-[#3D405B] dark:text-gray-300'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                )}
              </button>
            </div>
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
                  <li>Ensure all details are clearly visible and not cut off.</li>
                  <li>Information is not obscured by fingers or shadows.</li>
                  <li>Do not hold the MyKad too far away — ensure the entire card is clearly within the frame.</li>
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