import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Personal Information Verification - DTCOB',
  description: 'Business Account Malaysian Personal Information Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}