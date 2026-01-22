import type { Metadata } from "next";

const SITE_URL = "https://www.bench.energy";

export const metadata: Metadata = {
  title: "Blog - Coal Market News & Insights | Bench Energy",
  description: "Articles about coal markets, freight, and energy industry insights from Bench Energy experts.",
  keywords: [
    "coal market blog",
    "energy news",
    "freight logistics",
    "commodity trading",
    "bench energy blog",
  ],
  openGraph: {
    title: "Blog - Coal Market News & Insights | Bench Energy",
    description: "Articles about coal markets, freight, and energy industry insights from Bench Energy experts.",
    url: `${SITE_URL}/blog`,
    type: "website",
    siteName: "Bench Energy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Coal Market News & Insights | Bench Energy",
    description: "Articles about coal markets, freight, and energy industry insights.",
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
