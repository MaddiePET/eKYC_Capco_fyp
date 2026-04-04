import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Phone Number Verification - DTCOB',
  description: 'Personal Account Malaysian Phone Number Verification page for DTCOB banking services.',
};

export default function PersonalMalaysianPhoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}