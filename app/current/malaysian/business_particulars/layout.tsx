import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Current Account Malaysian Business Particulars - DTCOB',
  description: 'Current Account Malaysian Business Particulars page for DTCOB banking services.',
};

export default function CurrentMalaysianBusinessParticularsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}