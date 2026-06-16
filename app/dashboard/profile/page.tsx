"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

interface ProfileData {
  username: string;
  name: string;
  fullName: string;
  email: string;
  avatar: string;
  phone: string;
  occupation: string;
  country: string;
  city?: string;
  state?: string;
  cityState?: string;
  postalCode: string;
  address1?: string;
  address2?: string;
  address?: string;
  location: string;

  accountNo?: string;
  accountNumber?: string;
  account_no?: string;
  account_number?: string;

  accountType?: string;
  account_type?: string;
  type?: string;

  isMalaysian?: boolean;
  is_malaysian?: boolean;

  businessName?: string;
  business_name?: string;
  bus_name?: string;

  registrationNumber?: string;
  registration_number?: string;
  regNo?: string;
  reg_no?: string;
  brn?: string;

  businessType?: string;
  business_type?: string;
  bus_type?: string;

  role?: string;
}

const getSplitAddress = (profile: ProfileData) => {
  if (profile.address1 || profile.address2) {
    return {
      address1: profile.address1 || "N/A",
      address2: profile.address2 || "N/A",
    };
  }

  const rawAddress = profile.address || "";

  if (!rawAddress) {
    return {
      address1: "N/A",
      address2: "N/A",
    };
  }

  const parts = rawAddress.split(",");

  if (parts.length > 1) {
    const address1 = parts[0].trim();
    const address2 = parts.slice(1).join(",").trim();
    return { address1, address2 };
  }

  return {
    address1: rawAddress,
    address2: "N/A",
  };
};

export default function DashboardProfile() {
  const router = useRouter();

  const {
    isOpen: isMetaModalOpen,
    openModal: openMetaModal,
    closeModal: closeMetaModal,
  } = useModal();

  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = localStorage.getItem("currentUsername");

        if (!username) {
          setLoading(false);
          router.push("/login");
          return;
        }

        const res = await fetch(`/api/profile/${username}`);

        if (!res.ok) {
          throw new Error("Failed to fetch profile.");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleMetaSave = () => {
    console.log("Saving meta changes...");
    closeMetaModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Could not load profile.
        </p>
      </div>
    );
  }

  const accountDisplay =
    profile.accountNo ||
    profile.accountNumber ||
    profile.account_no ||
    profile.account_number ||
    "N/A";

  const { address1, address2 } = getSplitAddress(profile);

  const rawAccountType =
    profile.accountType ||
    profile.account_type ||
    profile.type ||
    "";

  const isCurrentAccount =
    rawAccountType.toLowerCase().includes("current") ||
    !!(
      profile.businessName ||
      profile.business_name ||
      profile.bus_name ||
      profile.registrationNumber ||
      profile.registration_number ||
      profile.regNo ||
      profile.reg_no ||
      profile.brn
    );

  const businessName =
    profile.businessName ||
    profile.business_name ||
    profile.bus_name ||
    "N/A";

  const registrationNumber =
    profile.registrationNumber ||
    profile.registration_number ||
    profile.regNo ||
    profile.reg_no ||
    profile.brn ||
    "N/A";

  const businessType =
    profile.businessType ||
    profile.business_type ||
    profile.bus_type ||
    "N/A";

  const businessRole = profile.role || "N/A";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-white/20 dark:bg-gray-900/50 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="w-20 h-20 overflow-hidden ring-4 ring-gray-100 dark:ring-gray-500/50 rounded-full shrink-0 mx-auto sm:mx-0">
            <img
              className="w-full h-full object-cover"
              src={profile.avatar || "/owner.jpg"}
              alt={`${profile.name}'s avatar`}
            />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl font-bold text-gray-800 dark:text-white">
              {profile.name}
            </h4>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Account Number: <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{accountDisplay}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-white/20 dark:bg-gray-900/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-white/20">
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                Personal Information
              </h4>

              <button
                onClick={openMetaModal}
                type="button"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-white/20 dark:hover:bg-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>

                Edit
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                    Full Name
                  </span>

                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {profile.fullName || "N/A"}
                  </p>
                </div>

                {!isCurrentAccount && (
                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Occupation
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {profile.occupation || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                    Email address
                  </span>

                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200 break-all">
                    {profile.email || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                    Phone Number
                  </span>

                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {profile.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-white/20 dark:bg-gray-900/50 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="pb-4 mb-4 text-lg font-bold text-gray-800 border-b border-gray-200 dark:text-white dark:border-white/20">
              {isCurrentAccount ? "Business Particulars" : "Address"}
            </h4>

            {isCurrentAccount ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Business Name
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {businessName}
                    </p>
                  </div>

                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Registration Number
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {registrationNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Business Type
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {businessType}
                    </p>
                  </div>

                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Your Role
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {businessRole}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Address 1
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {address1}
                    </p>
                  </div>

                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Address 2
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {address2}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      City, State
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {profile.city && profile.state
                        ? `${profile.city}, ${profile.state}`
                        : profile.cityState || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                      Postal Code
                    </span>

                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {profile.postalCode || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="block mb-1 text-sm text-gray-500 dark:text-gray-400">
                    Country
                  </span>

                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {profile.country || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isMetaModalOpen}
        onClose={closeMetaModal}
        className="max-w-[700px] m-40 lg:m-0"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-[#F9FAFB] p-8 dark:bg-gray-950 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
              Edit Personal Information
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please update your personal information below.
            </p>
          </div>

          <form onSubmit={handleMetaSave} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Full Name<span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  defaultValue={profile.fullName}
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                />
              </div>

              {!isCurrentAccount && (
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                    Occupation<span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    defaultValue={profile.occupation}
                    className="w-full px-4 py-2.5 text-sm font-medium transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                  />
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Email Address<span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  defaultValue={profile.email}
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
                  Phone Number<span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  defaultValue={profile.phone}
                  className="w-full px-4 py-2.5 text-sm font-medium transition-all bg-white border-2 rounded-xl outline-none border-gray-200 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40"
                />
              </div>
            </div>

            <div className="flex flex-row gap-3 mt-4">
              <button
                type="button"
                onClick={closeMetaModal}
                className="inline-flex items-center justify-center flex-1 px-4 py-3 text-sm font-bold transition bg-transparent border-2 rounded-lg text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
              >
                Close
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center flex-1 px-4 py-3 text-sm font-bold text-white transition rounded-lg bg-[#3D405B] shadow-theme-xs hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
              >
                Save Changes
              </button>
            </div>
          </form>

          <div className="mt-5 text-center">
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
      </Modal>
    </div>
  );
}