"use client";

import React from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

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
  isMalaysian?: boolean;
  is_malaysian?: boolean;
}

const getSplitAddress = (profile: ProfileData) => {
  if (profile.address1 || profile.address2) {
    return {
      address1: profile.address1 || "N/A",
      address2: profile.address2 || "-",
    };
  }

  const rawAddress = profile.address || "";
  if (!rawAddress) {
    return { address1: "N/A", address2: "-" };
  }

  const parts = rawAddress.split(",");
  if (parts.length > 1) {
    const address1 = parts[0].trim();
    const address2 = parts.slice(1).join(",").trim();
    return { address1, address2 };
  }

  return { address1: rawAddress, address2: "-" };
};

export default function Profile() {
  const { isOpen: isMetaModalOpen, openModal: openMetaModal, closeModal: closeMetaModal } = useModal();

  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = localStorage.getItem("currentUsername");

        if (!username) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/profile/${username}`);
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("PROFILE FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleMetaSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Saving meta changes...");
    closeMetaModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 dark:text-gray-400">Could not load profile.</p>
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Profile Header Card */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-900/50 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="w-20 h-20 overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800/50 rounded-full shrink-0 mx-auto sm:mx-0">
            <img 
              className="w-full h-full object-cover" 
              src={profile.avatar || "/placeholder-avatar.png"} 
              alt={`${profile.name}'s avatar`} 
            />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {profile.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Account Number:{" "}
              <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                {accountDisplay}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Personal Information Card with Edit Button */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-900/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h4>
              <Button 
                onClick={openMetaModal} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1.5"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-3.5 h-3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Occupation side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Full Name
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {profile.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Occupation
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {profile.occupation || "N/A"}
                  </p>
                </div>
              </div>
            
              {/* Row 2: Email & Phone side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Email address
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-all">
                    {profile.email || "N/A"}
                  </p>
                </div>
                
                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Phone
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {profile.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-900/50 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="pb-4 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-100 dark:text-white dark:border-gray-800">
              Address
            </h4>

            <div className="space-y-4">
              {/* Row 1: Address Line 1 & Address Line 2 side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Address Line 1
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {address1}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Address Line 2
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {address2}
                  </p>
                </div>
              </div>

              {/* Row 2: City/State & Postal Code side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    City, State
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {profile.city && profile.state 
                      ? `${profile.city}, ${profile.state}` 
                      : profile.cityState || "N/A"}
                  </p>
                </div>
                
                <div>
                  <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Postal Code
                  </span>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {profile.postalCode || "N/A"}
                  </p>
                </div>
              </div>

              {/* Row 3: Country below */}
              <div>
                <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Country
                </span>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {profile.country || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isMetaModalOpen} 
        onClose={closeMetaModal} 
        className="max-w-[700px] m-4"
      >
        <div className="p-6 bg-white rounded-3xl dark:bg-gray-900 lg:p-10">
          <h4 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            Edit Personal Information
          </h4>

          <form onSubmit={handleMetaSave} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input 
                  type="text" 
                  defaultValue={profile.fullName} 
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Occupation</Label>
                <Input 
                  type="text" 
                  defaultValue={profile.occupation} 
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  defaultValue={profile.email} 
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input 
                  type="text" 
                  defaultValue={profile.phone} 
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeMetaModal}
              >
                Close
              </Button>

              <Button 
                size="sm" 
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}