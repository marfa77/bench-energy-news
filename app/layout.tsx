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
  keywords: [
    'freight tender platform',
    'closed tender',
    'commodity trading',
    'freight tendering',
    'chemical traders',
    'freight offers',
    'bulk freight',
    'Bench Energy',
    'FreightTender',
    '@Bench_energy',
    'coal freight rates',
    'coal logistics',
    'coal logistics management',
    'coal logistics policy',
    'freight cost reduction',
    'executive freight solutions',
    'C-level freight management',
  ],
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
    title: 'FreightTender - Closed Freight Tender Platform for Commodity Traders | Bench Energy',
    description: 'Replace email-based freight tendering with structured closed tenders. Get better rates through true competition with full privacy and auditability. Daily coal market news and expert analysis.',
    type: 'website',
    url: 'https://www.bench.energy',
    siteName: 'Bench Energy',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.bench.energy/logo.png',
        width: 1200,
        height: 630,
        alt: 'Bench Energy - Coal Market Intelligence & Freight Tender Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreightTender - Closed Freight Tender Platform | Bench Energy',
    description: 'Replace email-based freight tendering with structured closed tenders. Daily coal market news and expert analysis.',
    images: ['https://www.bench.energy/logo.png'],
    site: '@Bench_energy',
    creator: '@Bench_energy',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'Energy & Commodity Trading',
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
        
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-F55Q439F8J"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-F55Q439F8J');
            `,
          }}
        />
        
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
                "Freight Tender Platform",
                "Dry Bulk Shipping",
                "Port Operations",
                "Vessel Availability",
                "Freight Rates",
                "Coal Prices",
                "Energy Industry Trends"
              ],
              "offers": [
                {
                  "@type": "Service",
                  "name": "Coal Market Intelligence",
                  "description": "Daily coal market news, expert analysis, and freight intelligence for commodity traders",
                  "serviceType": "Market Intelligence"
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "FreightTender",
                  "description": "Closed freight tender platform for commodity and chemical traders",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "50"
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
