"use client";

import React from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Image from "next/image";

export default function Profile() {
  const { isOpen: isMetaModalOpen, openModal: openMetaModal, closeModal: closeMetaModal } = useModal();
  const [currentMetaAccount, setCurrentMetaAccount] = React.useState("Musharof Chowdhury");

  React.useLayoutEffect(() => {
    const savedAccount = localStorage.getItem("currentAccount");
    if (savedAccount) {
      setCurrentMetaAccount(savedAccount);
    }
  }, []);

  const metaAccountsData = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@gmail.com",
      avatar: "/images/user/user-07.jpg",
      firstName: "John",
      lastName: "Doe",
      phone: "+60 14-115-2909",
      occupation: "Software Engineer",
      location: "Kuala Lumpur, Malaysia",
    },
    {
      id: 2,
      name: "GoGo Sdn Bhd",
      email: "gogo.sdnbhd@gmail.com",
      avatar: "/images/user/user-07.jpg",
      firstName: "GoGo",
      lastName: "Sdn Bhd",
      phone: "+60 12-345-6789",
      occupation: "Business Manager",
      location: "Kuala Lumpur, Malaysia",
    },
    {
      id: 3,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      avatar: "/images/user/user-06.jpg",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+60 11-987-6543",
      occupation: "Project Manager",
      location: "Selangor, Malaysia",
    },
  ];

  const metaAccountData = metaAccountsData.find((acc) => acc.name === currentMetaAccount) || metaAccountsData[0];

  const handleMetaSave = () => {
    console.log("Saving UserMetaCard changes...");
    closeMetaModal();
  };

  const { isOpen: isInfoModalOpen, openModal: openInfoModal, closeModal: closeInfoModal } = useModal();
  const [currentInfoAccount, setCurrentInfoAccount] = React.useState("John Doe");

  React.useLayoutEffect(() => {
    const savedAccount = localStorage.getItem("currentAccount");
    if (savedAccount) {
      setCurrentInfoAccount(savedAccount);
    }
  }, []);

  const infoAccountsData = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@gmail.com",
      firstName: "John",
      lastName: "Doe",
      occupation: "Software Engineer",
      phone: "+60 14-115-2909",
      bio: "Software Engineer with 5+ years of experience",
    },
    {
      id: 2,
      name: "GoGo Sdn Bhd",
      email: "gogo.sdnbhd@gmail.com",
      firstName: "GoGo",
      lastName: "Sdn Bhd",
      occupation: "Business Manager",
      phone: "+60 12-345-6789",
      bio: "Leading business solutions provider in Malaysia",
    },
    {
      id: 3,
      name: "Jane Doe",
      email: "jane.doe@gmail.com",
      firstName: "Jane",
      lastName: "Doe",
      occupation: "Project Manager",
      phone: "+60 11-987-6543",
      bio: "Project management and consulting services",
    },
  ];

  const infoAccountData = infoAccountsData.find((acc) => acc.name === currentInfoAccount) || infoAccountsData[0];

  const handleInfoSave = () => {
    console.log("Saving UserInfoCard changes...");
    closeInfoModal();
  };

  const { isOpen: isAddressModalOpen, openModal: openAddressModal, closeModal: closeAddressModal } = useModal();
  const [currentAddressAccount, setCurrentAddressAccount] = React.useState("John Doe");

  React.useLayoutEffect(() => {
    const savedAccount = localStorage.getItem("currentAccount");
    if (savedAccount) {
      setCurrentAddressAccount(savedAccount);
    }
  }, []);

  const addressAccountsData = [
    {
      id: 1,
      name: "John Doe",
      country: "Malaysia",
      cityState: "Kuala Lumpur",
      postalCode: "50450",
      address: "Jalan Ampang, Bukit Bintang",
    },
    {
      id: 2,
      name: "GoGo Sdn Bhd",
      country: "Malaysia",
      cityState: "Kuala Lumpur",
      postalCode: "50450",
      address: "Jalan Sultan Ismail, Bukit Bintang",
    },
    {
      id: 3,
      name: "Jane Doe",
      country: "Malaysia",
      cityState: "Petaling Jaya, Selangor",
      postalCode: "47301",
      address: "SS2 Plaza, Jalan SS2/24",
    },
  ];

  const addressAccountData = addressAccountsData.find((acc) => acc.name === currentAddressAccount) || addressAccountsData[0];

  const handleAddressSave = () => {
    console.log("Saving UserAddressCard changes...");
    closeAddressModal();
  };

  return (
    <div className="space-y-6">
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image width={80} height={80} src={metaAccountData.avatar} alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {metaAccountData.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">{metaAccountData.occupation}</p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{metaAccountData.location}</p>
              </div>
            </div>
          </div>
          <button
            onClick={openMetaModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Personal Information</h4>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">First Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{infoAccountData.firstName}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Last Name</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{infoAccountData.lastName}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Email address</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{infoAccountData.email}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{infoAccountData.phone}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Bio</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{infoAccountData.bio}</p>
                </div>
              </div>
            </div>
            <button
              onClick={openInfoModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
              </svg>
              Edit
            </button>
          </div>
          <Modal isOpen={isInfoModalOpen} onClose={closeInfoModal} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
              <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Personal Information</h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update your details to keep your profile up-to-date.</p>
              </div>
              <form className="flex flex-col">
                <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                  <div>
                    <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">Social Links</h5>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                      <div>
                        <Label>Facebook</Label>
                        <Input type="text" defaultValue="https://www.facebook.com/PimjoHQ" />
                      </div>
                      <div>
                        <Label>X.com</Label>
                        <Input type="text" defaultValue="https://x.com/PimjoHQ" />
                      </div>
                      <div>
                        <Label>Linkedin</Label>
                        <Input type="text" defaultValue="https://www.linkedin.com/company/pimjo" />
                      </div>
                      <div>
                        <Label>Instagram</Label>
                        <Input type="text" defaultValue="https://instagram.com/PimjoHQ" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-7">
                    <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">Personal Information</h5>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                      <div className="col-span-2 lg:col-span-1">
                        <Label>First Name</Label>
                        <Input type="text" defaultValue={infoAccountData.firstName} />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <Label>Last Name</Label>
                        <Input type="text" defaultValue={infoAccountData.lastName} />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <Label>Email Address</Label>
                        <Input type="text" defaultValue={infoAccountData.email} />
                      </div>
                      <div className="col-span-2 lg:col-span-1">
                        <Label>Phone</Label>
                        <Input type="text" defaultValue={infoAccountData.phone} />
                      </div>
                      <div className="col-span-2">
                        <Label>Occupation</Label>
                        <Input type="text" defaultValue={infoAccountData.occupation} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={closeInfoModal}>Close</Button>
                  <Button size="sm" onClick={handleInfoSave}>Save Changes</Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>

        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Address</h4>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Country</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{addressAccountData.country}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">City/State</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{addressAccountData.cityState}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Postal Code</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{addressAccountData.postalCode}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{addressAccountData.address}</p>
                </div>
              </div>
            </div>
            <button
              onClick={openAddressModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
              </svg>
              Edit
            </button>
          </div>
          <Modal isOpen={isAddressModalOpen} onClose={closeAddressModal} className="max-w-[700px] m-4">
            <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
              <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Address</h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update your details to keep your profile up-to-date.</p>
              </div>
              <form className="flex flex-col">
                <div className="px-2 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Country</Label>
                      <Input type="text" defaultValue={addressAccountData.country} />
                    </div>
                    <div>
                      <Label>City/State</Label>
                      <Input type="text" defaultValue={addressAccountData.cityState} />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input type="text" defaultValue={addressAccountData.postalCode} />
                    </div>
                    <div>
                      <Label>Street</Label>
                      <Input type="text" defaultValue={addressAccountData.address} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={closeAddressModal}>Close</Button>
                  <Button size="sm" onClick={handleAddressSave}>Save Changes</Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </div>

      <Modal isOpen={isMetaModalOpen} onClose={closeMetaModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Personal Information</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update your details to keep your profile up-to-date.</p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">Personal Information</h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" defaultValue={metaAccountData.firstName} />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" defaultValue={metaAccountData.lastName} />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" defaultValue={metaAccountData.email} />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" defaultValue={metaAccountData.phone} />
                  </div>
                  <div className="col-span-2">
                    <Label>Occupation</Label>
                    <Input type="text" defaultValue={metaAccountData.occupation} />
                  </div>
                </div>
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