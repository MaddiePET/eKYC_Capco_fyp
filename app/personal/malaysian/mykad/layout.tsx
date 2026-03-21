import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Personal Account Malaysian MyKad Upload - DTCOB',
  description: 'Personal Account Malaysian MyKad Upload page for DTCOB banking services.',
};

export default function PersonalMalaysianMyKadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}