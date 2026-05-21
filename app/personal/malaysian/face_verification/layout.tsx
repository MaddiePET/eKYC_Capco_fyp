import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Face QR Code Scanner - DTCOB',
  description: 'Personal Account Malaysian Face QR Code Scanner page for DTCOB banking services.',
};

export default function PersonalMalaysianFaceQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}