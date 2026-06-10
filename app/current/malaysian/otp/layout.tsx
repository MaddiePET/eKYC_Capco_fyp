import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian OTP Verification - DTCOB',
  description: 'Current Account Malaysian OTP Verification page for DTCOB banking services.',
};

export default function CurrentMalaysianOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}