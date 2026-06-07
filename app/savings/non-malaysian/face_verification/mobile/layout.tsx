import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Mobile Face Capture - DTCOB',
  description: 'Savings Account Non-Malaysian Mobile Face Capture page for DTCOB banking services.',
};

export default function SavingsNonMalaysianMobileFaceCaptureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}