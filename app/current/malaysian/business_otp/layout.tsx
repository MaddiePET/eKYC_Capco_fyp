import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Business OTP Verification - DTCOB',
  description: 'Current Account Malaysian Business OTP Verification page for DTCOB banking services.',
};

export default function CurrentMalaysianBusinessOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}