import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Passport Verification QR Code Scanner - DTCOB',
  description: 'Personal Account Non-Malaysian Passport Verification QR Code Scanner page for DTCOB banking services.',
};

export default function PersonalNonMalaysianPassportQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}