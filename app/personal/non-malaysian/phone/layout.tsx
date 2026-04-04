import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Phone Number Verification - DTCOB',
  description: 'Personal Account Non-Malaysian Phone Number Verification page for DTCOB banking services.',
};

export default function PersonalNonMalaysianPhoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}