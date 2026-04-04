import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Email Address Verification - DTCOB',
  description: 'Personal Account Non-Malaysian Email Address Verification page for DTCOB banking services.',
};

export default function PersonalNonMalaysianEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}