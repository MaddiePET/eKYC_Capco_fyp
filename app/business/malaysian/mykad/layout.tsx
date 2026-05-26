import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian MyKad Verification QR Code Scanner - DTCOB',
  description: 'Business Account Malaysian MyKad Verification QR Code Scanner page for DTCOB banking services.',
};

export default function BusinessMalaysianMyKadQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}