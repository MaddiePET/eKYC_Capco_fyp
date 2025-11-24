"use client";
import React from "react";
import { SidebarProvider } from '@/context/SidebarContext';
import AdminLayoutContent from './AdminLayoutContent';

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