import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Passport Verification QR Code Scanner - DTCOB',
  description: 'Savings Account Non-Malaysian Passport Verification QR Code Scanner page for DTCOB banking services.',
};

export default function SavingsNonMalaysianPassportQRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}