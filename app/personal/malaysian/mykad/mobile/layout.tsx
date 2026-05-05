import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Mobile MyKad Capture - DTCOB',
  description: 'Personal Account Malaysian Mobile MyKad Capture page for DTCOB banking services.',
};

export default function PersonalMalaysianMobileMyKadCapture({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}