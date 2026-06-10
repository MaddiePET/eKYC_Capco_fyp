import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account User Verification - DTCOB',
  description: 'Current Account User Verification page for DTCOB banking services.',
};

export default function CurrentUserVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}