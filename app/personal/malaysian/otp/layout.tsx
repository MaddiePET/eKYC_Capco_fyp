import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian OTP Verification - DTCOB',
  description: 'Personal Account Malaysian OTP Verification page for DTCOB banking services.',
};

export default function PersonalMalaysianOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}