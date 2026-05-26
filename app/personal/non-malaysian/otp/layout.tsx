import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian OTP Verification - DTCOB',
  description: 'Personal Account Non-Malaysian OTP Verification page for DTCOB banking services.',
};

export default function PersonalNonMalaysianOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}