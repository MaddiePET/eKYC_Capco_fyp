import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Account Creation - DTCOB',
  description: 'Business Account Malaysian Account Creation page for DTCOB banking services.',
};

export default function BusinessMalaysianAccountCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}