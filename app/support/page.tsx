"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import Label from "@/components/form/Label";

export default function SupportPage() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus(null);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setFormStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: contactName, email: contactEmail, message: contactMessage }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send message.');

      setFormStatus({ type: 'success', message: data.message || 'Your message has been sent successfully.' });
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      console.error('Support form submit error:', err);
      setFormStatus({ type: 'error', message: err.message || 'Failed to send message.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] dark:bg-gray-950 px-4 py-20">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-[#5c6185]">
        <div className="mb-6 text-center">
          <Image src="/images/logo/logo-dark.svg" alt="DTCOB" width={48} height={48} />
          <h1 className="mt-4 text-2xl font-extrabold text-[#3D405B] dark:text-white">Contact Support</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Send us a message and we'll get back to you shortly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Username <span className="text-error-500">*</span></Label>
            <input
              type="text"
              className="w-full px-4 py-2.5 text-sm bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E]"
              placeholder="Enter your username"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Email Address <span className="text-error-500">*</span></Label>
            <input
              type="email"
              className="w-full px-4 py-2.5 text-sm bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E]"
              placeholder="Enter your email address"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Message <span className="text-error-500">*</span></Label>
            <textarea
              className="w-full px-4 py-2.5 text-sm bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] h-36 resize-none"
              placeholder="Describe your issue or question"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
          </div>

          {formStatus && (
            <p className={`text-sm font-medium ${formStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {formStatus.message}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition rounded-xl bg-[#3D405B] hover:bg-[#2c2f42] disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>

            <Link href="/" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-xl border">
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
