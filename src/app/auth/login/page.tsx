import LogInForm from "@/components/auth/LogInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DTCOB LogIn Page | Digital Transformation of Customer Onboarding for Bank A",
  description: "This is DTCOB LogIn Page | Digital Transformation of Customer Onboarding for Bank A",
};

export default function LogIn() {
  return <LogInForm />;
}
