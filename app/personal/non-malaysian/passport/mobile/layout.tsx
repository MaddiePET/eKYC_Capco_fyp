import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Mobile Passport Capture - DTCOB',
  description: 'Personal Account Non-Malaysian Mobile Passport Capture page for DTCOB banking services.',
};

export default function PersonalNonMalaysianMobilePassportCaptureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}