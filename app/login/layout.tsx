import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Log In - DTCOB',
  description: 'Log In page for DTCOB banking services.',
};

export default function LogInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}