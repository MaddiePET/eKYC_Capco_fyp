import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian Face Verification QR Code Scanner - DTCOB',
  description: 'Savings Account Malaysian Face Verification QR Code Scanner page for DTCOB banking services.',
};

export default function SavingsMalaysianFaceQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}