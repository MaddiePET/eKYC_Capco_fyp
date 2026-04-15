"use client";

import { FormProvider } from "@/context/FormContext";

export default function MalaysianFormShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FormProvider>{children}</FormProvider>;
}