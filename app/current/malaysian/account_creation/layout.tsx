import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Account Creation - DTCOB',
  description: 'Current Account Malaysian Account Creation page for DTCOB banking services.',
};

export default function CurrentMalaysianAccountCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}