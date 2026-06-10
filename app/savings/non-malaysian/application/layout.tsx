import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Non-Malaysian Application - DTCOB',
  description: 'Savings Account Non-Malaysian Application page for DTCOB banking services.',
};

export default function SavingsNonMalaysianApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}