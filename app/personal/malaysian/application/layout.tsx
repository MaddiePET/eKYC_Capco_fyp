import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian Application - DTCOB',
  description: 'Personal Account Malaysian Application page for DTCOB banking services.',
};

export default function PersonalMalaysianApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}