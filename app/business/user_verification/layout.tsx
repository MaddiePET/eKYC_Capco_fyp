import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account User Verification - DTCOB',
  description: 'Business Account User Verification page for DTCOB banking services.',
};

export default function BusinessUserVerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}