import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Malaysian Application - DTCOB',
  description: 'Savings Account Malaysian Application page for DTCOB banking services.',
};

export default function SavingsMalaysianApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}