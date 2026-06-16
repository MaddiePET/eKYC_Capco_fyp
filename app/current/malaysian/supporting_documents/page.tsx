"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";
import { useFormData } from "@/context/FormContext";

interface DocEntry {
  id: number;
  name: string;
  preview: string | null;
  fileName: string | null;
  fileType: string | null;
  fileBase64: string | null;
}

export default function CurrentMalaysianSupportingDocuments() {
  const router = useRouter();

  const { formData, setFormData } = useFormData();

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<DocEntry[]>(
    formData?.supportingDocuments?.length
      ? formData.supportingDocuments
      : [
          {
            id: 1,
            name: "",
            preview: null,
            fileName: null,
            fileType: null,
            fileBase64: null,
          },
        ]
  );

  const updateDoc = (id: number, fields: Partial<DocEntry>) => {
    setDocuments(documents.map(d => d.id === id ? { ...d, ...fields } : d));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (id: number, file: File | undefined): Promise<void> => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    const base64 = await fileToBase64(file);

    updateDoc(id, {
      preview: file.name,
      fileName: file.name,
      fileType: file.type,
      fileBase64: base64,
    });
  };

  const handleNext = () => {
    setFormData((prev: any) => ({
      ...prev,
      supportingDocuments: documents,
    }));

    router.push("/current/malaysian/account_creation");
  };

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
          onClick={() => router.push("/current/malaysian/business_otp")}
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
      </div>

      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            Upload Your Supporting Documents
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please upload your supporting documents for verification.
          </p>
        </div>

        <div className="space-y-8">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="p-6 bg-white border-2 border-gray-100 rounded-2xl dark:bg-gray-900/90 dark:border-gray-800 shadow-sm relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Document {index + 1}
                </h3>

                {documents.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>)}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Name of Document<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSM Certificate"
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                  value={doc.name}
                  onChange={(e) => {
                    const sanitized = e.target.value
                    .replace(/[^a-zA-Z0-9 ]/g, "")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                    updateDoc(doc.id, { name: sanitized });
                  }}
                />
              </div>

              <div
                onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                onDragOver={(e) => { e.preventDefault(); setDraggingId(doc.id); }}
                onDragLeave={() => setDraggingId(null)}
                onDrop={async (e) => { e.preventDefault(); setDraggingId(null); await handleFile(doc.id, e.dataTransfer.files?.[0]); }}
                className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 flex items-center px-4 py-3 ${
                  draggingId === doc.id
                    ? "border-[#F0CA8E] bg-white shadow-lg ring-4 ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#F0CA8E]"
                    : doc.preview
                    ? "border-[#F0CA8E]"
                    : "border-2 border-dashed border-gray-200 bg-white hover:border-[#F0CA8E]/50 dark:border-gray-500 dark:hover:border-[#F0CA8E] dark:bg-gray-900 "
                }`}
              >
                <input
                  id={`file-${doc.id}`}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => await handleFile(doc.id, e.target.files?.[0])}
                />

                {doc.preview ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <svg 
                        className="w-5 h-5 text-[#3D405B] dark:text-[#F0CA8E]" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[250px]">{doc.preview}</span>
                    </div>

                    <span className="text-xs text-[#3D405B] dark:text-[#F0CA8E] font-semibold">Change</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full pointer-events-none">
                    <svg 
                      className={`w-5 h-5 transition-colors ${
                        draggingId === doc.id 
                          ? 'text-[#3D405B] dark:text-[#F0CA8E]' 
                          : 'text-gray-400 group-hover:text-[#F0CA8E]'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      strokeWidth="1.5"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                      />
                    </svg>
                    <span className={`text-sm font-medium ${
                        draggingId === doc.id 
                          ? 'text-[#3D405B] dark:text-[#F0CA8E]' 
                          : 'text-gray-500'
                      }`}
                    >
                      {draggingId === doc.id ? 'Drop here' : 'Click or drag to upload (PDF, DOC)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setDocuments((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  name: "",
                  preview: null,
                  fileName: null,
                  fileType: null,
                  fileBase64: null,
                },
              ])
            }
            className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
          >
            + Add another document
          </button>

          <div className="pt-4 flex flex-col items-center">
            <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
              By clicking continue, you confirm that the documents uploaded are valid and belong to you.
            </p>
            <button
              type="button"
              onClick={handleNext}
              disabled={documents.some((d) => !d.name || !d.fileBase64)}
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 shadow-lg"
            >
              Continue
            </button>

            <div className="mt-5 text-center">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>
                <Link 
                  href="/contact_support" 
                  className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 text-center z-10">        
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}