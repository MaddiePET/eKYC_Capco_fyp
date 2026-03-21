import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Personal Information Verification - DTCOB',
  description: 'Personal Account Non-Malaysian Personal Information Verification page for DTCOB banking services.',
};

export default function PersonalNonMalaysianInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}