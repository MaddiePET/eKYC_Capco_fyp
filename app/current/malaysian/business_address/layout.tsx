import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Business Address Verification - DTCOB',
  description: 'Current Account Malaysian Business Address Verification page for DTCOB banking services.',
};

export default function CurrentMalaysianBusinessAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}