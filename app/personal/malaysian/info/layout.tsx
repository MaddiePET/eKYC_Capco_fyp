import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Personal Information Verification - DTCOB',
  description: 'Personal Account Malaysian Personal Information Verification page for DTCOB banking services.',
};

export default function PersonalMalaysianInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}