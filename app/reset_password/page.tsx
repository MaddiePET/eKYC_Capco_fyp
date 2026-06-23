"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import EyeCloseIcon from "@/icons/eye-close.svg";
import EyeIcon from "@/icons/eye.svg";
import Label from "@/components/form/Label";

type Step = "request" | "otp" | "reset" | "success";
type MessageType = "success" | "error" | "";

export default function ResetPassword() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("request");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [expectedEmail, setExpectedEmail] = useState(""); // Holds the real email from the DB
  const [isValidating, setIsValidating] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (username.length < 5) {
      setIsUsernameValid(null);
      setExpectedEmail("");
      return;
    }

    setIsUsernameValid(null);

    const delayDebounceFn = setTimeout(async () => {
      setIsValidating(true);
      setMessage("");
      setMessageType("");

      try {
        const res = await fetch(`/api/users/${username}`);
        const isValid = res.ok;
        setIsUsernameValid(isValid);

        if (isValid) {
          const user = await res.json();
          setExpectedEmail(user.email || "");
          setMessage("");
          setMessageType("");
        } else {
          setExpectedEmail("");
          setMessage("Username not found. Please try again.");
          setMessageType("error");
        }
      } catch {
        setIsUsernameValid(false);
        setExpectedEmail("");
        setMessage("Username not found. Please try again.");
        setMessageType("error");
      } finally {
        setIsValidating(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [username]);

  const isPasswordValid = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}/.test(newPassword);

  const score =
    (newPassword.length >= 8 ? 1 : 0) +
    (/[0-9]/.test(newPassword) ? 1 : 0) +
    (/[A-Z]/.test(newPassword) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0);

  const getPasswordStrength = (): string => {
    if (newPassword.length === 0) return "";
    if (score <= 1) return "Weak";
    if (score === 2) return "Medium";
    if (score === 3) return "Strong";
    return "Very Strong";
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    // Verify if typed email matches the database email
    if (email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()) {
      setMessage("The entered email does not match our records for this username.");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", username, email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send OTP.");
      }

      setStep("otp");
      setTimer(60);
      setMessage("OTP sent successfully. Please check your email.");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join("");
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", email, otp: enteredOtp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid OTP. Please try again.");
      }

      setStep("reset");
      setMessage("Email verified successfully. You can now reset your password.");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
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
      if (cleanValue && index < 5) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (index + i < 6) {
        newOtp[index + i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    const nextFocusIndex = Math.min(index + pastedData.length, 5);
    otpInputs.current[nextFocusIndex]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    if (!isPasswordValid) {
      setMessage("Password does not meet the security requirements.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          username,
          newPassword,
          email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password.");
      }

      setStep("success");
      setMessage("");
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] bg-[#F9FAFB] dark:bg-gray-950" />
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
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
            d="M0,224L34.3,192C68.6,160,137,96,206,90.7C274.3,85,343,139,411,144C480,149,549,107,617,122.7C685.7,139,754,213,823,240C891.4,267,960,245,1029,224C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320L0,320Z"
          />
        </svg>
      </div>

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto z-20 w-full">
        {step !== "success" ? (
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setMessageType("");
              if (step === "reset") setStep("otp");
              else if (step === "otp") setStep("request");
              else router.push("/login");
            }}
            className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </button>
        ) : (
          <div />
        )}

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
        {step === "request" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Reset Password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please enter your username and registered email address to verify your identity.
              </p>
            </div>

            {message && (
              <div
                className={`mb-4 w-full p-3 rounded-lg border text-xs text-center font-medium shadow-sm ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Username<span className="text-error-500">*</span>
                </Label>
                
                <div className="relative w-full">
                  <input
                    placeholder="Enter your username"
                    type="text"
                    value={username}
                    required
                    className={`w-full px-4 py-2.5 pr-10 text-sm transition-all bg-white border-2 rounded-xl outline-none dark:bg-gray-900/90 dark:text-white dark:placeholder-gray-400 ${
                      isUsernameValid === true
                        ? "border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:border-green-500 dark:focus:border-green-500"
                        : "border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:border-[#5c6185] dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                    }`}
                    onChange={(e) => {
                      const cleanedValue = e.target.value
                        .replace(/[^a-zA-Z0-9]/g, "")
                        .replace(/^./, (c) => c.toUpperCase());
                      setUsername(cleanedValue);
                      setMessage("");
                      setMessageType("");
                    }}
                  />
                  {isUsernameValid === true && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">
                      ✓
                    </span>
                  )}
                  {isValidating && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-400 border-t-[#3D405B] rounded-full animate-spin"></div>
                  )}
                </div>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Email Address<span className="text-error-500">*</span>
                </Label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  required
                  className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none dark:bg-gray-900/90 dark:text-white dark:placeholder-gray-400 border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:border-[#5c6185] dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage("");
                    setMessageType("");
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  isValidating ||
                  isUsernameValid !== true ||
                  !username ||
                  !email
                }
                className={`inline-flex items-center justify-center w-full max-w-md px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs ${
                  !isLoading &&
                  !isValidating &&
                  isUsernameValid === true &&
                  username &&
                  email
                    ? "bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                }`}
              >
                {isLoading ? "Sending Code..." : "Send Code"}
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Verify Your Email
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We've sent a 6-digit code to <span className="font-bold text-gray-900 dark:text-white">{email}</span>. Please provide the code to proceed.
              </p>
            </div>

            {message && (
              <div
                className={`mb-4 w-full p-4 rounded-lg border text-xs text-center font-medium shadow-sm ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    ref={(el) => {
                      otpInputs.current[index] = el;
                    }}
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(e.target.value, index)
                    }
                    onPaste={(e) => handleOtpPaste(e, index)}
                    onKeyDown={(e) =>
                      handleOtpKeyDown(e, index)
                    }
                    className="w-12 h-14 text-center text-xl font-bold transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={otp.join("").length < 6 || isLoading}
                className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs ${
                  otp.join("").length === 6
                    ? "bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </form>

            <div className="text-center mt-6">
              {timer > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Resend code in <span className="font-bold text-blue-600 dark:text-blue-400">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                >
                  Resend Code
                </button>
              )}
            </div>
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

            {message && (
              <div
                className={`mb-4 w-full p-4 rounded-lg border text-xs text-center font-medium shadow-sm ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-600"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  New Password<span className="text-error-500">*</span>
                </Label>

                <div className="relative">
                  <input
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value.replace(/\s/g, ""))
                    }
                    required
                  />
                  <span
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute z-30 cursor-pointer -translate-y-1/2 right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="w-5 h-5 fill-gray-500" />
                    ) : (
                      <EyeCloseIcon className="w-5 h-5 fill-gray-500" />
                    )}
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
                  <div
                    className={`h-full transition-all duration-500 ${
                      newPassword.length === 0
                        ? "w-0"
                        : score <= 1
                        ? "w-1/4 bg-red-500"
                        : score === 2
                        ? "w-2/4 bg-yellow-500"
                        : score === 3
                        ? "w-3/4 bg-blue-400"
                        : "w-full bg-green-500"
                    }`}
                  />
                </div>

                <p
                  className={`text-[10px] mt-1 italic font-bold uppercase transition-colors ${
                    score <= 1
                      ? "text-red-500"
                      : score === 2
                      ? "text-yellow-600"
                      : score === 3
                      ? "text-blue-400"
                      : "text-green-500"
                  }`}
                >
                  {getPasswordStrength()}
                </p>
              </div>

              <div>
                <Label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Confirm Password<span className="text-error-500">*</span>
                </Label>
                <input
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value.replace(/\s/g, ""))
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className={`inline-flex items-center justify-center w-full max-w-md px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs ${
                  newPassword &&
                  isPasswordValid &&
                  newPassword === confirmPassword &&
                  !isLoading
                    ? "bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                }`}
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
            <p className="mb-2 text-sm text-gray-500">
              We've sent a confirmation email to
            </p>
            <p className="mb-6 font-bold text-blue-700 dark:text-blue-400">
              {email}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
            >
              Finish
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 text-center z-10">
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