import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Business Address Verification - DTCOB',
  description: 'Business Account Malaysian Business Address Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianBusinessAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}