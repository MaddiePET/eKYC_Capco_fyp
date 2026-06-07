import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Account Creation - DTCOB',
  description: 'Savings Account Non-Malaysian Account Creation page for DTCOB banking services.',
};

export default function SavingsNonMalaysianAccountCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}