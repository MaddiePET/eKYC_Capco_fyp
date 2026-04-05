'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormData {
  [key: string]: any;
}

interface FormContextType {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>({});

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormData() {
  const context = useContext(FormContext);
  // Return a default context if not inside provider (for backwards compatibility)
  if (!context) {
    return {
      formData: {},
      setFormData: (data: FormData) => {
        // No-op stub
      }
    };
  }
  return context;
}

