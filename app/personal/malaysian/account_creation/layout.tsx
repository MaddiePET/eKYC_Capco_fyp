import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Account Creation - DTCOB',
  description: 'Personal Account Malaysian Account Creation page for DTCOB banking services.',
};

export default function PersonalMalaysianAccountCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}