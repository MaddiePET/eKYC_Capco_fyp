"use client";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import EyeCloseIcon from "@/icons/eye-close.svg";
import EyeIcon from "@/icons/eye.svg";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Mock user data - in real app, this would come from an API
const mockUsers = [
  {
    email: "john.doe@gmail.com",
    name: "John Doe",
    avatar: "/images/user/user-01.jpg",
    securityPhrase: "My first pet's name",
    password: "pw123",
  },
  {
    email: "gogo.sdnbhd@yahoo.com",
    name: "GoGo Sdn Bhd",
    avatar: "/images/user/user-02.jpg",
    securityPhrase: "My favorite drink",
    password: "pw123",
  },
];

export default function LogInForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "confirm" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<typeof mockUsers[0] | null>(null);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setStep("confirm");
    } else {
      alert("Email not found. Please try again.");
    }
  };

  const handleConfirmYes = () => {
    setStep("password");
  };

  const handleConfirmNo = () => {
    setStep("email");
    setEmail("");
    setCurrentUser(null);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && password === currentUser.password) {
      // Save user info to localStorage
      localStorage.setItem("currentAccount", currentUser.name);
      // Redirect to dashboard
      router.push("/");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setEmail("");
    setPassword("");
    setCurrentUser(null);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
      {/* Persistent top navigation back to dashboard */}
      <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
        {/* Logo at top-right */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo/logo-dark.svg"
            alt="Logo"
            width={60}
            height={40}
            className="dark:hidden"
          />
          <Image
            src="/images/logo/logo-light.svg"
            alt="Logo"
            width={60}
            height={40}
            className="hidden dark:block"
          />
          <h1 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            DTCOB
          </h1>
        </div>
      </div>
      <div className="w-full max-w-md">
        <div>
          {/* Email Step */}
          {step === "email" && (
            <>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Log In
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email to continue
                </p>
              </div>
              <div>
                <form onSubmit={handleEmailSubmit}>
                  <div className="space-y-6">
                    <div>
                      <Label>
                        Email <span className="text-error-500">*</span>
                      </Label>
                      <input
                        className="w-full px-4 py-3 text-sm transition-colors border rounded-lg outline-none border-gray-300 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="info@gmail.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition w-full px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </form>

                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Confirmation Step */}
          {step === "confirm" && currentUser && (
            <>
              <div className="mb-5 sm:mb-8">
                <button
                  onClick={handleBackToEmail}
                  className="inline-flex items-center mb-6 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <ChevronLeftIcon />
                  Back
                </button>
              </div>
              <div className="mb-8 text-center">
                <h1 className="mb-6 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Is this you?
                </h1>
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-brand-500/20">
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {currentUser.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <div className="p-4 mb-6 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                    {currentUser.securityPhrase}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Button onClick={handleConfirmYes} className="w-full" size="sm">
                  Yes, that&apos;s me
                </Button>
                <Button
                  onClick={handleConfirmNo}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  No, use different account
                </Button>
              </div>
            </>
          )}

          {/* Password Step */}
          {step === "password" && currentUser && (
            <>
              <div className="mb-5 sm:mb-10">
                <button
                  onClick={handleBackToEmail}
                  className="inline-flex items-center mb-10 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <ChevronLeftIcon />
                  Back
                </button>
              <div>
                <div className="flex flex-col items-center gap-1 mb-10">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-brand-500/20">
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {currentUser.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </p>
                  </div>
                  <div className="p-4 mb-1 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                  <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                    {currentUser.securityPhrase}
                  </p>
                </div>
                </div>
              </div>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <div>
                    <div className="space-y-4 mb-2">
                      <p className="text-smpr-12 text-gray-500 dark:text-gray-400">
                        Enter your password to continue
                      </p>
                    </div>
                    <Label>
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        className="w-full px-4 py-3 pr-12 text-sm transition-colors border rounded-lg outline-none border-gray-300 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Link
                      href="/reset-password"
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition rounded-lg gap-4 bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
