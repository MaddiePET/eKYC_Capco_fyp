import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Face Verification QR Code Scan - DTCOB',
  description: 'Personal Account Non-Malaysian Face Verification QR Code Scan page for DTCOB banking services.',
};

export default function PersonalNonMalaysianFaceQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}