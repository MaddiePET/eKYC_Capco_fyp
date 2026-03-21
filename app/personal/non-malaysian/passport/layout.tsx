import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Passport Upload - DTCOB',
  description: 'Personal Account Non-Malaysian Passport Upload page for DTCOB banking services.',
};

export default function PersonalNonMalaysianPassportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}