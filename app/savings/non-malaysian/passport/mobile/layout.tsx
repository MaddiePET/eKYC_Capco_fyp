import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Mobile Passport Capture - DTCOB',
  description: 'Savings Account Non-Malaysian Mobile Passport Capture page for DTCOB banking services.',
};

export default function SavingsNonMalaysianMobilePassportCaptureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}