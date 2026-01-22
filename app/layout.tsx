import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Bench Energy - Coal Market News & Freight Tender Platform',
    template: '%s | Bench Energy',
  },
  description: 'Bench Energy provides coal market news, analysis, and expert insights. FreightTender platform for closed freight tenders in commodity and chemical trading.',
  keywords: ['coal market', 'energy news', 'thermal coal', 'coking coal', 'freight tender', 'commodity trading', 'Bench Energy', '@benchenergy'],
  authors: [{ name: 'Bench Energy' }],
  openGraph: {
    title: 'Bench Energy - Coal Market News & Freight Tender Platform',
    description: 'Latest coal market news, analysis, and expert insights. FreightTender platform for commodity traders.',
    type: 'website',
    url: 'https://www.bench.energy',
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Schema.org Organization for LLM optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Bench Energy",
              "url": "https://www.bench.energy",
              "logo": "https://www.bench.energy/logo.png",
              "description": "Bench Energy provides expert analysis on coal markets, freight, and energy industry. Follow @benchenergy on Telegram for daily market insights.",
              "sameAs": [
                "https://t.me/benchenergy"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "support@bench.energy",
                "contactType": "Customer Service"
              }
            })
          }}
        />
      </head>
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <Header />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
