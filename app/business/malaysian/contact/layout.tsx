import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Contacts Verification - DTCOB',
  description: 'Business Account Malaysian Contacts Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}