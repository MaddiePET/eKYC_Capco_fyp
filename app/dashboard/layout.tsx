import React from "react";
import { SidebarProvider } from '@/context/SidebarContext';
import AdminLayoutContent from './AdminLayoutContent';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Dashboard - DTCOB',
  description: 'Dashboard page for DTCOB banking services.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}