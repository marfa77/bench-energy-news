import type { Metadata } from 'next';
import './globals.css';
import dynamic from 'next/dynamic';

// Dynamically import Client Components to prevent SSR blocking
const Header = dynamic(() => import('./components/Header'), { ssr: true });
const Footer = dynamic(() => import('./components/Footer'), { ssr: true });

export const metadata: Metadata = {
  title: {
    default: 'FreightTender - Closed Freight Tender Platform | Bench Energy',
    template: '%s | Bench Energy',
  },
  description: 'FreightTender: Replace email-based freight tendering with structured closed tenders. Designed for commodity and chemical traders. Get better rates through true competition with full privacy and auditability.',
  keywords: ['freight tender platform', 'closed tender', 'commodity trading', 'freight tendering', 'chemical traders', 'freight offers', 'bulk freight', 'Bench Energy', 'FreightTender', '@Bench_energy'],
  authors: [{ name: 'Bench Energy' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  alternates: {
    canonical: 'https://www.bench.energy',
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'FreightTender - Closed Freight Tender Platform for Commodity Traders',
    description: 'Replace email-based freight tendering with structured closed tenders. Get better rates through true competition with full privacy and auditability.',
    type: 'website',
    url: 'https://www.bench.energy',
    images: [
      {
        url: 'https://www.bench.energy/logo.png',
        width: 1200,
        height: 630,
        alt: 'Bench Energy Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        
        {/* Schema.org Organization for LLM optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Bench Energy",
              "url": "https://www.bench.energy",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.bench.energy/logo.png",
                "width": 1200,
                "height": 630
              },
              "description": "Bench Energy provides expert analysis on coal markets, freight logistics, and energy industry. Daily coal market news, expert insights, and FreightTender platform for commodity traders.",
              "foundingDate": "2024",
              "sameAs": [
                "https://t.me/Bench_energy"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@bench.energy",
                "contactType": "Customer Service",
                "availableLanguage": ["English"]
              },
              "areaServed": {
                "@type": "Place",
                "name": "Global"
              },
              "knowsAbout": [
                "Coal Market Analysis",
                "Thermal Coal",
                "Coking Coal",
                "Freight Logistics",
                "Commodity Trading",
                "Energy Markets",
                "Freight Tender Platform"
              ],
              "offers": {
                "@type": "Service",
                "name": "Coal Market Intelligence",
                "description": "Daily coal market news, expert analysis, and freight intelligence for commodity traders"
              }
            })
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
