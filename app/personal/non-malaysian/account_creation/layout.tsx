import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Account Creation - DTCOB',
  description: 'Personal Account Non-Malaysian Account Creation page for DTCOB banking services.',
};

export default function PersonalNonMalaysianAccountCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}