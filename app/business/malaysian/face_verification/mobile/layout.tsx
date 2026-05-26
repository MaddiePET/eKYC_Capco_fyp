import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Mobile Face Capture - DTCOB',
  description: 'Business Account Malaysian Mobile Face Capture page for DTCOB banking services.',
};

export default function BusinessMalaysianMobileFaceCapture({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}