import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian Personal Information Verification - DTCOB',
  description: 'Savings Account Malaysian Personal Information Verification page for DTCOB banking services.',
};

export default function SavingsMalaysianInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}