import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import TrafficBeacon from '@/components/TrafficBeacon';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'RefundLocators — Surplus Fund AI',
  description: 'The AI that already knows your Ohio foreclosure surplus case. Ask Lauren anything — she reads court records in real time. Free, no signup.',
  keywords: 'Ohio foreclosure surplus funds, surplus fund recovery, foreclosure auction, Ohio homeowner',
  verification: {
    google: '_iV9yFBAH51XWoNz8C7DsMZUGZPyFQuAgpDuw13LSeo',
  },
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
  // iOS Safari: tell the on-screen keyboard to overlay (not resize) so our
  // chat sheet can manage its own height via visualViewport. Prevents the
  // whole page from jumping when the keyboard appears.
  interactiveWidget: 'overlays-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="scroll-progress" aria-hidden="true" />
        {children}
        <Analytics />
        <Suspense fallback={null}>
          <TrafficBeacon />
        </Suspense>
      </body>
    </html>
  );
}
