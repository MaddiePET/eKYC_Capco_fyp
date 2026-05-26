import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Business Contacts Verification - DTCOB',
  description: 'Business Account Malaysian Business Contacts Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianBusinessContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}