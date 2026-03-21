import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Email Address Verification - DTCOB',
  description: 'Business Account Malaysian Email Address Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}