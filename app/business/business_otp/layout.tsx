import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Business OTP Verification - DTCOB',
  description: 'Business Account Malaysian Business OTP Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianBusinessOTPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}