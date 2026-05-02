import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian MyKad QR Code Scan - DTCOB',
  description: 'Personal Account Malaysian MyKad QR Code Scan page for DTCOB banking services.',
};

export default function PersonalMalaysianMyKadQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}