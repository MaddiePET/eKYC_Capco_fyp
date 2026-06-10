import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian OTP Verification - DTCOB',
  description: 'Savings Account Non-Malaysian OTP Verification page for DTCOB banking services.',
};

export default function SavingsNonMalaysianOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}