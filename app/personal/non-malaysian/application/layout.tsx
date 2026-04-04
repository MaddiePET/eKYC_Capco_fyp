import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Non-Malaysian Application - DTCOB',
  description: 'Personal Account Non-Malaysian Application page for DTCOB banking services.',
};

export default function PersonalNonMalaysianApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}