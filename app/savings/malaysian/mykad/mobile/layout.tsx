import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian Mobile MyKad Capture - DTCOB',
  description: 'Savings Account Malaysian Mobile MyKad Capture page for DTCOB banking services.',
};

export default function SavingsMalaysianMobileMyKadCapture({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}