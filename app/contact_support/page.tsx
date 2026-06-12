"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import Label from "@/components/form/Label";

export default function ContactSupportPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [username, setUsername] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    setFormStatus(null);

    if (!username.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setFormStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, email: contactEmail, message: contactMessage }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send message.');

      setFormStatus({ type: 'success', message: data.message || 'Your message has been sent successfully.' });
      setUsername('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      console.error('Support form submit error:', err);
      setFormStatus({ type: 'error', message: err.message || 'Failed to send message.' });
    } finally {
      setIsSubmitting(false);
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

      <div className="absolute top-6 left-4 right-4 flex justify-between items-center max-w-7xl mx-auto z-20">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="inline-flex items-center text-sm text-gray-600 dark:text-white/80 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />

          Back
        </button>

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

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-[#5c6185] z-10">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            Contact Support
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send us a message and we&apos;ll get back to you shortly.
          </p>
        </div>

        {formStatus && (
          <div className={`mb-4 w-full p-4 rounded-lg border text-xs text-center font-medium shadow-sm ${
            formStatus.type === "success" 
              ? "bg-green-50 border-green-200 text-green-600" 
              : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {formStatus.message}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }} 
          className="space-y-5"
        >
          <div>
            <Label className="block mb-2 text-gray-800 dark:text-white/90">
              Username <span className="text-error-500">*</span>
            </Label>

            <input
              type="text"
              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, "").replace(/^./, (c) => c.toUpperCase()))}
              required
            />
          </div>

          <div>
            <Label className="block mb-2 text-gray-800 dark:text-white/90">
              Email Address <span className="text-error-500">*</span>
            </Label>

            <input
              type="email"
              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
              placeholder="Enter your email address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value.replace(/[^a-zA-Z0-9@.\-_+]/g, ""))} 
              required
            />
          </div>

          <div>
            <Label className="block mb-2 text-gray-800 dark:text-white/90">
              Message <span className="text-error-500">*</span>
            </Label>

            <textarea
              className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 appearance-none"
              placeholder="Describe your issue or question"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition rounded-xl bg-[#3D405B] hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}