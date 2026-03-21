import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Address Details - DTCOB',
  description: 'Personal Account Non-Malaysian Address Details page for DTCOB banking services.',
};

export default function PersonalNonMalaysianAddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}