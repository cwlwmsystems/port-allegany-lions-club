import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import './globals.css';
import { Header, Footer } from '@/components/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://portlionsclub.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Port Allegany Lions Club | Local Hearts. Lasting Impact.',
    template: '%s | Port Allegany Lions Club'
  },
  description:
    'Neighbors coming together through service in Port Allegany, Pennsylvania. Learn about the Lions, explore upcoming opportunities, and get involved.',
  openGraph: {
    type: 'website',
    siteName: 'Port Allegany Lions Club',
    title: 'Port Allegany Lions Club',
    description:
      'Rooted in community. Driven by service.',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      <Analytics /></body>
    </html>
  );
}
