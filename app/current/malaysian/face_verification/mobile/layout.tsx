import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Mobile Face Capture - DTCOB',
  description: 'Current Account Malaysian Mobile Face Capture page for DTCOB banking services.',
};

export default function CurrentMalaysianMobileFaceCapture({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}