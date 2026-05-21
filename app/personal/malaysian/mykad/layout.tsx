import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian MyKad Verification QR Code Scanner - DTCOB',
  description: 'Personal Account Malaysian MyKad Verification QR Code Scanner page for DTCOB banking services.',
};

export default function PersonalMalaysianMyKadQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}