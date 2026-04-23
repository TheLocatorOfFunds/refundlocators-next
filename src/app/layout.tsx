import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'RefundLocators — Surplus Fund AI',
  description: 'The AI that already knows your Ohio foreclosure surplus case. Ask Lauren anything — she reads court records in real time. Free, no signup.',
  keywords: 'Ohio foreclosure surplus funds, surplus fund recovery, foreclosure auction, Ohio homeowner',
  openGraph: {
    title: 'RefundLocators — The AI that already knows your case.',
    description: 'Ask Lauren about your Ohio foreclosure surplus. Real court records, real answers, free.',
    siteName: 'RefundLocators',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="scroll-progress" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
