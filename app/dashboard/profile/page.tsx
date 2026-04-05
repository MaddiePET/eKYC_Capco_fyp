"use client";

import React from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Image from "next/image";

interface ProfileData {
  username: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  phone: string;
  occupation: string;
  country: string;
  cityState: string;
  postalCode: string;
  address: string;
  location: string;
}

export default function Profile() {
  const { isOpen: isMetaModalOpen, openModal: openMetaModal, closeModal: closeMetaModal } = useModal();
  const { isOpen: isInfoModalOpen, openModal: openInfoModal, closeModal: closeInfoModal } = useModal();
  const { isOpen: isAddressModalOpen, openModal: openAddressModal, closeModal: closeAddressModal } = useModal();

  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
  const fetchProfile = async () => {
    try {
      console.log("PROFILE localStorage currentUsername:", localStorage.getItem("currentUsername"));

      const username = localStorage.getItem("currentUsername");

      if (!username) {
        console.error("No username found in localStorage");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/profile/${username}`);
      console.log("PROFILE FETCH STATUS:", res.status);

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      console.log("PROFILE DATA:", data);
      setProfile(data);
    } catch (err) {
      console.error("PROFILE FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);

  const handleMetaSave = () => {
    console.log("Saving meta changes...");
    closeMetaModal();
  };

  const handleInfoSave = () => {
    console.log("Saving info changes...");
    closeInfoModal();
  };

  const handleAddressSave = () => {
    console.log("Saving address changes...");
    closeAddressModal();
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Could not load profile.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image width={80} height={80} src={profile.avatar} alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {profile.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.occupation}</p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.location}</p>
              </div>
            </div>
          </div>
          <button onClick={openMetaModal}>Edit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">First Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.firstName}</p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Last Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.lastName}</p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.email}</p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Address
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Country</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.country}</p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">City/State</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.cityState}</p>
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Postal Code</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.postalCode}</p>
              </div>
              <div className="lg:col-span-2">
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{profile.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isMetaModalOpen} onClose={closeMetaModal} className="max-w-[700px] m-4">
        <div className="p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <form className="flex flex-col">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input type="text" defaultValue={profile.firstName} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input type="text" defaultValue={profile.lastName} />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="text" defaultValue={profile.email} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="text" defaultValue={profile.phone} />
              </div>
              <div className="col-span-2">
                <Label>Occupation</Label>
                <Input type="text" defaultValue={profile.occupation} />
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeMetaModal}>Close</Button>
              <Button size="sm" onClick={handleMetaSave}>Save Changes</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}