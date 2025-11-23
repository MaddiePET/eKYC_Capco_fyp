import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AdminLayoutContent from './AdminLayoutContent'; // We'll create this

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            {/* We use a new client component here so we can use
              the useSidebar hook inside of it.
            */}
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}