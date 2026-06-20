"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import Label from "@/components/form/Label";
import EyeCloseIcon from "@/icons/eye-close.svg";
import EyeIcon from "@/icons/eye.svg";

interface User {
  username: string;
  email: string;
  name: string;
  avatar: string;
  securityPhrase: string;
}

function convertBase64ToDataUrl(base64: string): string {
  let mimeType = "image/jpeg";
  
  if (base64.startsWith("PHN2Zy") || base64.startsWith("PD94bWw")) {
    mimeType = "image/svg+xml";
  } else if (base64.startsWith("iVBORw0KGg")) {
    mimeType = "image/png";
  } else if (base64.startsWith("R0lGODlh")) {
    mimeType = "image/gif";
  } else if (base64.startsWith("/9j/")) {
    mimeType = "image/jpeg";
  }

  return `data:${mimeType};base64,${base64}`;
}

function formatAvatarSrc(avatar: any): string {
  if (!avatar) return "/owner.jpg";

  if (typeof avatar === "string") {
    if (
      avatar.startsWith("http://") || 
      avatar.startsWith("https://") || 
      avatar.startsWith("data:image/")
    ) {
      return avatar;
    }

    if (avatar.startsWith("{") && avatar.includes('"type"')) {
      try {
        const parsed = JSON.parse(avatar);
        return formatAvatarSrc(parsed);
      } catch {}
    }

    if (avatar.startsWith("\\x") || avatar.startsWith("\\\\x") || avatar.startsWith("x")) {
      const cleanHex = avatar.replace(/^\\\\x|^\\x|^x/, "");
      try {
        let binary = "";
        for (let i = 0; i < cleanHex.length; i += 2) {
          binary += String.fromCharCode(parseInt(cleanHex.substring(i, i + 2), 16));
        }
        
        if (
          binary.startsWith("http://") || 
          binary.startsWith("https://") || 
          binary.startsWith("data:image/")
        ) {
          return binary;
        }
        return convertBase64ToDataUrl(btoa(binary));
      } catch (err) {
        console.error("Failed parsing hex image data:", err);
      }
    }

    const cleanBase64 = avatar.replace(/[\r\n\s]+/g, "");
    return convertBase64ToDataUrl(cleanBase64);
  }

  if (avatar && typeof avatar === "object") {
    if (avatar.type === "Buffer" && Array.isArray(avatar.data)) {
      const uintArray = new Uint8Array(avatar.data);
      let binary = "";
      for (let i = 0; i < uintArray.length; i++) {
        binary += String.fromCharCode(uintArray[i]);
      }
      
      if (
        binary.startsWith("http://") || 
        binary.startsWith("https://") || 
        binary.startsWith("data:image/")
      ) {
        return binary;
      }
      return convertBase64ToDataUrl(btoa(binary));
    }

    if (avatar instanceof Uint8Array || Array.isArray(avatar)) {
      const uintArray = Array.isArray(avatar) ? new Uint8Array(avatar) : avatar;
      let binary = "";
      for (let i = 0; i < uintArray.length; i++) {
        binary += String.fromCharCode(uintArray[i]);
      }
      
      if (
        binary.startsWith("http://") || 
        binary.startsWith("https://") || 
        binary.startsWith("data:image/")
      ) {
        return binary;
      }
      return convertBase64ToDataUrl(btoa(binary));
    }
  }

  return "/owner.jpg";
}

export default function LogIn() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"username" | "confirm" | "password">("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [attempts, setAttempts] = useState(3);
  const [cooldown, setCooldown] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const latestUsernameRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
    sessionStorage.removeItem("is_authenticated");
    localStorage.removeItem("currentUsername");
    localStorage.removeItem("currentAccount");
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (cooldown === 0 && attempts <= 0) {
      setAttempts(1);
    }

    return () => clearInterval(interval);
  }, [cooldown, attempts]);

  const checkUsername = async (val: string) => {
    if (val.length < 5) { 
      setIsUsernameValid(null); 
      return; 
    }
    
    latestUsernameRef.current = val;
    setIsValidating(true);
    
    try {
      const res = await fetch(`/api/users/${val}`);
      
      if (latestUsernameRef.current === val) {
        setIsUsernameValid(res.ok);
      }
    } catch { 
      if (latestUsernameRef.current === val) {
        setIsUsernameValid(false); 
      }
    } finally {
      if (latestUsernameRef.current === val) {
        setIsValidating(false);
      }
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");

    try {
      const res = await fetch(`/api/users/${username}`);

      if (!res.ok) {
        setUsernameError("Username not found. Please try again.");
        setIsUsernameValid(false);
        return;
      }

      const user = await res.json();
      user.avatar = formatAvatarSrc(user.avatar);

      setCurrentUser(user);
      setStep("confirm");
      setUsernameError("");
    } catch (err) {
      console.error(err);
      setUsernameError("Something went wrong. Please try again.");
    }
  };

  const handleConfirm = () => {
    setStep("password");
  };

  const handleBack = () => {
    setUsernameError("");
    setPasswordError("");
    
    if (step === "username") {
      router.push("/");
    } else if (step === "confirm") {
      setStep("username");
      setCurrentUser(null);
    } else if (step === "password") {
      setStep("confirm");
      setPassword("");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setPasswordError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const newAttempts = attempts - 1;
        setAttempts(newAttempts);

        if (newAttempts <= 0) {
          setCooldown(60);
          setPasswordError("Too many failed attempts. ");
          setAttempts(0);
        } else {
          setPasswordError(`Wrong password. You have ${newAttempts} attempts remaining.`);
        }
        return;
      }

      setAttempts(3);
      const data = await res.json();

      try {
        sessionStorage.setItem("is_authenticated", "true");

        localStorage.setItem("currentUsername", data.username || "");
        localStorage.setItem("currentAccount", data.name || "");
        localStorage.setItem("currentUserAvatar", data.avatar || ""); 
        localStorage.setItem("currentUserEmail", data.email || "");
        localStorage.setItem("currentUserId", String(data.user_id));
        localStorage.setItem("currentCustId", String(data.cust_id));
        localStorage.setItem("currentIdNum", data.id_num);
      } catch (storageError) {
        console.warn("Session allocation limits hit, pruning avatar storage.");
        localStorage.setItem("currentUserAvatar", "");
      }

      router.push("/dashboard");
      
    } catch (err) {
      console.error(err);
      setPasswordError("Server connection failed.");
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

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto z-20 overflow-hidden">
        <button 
          type="button" 
          onClick={handleBack} 
          className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          {step === "username" ? "Home" : "Back"}
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
      </div>

      <div className="relative w-full max-w-md z-10">
        {step === "username" && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Log In
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please enter your username to log in.
              </p>
            </div>
            
            {usernameError && (
              <div className="mb-4 p-3 text-xs text-center font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {usernameError}
              </div>
            )}

            <form onSubmit={handleUsernameSubmit}>
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2 text-center sm:text-left text-gray-800 dark:text-white/90">
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
                        const cleanedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "").replace(/^./, (c) => c.toUpperCase());
                        setUsername(cleanedValue);
                        setUsernameError("");
                        setIsUsernameValid(null);
                        checkUsername(cleanedValue);
                      }}
                    />
                    {isUsernameValid === true && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isValidating || username.length === 0}
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"                
                >
                  Continue
                </button>
              </div>
            </form>

            <div className="mt-5 text-center">
              <Link 
                href="/reset_password" 
                className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        {step === "confirm" && currentUser && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="mb-6 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
                Is this you?
              </h1>

              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative w-24 h-24 overflow-hidden rounded-full ring-4 ring-[#3D405B]/20">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
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

              <div className="relative p-4 mb-8 rounded-2xl border-2 transition-all duration-300 text-center border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  "{currentUser.securityPhrase}"
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                type="button" 
                onClick={handleConfirm} 
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
              >
                Yes, that's me
              </button>
              <button 
                type="button" 
                onClick={handleBack} 
                className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
              >
                No, use different account
              </button>
            </div>
            
            <div className="mt-5 text-center">
              <Link 
                href="/reset_password" 
                className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        )}

        {step === "password" && currentUser && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-1 mb-8 text-center">
              <div className="relative w-20 h-20 mb-3 overflow-hidden rounded-full ring-4 ring-[#3D405B]/20">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
                {currentUser.name}
              </h2>

              <div className="inline-block px-6 py-2 rounded-full border-2 transition-all duration-300 border-[#F0CA8E] bg-white shadow-md ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900 dark:border-[#F0CA8E] dark:ring-[#F0CA8E]/20">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  "{currentUser.securityPhrase}"
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 text-xs text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {passwordError}
                {cooldown > 0 && (<span>Please retry in {cooldown}s.</span>)}
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <div>
                  <Label className="block mb-2 text-center sm:text-left text-gray-800 dark:text-white/90">
                    Password<span className="text-error-500">*</span>
                  </Label>

                  <div className="relative">
                    <input
                      disabled={cooldown > 0}
                      className="w-full px-4 py-2.5 text-sm transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(""); 
                      }}
                      required
                    />
                    <span 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute z-30 cursor-pointer -translate-y-1/2 right-4 top-1/2"
                    >
                      {showPassword ? <EyeIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" /> : <EyeCloseIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" />}
                    </span>
                  </div>
                </div>

                <button 
                  disabled={cooldown > 0} 
                  type="submit" 
                  className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:opacity-50"
                >
                  Log In
                </button>

                <div className="text-center">
                  <Link 
                    href="/reset_password" 
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}