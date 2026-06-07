import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian OTP Verification - DTCOB',
  description: 'Savings Account Malaysian OTP Verification page for DTCOB banking services.',
};

export default function SavingsMalaysianOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}