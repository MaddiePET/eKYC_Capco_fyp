'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Shared individual personal onboarding demographics structure
interface PersonalInfo {
  id_num?: string;
  full_name?: string;
  fullName?: string;
  id_type?: string;
  dob?: string;
  ph_no_1?: string;
  email?: string;
  country?: string;
  add1?: string;
  add2?: string;
  postcode?: string;
  postal?: string;
  state?: string;
}

interface AddressFields {
  add_type?: string;
  add_1?: string;
  add_2?: string;
  postcode?: string;
  state?: string;
  country?: string;
}

interface PhoneVerification {
  phoneNumber?: string;
  ph_no?: string;
}

// Corporate / Current account specific structures
interface BusinessAddressConfig {
  businessAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    postcode?: string;
    state?: string;
    country?: string;
  };
  mailingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    postcode?: string;
    state?: string;
    country?: string;
  };
  isMailingSameAsBusiness?: boolean | null;
  preferredBranch?: string;
}

interface BusinessParticulars {
  bus_name?: string;
  reg_no?: string;
  start_date?: string;
  bus_type?: string;
  role?: string;
  msic_code?: string;
  msic_name?: string;
}

interface BusinessContact {
  bus_email?: string;
  bus_ph_no?: string;
}

// The core structured schema matrix tracking all onboarding models flatly
export interface MasterFormData {
  journeyId: string;
  idType: string;
  idNum: string;
  
  // Savings Flow Data Blocks
  personalInfo?: PersonalInfo;
  homeAddress?: AddressFields;
  mailingAddress?: AddressFields;
  phoneVerification?: PhoneVerification;
  
  // Corporate Flow Data Blocks
  businessParticulars?: BusinessParticulars;
  businessContact?: BusinessContact;
  businessAddress?: BusinessAddressConfig;
  supportingDocuments?: any[];
  
  // Shared Security / Credentials Payload Block
  account?: {
    username?: string;
    password?: string;
    securityPhrase?: string;
    profilePreview?: string;
  };
}

interface FormContextType {
  formData: MasterFormData;
  setFormData: React.Dispatch<React.SetStateAction<MasterFormData>>;
  wipeFlowCache: (flowType: "savings" | "current" | "all") => void;
}

const initialFormState: MasterFormData = {
  journeyId: "",
  idType: "ic",
  idNum: "",
  personalInfo: {},
  homeAddress: {},
  mailingAddress: {},
  businessParticulars: {},
  businessContact: {},
  businessAddress: {},
  supportingDocuments: [],
  account: {},
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<MasterFormData>(initialFormState);

  // Structural cache flushing loop to scrub session tracks safely on demand
  const wipeFlowCache = (flowType: "savings" | "current" | "all") => {
    setFormData((prev) => {
      if (flowType === "savings") {
        return {
          ...initialFormState,
        };
      }
      if (flowType === "current") {
        return {
          ...prev,
          businessParticulars: {},
          businessContact: {},
          businessAddress: {},
          supportingDocuments: [],
          account: {},
        };
      }
      return initialFormState;
    });

    // Mirror scrubbing state parameters directly out of browser memory pools
    if (typeof window !== "undefined") {
      if (flowType === "current") {
        localStorage.removeItem("nonMsianAddress");
        localStorage.removeItem("nonMsianInfo");
        localStorage.removeItem("phoneVerification");
      } else {
        localStorage.clear();
      }
    }
  };

  return (
    <FormContext.Provider value={{ formData, setFormData, wipeFlowCache }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormContext);
  if (!context) {
    // Backwards compatibility fallback layout matching schema matrices
    return {
      formData: initialFormState,
      setFormData: () => {},
      wipeFlowCache: () => {},
    };
  }
  return context;
}