import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Savings Account Nationality Selection - DTCOB',
  description: 'Savings Account Nationality Selection page for DTCOB banking services.',
};

export default function SavingsNationalitySelectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}