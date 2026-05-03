import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Passport QR Code Scan - DTCOB',
  description: 'Personal Account Non-Malaysian Passport QR Code Scan page for DTCOB banking services.',
};

export default function PersonalNonMalaysianPassportQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}