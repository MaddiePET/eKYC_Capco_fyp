import React from 'react';
import Script from 'next/script';

export const metadata = {
  title: 'DTCOB',
  description: 'DTCOB Website',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/css/templatemo-tiya-golf-club.css" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}

        <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="afterInteractive" />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/js/jquery.sticky.js"
          strategy="afterInteractive"
        />
        <Script
          src="/js/click-scroll.js"
          strategy="afterInteractive"
        />
        <Script
          src="/js/animated-headline.js"
          strategy="afterInteractive"
        />
        <Script
          src="/js/modernizr.js"
          strategy="afterInteractive"
        />
        <Script
          src="/js/custom.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}