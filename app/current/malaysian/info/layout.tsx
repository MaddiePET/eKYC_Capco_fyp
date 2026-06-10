import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Personal Information Verification - DTCOB',
  description: 'Current Account Malaysian Personal Information Verification page for DTCOB banking services.',
};

export default function CurrentMalaysianInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}