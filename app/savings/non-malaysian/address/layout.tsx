import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Address Details - DTCOB',
  description: 'Savings Account Non-Malaysian Address Details page for DTCOB banking services.',
};

export default function SavingsNonMalaysianAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}