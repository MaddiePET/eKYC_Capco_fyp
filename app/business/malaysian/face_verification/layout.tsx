import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Face Verification - DTCOB',
  description: 'Business Account Malaysian Face Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianFaceVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}