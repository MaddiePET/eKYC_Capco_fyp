import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Supporting Documents Upload - DTCOB',
  description: 'Business Account Malaysian Supporting Documents Upload page for DTCOB banking services.',
};

export default function BusinessMalaysianSupportingDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}