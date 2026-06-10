import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian MyKad Verification QR Code Scanner - DTCOB',
  description: 'Current Account Malaysian MyKad Verification QR Code Scanner page for DTCOB banking services.',
};

export default function CurrentMalaysianMyKadQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}