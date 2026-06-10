import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Personal Information Verification - DTCOB',
  description: 'Savings Account Non-Malaysian Personal Information Verification page for DTCOB banking services.',
};

export default function SavingsNonMalaysianInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}