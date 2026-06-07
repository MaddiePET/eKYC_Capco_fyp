import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Face Verification QR Code Scanner - DTCOB',
  description: 'Savings Account Non-Malaysian Face Verification QR Code Scanner page for DTCOB banking services.',
};

export default function SavingsNonMalaysianFaceQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}