import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Mobile MyKad Capture - DTCOB',
  description: 'Current Account Malaysian Mobile MyKad Capture page for DTCOB banking services.',
};

export default function CurrentMalaysianMobileMyKadCapture({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}