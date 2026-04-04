import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Nationality Selection - DTCOB',
  description: 'Personal Account Nationality Selection page for DTCOB banking services.',
};

export default function PersonalNationalitySelectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}