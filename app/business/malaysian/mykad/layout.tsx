import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Business Account Malaysian MyKad Upload - DTCOB',
  description: 'Business Account Malaysian MyKad Upload page for DTCOB banking services.',
};

export default function BusinessMalaysianMyKadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}