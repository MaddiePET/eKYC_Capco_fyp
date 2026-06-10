import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Supporting Documents Upload - DTCOB',
  description: 'Current Account Malaysian Supporting Documents Upload page for DTCOB banking services.',
};

export default function CurrentMalaysianSupportingDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}