import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Dashboard Profile - DTCOB',
  description: 'Dashboard Profile page for DTCOB banking services.',
};

export default function DashboardProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}