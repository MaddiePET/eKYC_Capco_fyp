import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian Mailing Address Verification - DTCOB',
  description: 'Savings Account Malaysian Mailing Address Verification page for DTCOB banking services.',
};

export default function SavingsMalaysianMailingAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}