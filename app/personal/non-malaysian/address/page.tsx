"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ChevronLeftIcon from "@/icons/chevron-left.svg";

interface AddressFields {
  streetAddress1: string;
  streetAddress2: string;
  postal: string;
  city: string;
  state: string;
  country: string;
}

interface AddressState {
  permanentAddress: AddressFields;
  mailingAddress: AddressFields;
}

interface AddressSectionProps {
  title: string;
  type: keyof AddressState;
  addressData: AddressState;
  updateField: (
    type: keyof AddressState,
    field: keyof AddressFields,
    value: string
  ) => void;
  disabled?: boolean;
  headerRight?: React.ReactNode;
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const AddressSection = ({
  title,
  type,
  addressData,
  updateField,
  disabled = false,
  lockedCountry = false,
  headerRight,
}: AddressSectionProps & { lockedCountry?: boolean }) => {
  const inputBaseClasses = `w-full px-4 py-2.5 text-sm font-medium transition-all border-2 rounded-xl outline-none bg-white border-gray-200 text-gray-800 focus:border-[#F0CA8E] focus:ring-4 focus:ring-[#F0CA8E]/20 dark:bg-gray-900/90 dark:border-[#5c6185] dark:text-white dark:focus:border-[#F0CA8E] dark:focus:ring-[#3D405B]/40 disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800/80 dark:disabled:border-gray-700 appearance-none`;
  
  return (
    <div className="flex-1">
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
        <h2 className="block text-md font-bold text-[#3D405B] dark:text-white">
          {title}
        </h2>
        {headerRight && <div>{headerRight}</div>}
      </div>

      <div className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
            Address Line 1 <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            className={`${inputBaseClasses} appearance-none`}
            placeholder="Enter your house number, building name"
            value={addressData[type].streetAddress1}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField(type, "streetAddress1", e.target.value.replace(/[^a-zA-Z0-9,.\-\/ ]/g, ""))
            }
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
            Address Line 2 <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            className={`${inputBaseClasses} appearance-none`}
            placeholder="Enter your street name, area"
            value={addressData[type].streetAddress2}
            disabled={disabled}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateField(type, "streetAddress2", e.target.value.replace(/[^a-zA-Z0-9,.\-\/ ]/g, ""))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              Postal Code <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              maxLength={5}
              className={`${inputBaseClasses} appearance-none`}
              placeholder="Enter your postal code"
              value={addressData[type].postal}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField(type, "postal", e.target.value.replace(/[^0-9]/g, ""))
              }
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              City <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              className={`${inputBaseClasses} appearance-none`}
              placeholder="Enter your city"
              value={addressData[type].city}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField(type, "city", e.target.value.replace(/[^a-zA-Z ]/g, ""))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              State <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              className={`${inputBaseClasses} appearance-none`}
              placeholder="Enter your state"
              value={addressData[type].state}
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateField(type, "state", e.target.value.replace(/[^a-zA-Z ]/g, ""))
              }
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              Country <span className="text-red-500">*</span>
            </label>

            {lockedCountry ? (
              <div className="flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl bg-gray-50 border-gray-200 dark:bg-gray-900/90 dark:border-[#5c6185]/20 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {addressData[type].country || "Malaysia"}
                </span>

                <svg 
                  className="w-4 h-4 text-gray-400 ml-auto" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
            ) : (
              <div className="relative">
                <select
                  className={`${inputBaseClasses} ${
                    !addressData[type].country ? "!text-gray-400 dark:!text-gray-400" : ""
                  }`}
                  value={addressData[type].country}
                  disabled={disabled}
                  onChange={(e) => updateField(type, "country", e.target.value)}
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  {COUNTRIES.map((c) => <option key={c} value={c} className="text-gray-800 dark:text-white">{c}</option>)}
                </select>

                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PersonalNonMalaysianAddress() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const journeyId = searchParams.get("journeyId") || (typeof window !== "undefined" ? localStorage.getItem("journeyId") : "") || "";

  const [addressData, setAddressData] = useState<AddressState>({
    permanentAddress: {
      streetAddress1: "",
      streetAddress2: "",
      postal: "",
      city: "",
      state: "",
      country: "",
    },
    mailingAddress: {
      streetAddress1: "",
      streetAddress2: "",
      postal: "",
      city: "",
      state: "",
      country: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (addressData.mailingAddress.country === "") {
      updateField("mailingAddress", "country", "Malaysia");
    }
  }, [addressData.mailingAddress.country]);

  const checkAddressValid = (address: AddressFields) => {
    return (
      address.streetAddress1.trim() !== "" &&
      address.streetAddress2.trim() !== "" &&
      address.postal.length === 5 &&
      address.city.trim() !== "" &&
      address.state.trim() !== "" &&
      address.country.trim() !== ""
    );
  };

  const isFormValid =
    checkAddressValid(addressData.permanentAddress) &&
    checkAddressValid(addressData.mailingAddress);

  const updateField = (
    type: keyof AddressState,
    field: keyof AddressFields,
    value: string
  ) => {
    setAddressData((prev) => {
      const newData = {
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value,
        },
      };

      return newData;
    });
  };

  const saveAddressToLocalStorage = () => {
    const addressInfo = {
      address: {
        add_type: "Home",
        add_1: addressData.permanentAddress.streetAddress1,
        add_2: addressData.permanentAddress.streetAddress2,
        postcode: addressData.permanentAddress.postal,
        city: addressData.permanentAddress.city,
        state: addressData.permanentAddress.state,
        country: addressData.permanentAddress.country,
      },

      mailingAddress: {
        add_type: "Mailing",
        add_1: addressData.mailingAddress.streetAddress1,
        add_2: addressData.mailingAddress.streetAddress2,
        postcode: addressData.mailingAddress.postal,
        city: addressData.mailingAddress.city,
        state: addressData.mailingAddress.state,
        country: addressData.mailingAddress.country,
      },
    };

    localStorage.setItem(
      "nonMsianAddress",
      JSON.stringify(addressInfo)
    );
  };

  const handleNavigation = () => {
    saveAddressToLocalStorage();
    router.push("/personal/non-malaysian/application");
  };

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col items-center min-h-[100dvh] px-4 py-20 bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
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
          onClick={() => { 
            saveAddressToLocalStorage();
            router.push(
              `/personal/non-malaysian/info?journeyId=${encodeURIComponent(journeyId)}`
            );
          }}
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

      <div className="relative w-full max-w-5xl mt-10 z-10 animate-in fade-in duration-500">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-bold text-gray-800 text-title-sm dark:text-white sm:text-title-md">
            Enter Your Address Details
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please provide your current and permanent residential addresses to proceed with the registration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <AddressSection
            title="Permanent Home Address"
            type="permanentAddress"
            addressData={addressData}
            updateField={updateField}
          />

          <AddressSection
            title="Current Mailing Address"
            type="mailingAddress"
            addressData={addressData}
            updateField={updateField}
            lockedCountry={true}
          />
        </div>

        <div className="mt-16 flex flex-col items-center max-w-xl mx-auto">
          <p className="mb-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            By clicking continue, you confirm that the information provided is accurate and belongs to you.
          </p>

          <button
            onClick={handleNavigation}
            disabled={!isFormValid}
            className={`inline-flex items-center justify-center w-full px-4 py-3 text-sm font-bold transition rounded-lg shadow-theme-xs active:scale-[0.98] ${
              isFormValid
                ? "bg-[#3D405B] text-white hover:bg-[#2c2f42] dark:bg-[#3D405B] dark:hover:bg-[#4a4e6d]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            Continue
          </button>

          <div className="mt-5 text-center">
            <p className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Having trouble? </span>

              <Link
                href="/support"
                className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative mt-8 text-xs text-gray-400 dark:text-gray-200 z-10 text-center">
        &copy; {new Date().getFullYear()} DTCOB Banking Services. All rights reserved.
      </footer>
    </div>
  );
}