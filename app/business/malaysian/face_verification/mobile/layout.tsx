import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Mobile MyKad Capture - DTCOB',
  description: 'Business Account Malaysian Mobile MyKad Capture page for DTCOB banking services.',
};

export default function BusinessMalaysianMobileMyKadCapture({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}