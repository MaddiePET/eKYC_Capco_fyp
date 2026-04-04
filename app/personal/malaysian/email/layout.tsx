import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Email Address Verification - DTCOB',
  description: 'Personal Account Malaysian Email Address Verification page for DTCOB banking services.',
};

export default function PersonalMalaysianEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}