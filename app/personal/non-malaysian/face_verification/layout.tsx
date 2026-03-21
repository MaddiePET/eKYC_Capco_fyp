import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Face Verification - DTCOB',
  description: 'Personal Account Non-Malaysian Face Verification page for DTCOB banking services.',
};

export default function PersonalNonMalaysianFaceVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}