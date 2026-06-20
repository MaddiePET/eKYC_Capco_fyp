"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function SavingsNonMalaysianMobilePassportCapture() {
  const MAX_ATTEMPTS = 3;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [passportImage, setPassportImage] = useState<string | null>(null);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failCount, setFailCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const journeyId = searchParams.get("journeyId") || "";

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
          setDuplicateMessage("This Passport is already registered for a savings account.");
        } else if (data.status === "verified") {
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

    const file = event.target.files?.[0];
    if (!file || !journeyId) return;

    setIsUploadingPassport(true);
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

      const fileExtension = file.name.split(".").pop();
      const fileName = `passport_${journeyId}_${Date.now()}.${fileExtension}`;
      const filePath = `passports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("identity-docs")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;
      
      // Track uploaded file for cleanup
      const { error: dbError } = await supabase
        .from("identity_documents")
        .insert({
          file_path: filePath,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Failed to track uploaded file:", dbError);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("identity-docs")
        .getPublicUrl(filePath);

      setPassportImage(publicUrl);

      const okayidResponse = await fetch("/api/ekyc/okayid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          supabaseImageUrl: publicUrl,
        }),
      });

      const okayidResult = await okayidResponse.json();

      const passportNo =
        okayidResult?.extracted?.passport_no ||
        okayidResult?.passport_no ||
        okayidResult?.data?.passport_no ||
        "";

      if (!passportNo) {
        throw new Error("Passport number could not be extracted");
      }

      if (okayidResult.status !== "success") {
        throw new Error(okayidResult.message || "unrecognized");
      }

      const okaydocResponse = await fetch("/api/ekyc/okaydoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          type: "passport",
          country: okayidResult.country || "OTHER",
          imageUrl: publicUrl,
          fullSizeImageUrl: publicUrl
        }),
      });

      const okaydocResult = await okaydocResponse.json();

      if (okaydocResult.status !== "success") {
        throw new Error("not meeting quality standards");
      }
      
      const identityRes = await fetch(
        `/api/identity/lookup?id_type=passport&id_num=${encodeURIComponent(passportNo)}`
      );
      const identityData = await identityRes.json();

      if (!identityRes.ok || !identityData.success) {
        throw new Error("Identity was not found in government records");
      }

      const accountCheckRes = await fetch("/api/application/check_existing_savings_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_num: passportNo }),
      });

      if (accountCheckRes.status === 409) {
        const checkData = await accountCheckRes.json();
        
        setIsDuplicate(true);
        setDuplicateMessage(checkData.error || "This Passport is already registered for a savings account.");

        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journeyId,
            status: "duplicate",
            id_type: "passport",
            id_num: passportNo,
          }),
        });

        setIsLoading(false);
        return;
      } else if (!accountCheckRes.ok) {
        throw new Error("Failed to verify existing account status");
      }

      localStorage.setItem("ekyc_id_image_url", publicUrl);
      
      await fetch("/api/ekyc/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyId,
          status: "verified",
          id_type: "passport",
          id_num: passportNo,
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
        setErrorMessage(
          `Verification failed: ${reason}. You have ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.`
        );
        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journeyId,
            status: "failed_attempt",
          }),
        });
      } else {
        setErrorMessage("Too many failed attempts. Please refer to your desktop screen.");

        await fetch("/api/ekyc/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journeyId,
            status: "failed",
          }),
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploadingPassport(false);
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
                Your Passport has been securely verified.
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
                Verify Your Passport
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please take a clear photo of your Passport bio-data page for verification.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 w-full max-w-xs p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium shadow-sm">
                {errorMessage}
              </div>
            )}

            {isUploadingPassport && !success && !errorMessage && (
              <div className="mb-4 w-full max-w-xs rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm flex flex-col items-center">
                <p className="text-sm font-semibold text-center">Passport Image Received</p>
                <p className="mt-1 text-xs leading-5 text-emerald-800 text-center">
                  Your Passport image is being verified. This may take a few moments. Please do not close this window.
                </p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              capture="environment"
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
                {isUploadingPassport
                  ? "Verifying"
                  : passportImage
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
                  <li>Ensure the MRZ code (bottom two lines) is clearly visible.</li>
                  <li>Avoid fingers or shadows covering any information.</li>
                  <li>Do not hold the passport too far away — ensure the entire passport is clearly within the frame.</li>
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