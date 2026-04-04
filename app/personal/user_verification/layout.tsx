import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account User Verification - DTCOB',
  description: 'Personal Account User Verification page for DTCOB banking services.',
};

export default function PersonalUserVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}