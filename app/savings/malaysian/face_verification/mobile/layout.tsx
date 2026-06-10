import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian Mobile Face Capture - DTCOB',
  description: 'Savings Account Malaysian Mobile Face Capture page for DTCOB banking services.',
};

export default function SavingsMalaysianMobileFaceCaptureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}