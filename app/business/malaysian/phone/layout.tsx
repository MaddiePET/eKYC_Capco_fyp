import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Phone Number Verification - DTCOB',
  description: 'Business Account Malaysian Phone Number Verification page for DTCOB banking services.',
};

export default function BusinessMalaysianPhoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}