import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Mailing Address Verification - DTCOB',
  description: 'Personal Account Malaysian Mailing Address Verification page for DTCOB banking services.',
};

export default function PersonalMalaysianMailingAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}