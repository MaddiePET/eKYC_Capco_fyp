import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian Business Particulars - DTCOB',
  description: 'Business Account Malaysian Business Particulars page for DTCOB banking services.',
};

export default function BusinessMalaysianBusinessParticularsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}