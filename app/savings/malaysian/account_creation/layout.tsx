import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian Account Creation - DTCOB',
  description: 'Savings Account Malaysian Account Creation page for DTCOB banking services.',
};

export default function SavingsMalaysianAccountCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}