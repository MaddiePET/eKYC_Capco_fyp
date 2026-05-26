import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian OTP Verification - DTCOB',
  description: 'Business Account Malaysian OTP Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}