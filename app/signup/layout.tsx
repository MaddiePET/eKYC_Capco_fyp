import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Sign Up - DTCOB',
  description: 'Select your account type to sign up for DTCOB banking services.',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}