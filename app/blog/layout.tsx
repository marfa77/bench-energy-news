import type { Metadata } from "next";

const SITE_URL = "https://www.bench.energy";

export const metadata: Metadata = {
  title: "Blog - Coal Market Analysis & Freight Logistics Insights | Bench Energy",
  description: "Expert articles on coal markets, thermal coal prices, coking coal trends, dry bulk shipping rates, freight logistics, port operations, and commodity trading strategies. Bench Energy provides data-driven analysis with specific numbers, market insights, and actionable intelligence for traders.",
  keywords: [
    "coal market blog",
    "thermal coal prices",
    "coking coal markets",
    "dry bulk shipping",
    "freight rates",
    "port congestion",
    "vessel availability",
    "commodity trading",
    "energy market analysis",
    "bench energy blog",
    "coal market analysis",
    "freight logistics",
    "bulk commodity trading",
  ],
  authors: [{ name: "Bench Energy" }],
  openGraph: {
    title: "Blog - Coal Market Analysis & Freight Logistics Insights | Bench Energy",
    description: "Expert articles on coal markets, freight logistics, and energy industry trends with specific data points and market analysis.",
    url: `${SITE_URL}/blog`,
    type: "website",
    siteName: "Bench Energy",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Bench Energy Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Coal Market Analysis & Freight Logistics Insights | Bench Energy",
    description: "Expert articles on coal markets, freight logistics, and energy industry trends.",
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
