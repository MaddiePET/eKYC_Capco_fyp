import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account User Verification - DTCOB',
  description: 'Savings Account User Verification page for DTCOB banking services.',
};

export default function SavingsUserVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}