import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Face Verification - DTCOB',
  description: 'Personal Account Malaysian Face Verification page for DTCOB banking services.',
};

export default function PersonalMalaysianFaceVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}