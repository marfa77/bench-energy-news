import Link from 'next/link';
import Image from 'next/image';
import dynamicImport from 'next/dynamic';
import { Metadata } from 'next';
import { Newspaper, FileText, Ship, ArrowRight, Sparkles, TrendingUp, Globe, Users } from 'lucide-react';
import ContactLink from './components/ContactLink';

const FeatureTabs = dynamicImport(() => import('./components/FeatureTabs'), { ssr: false });

export const metadata: Metadata = {
  title: 'FreightTender - Closed Freight Tender Platform for Commodity Traders | Bench Energy',
  description: 'FreightTender: Replace email-based freight tendering with structured offers, closed competition, and full auditability. Designed for commodity and chemical traders. Daily coal market news and expert analysis. Get a demo today.',
  keywords: [
    'freight tender platform',
    'commodity trading',
    'freight tendering',
    'closed tender',
    'freight offers',
    'chemical traders',
    'bulk freight',
    'freight logistics',
    'Bench Energy',
    'FreightTender',
    'coal market news',
    'coal prices',
    'thermal coal',
    'coking coal',
    'dry bulk shipping',
    'freight rates',
    'port operations',
    'vessel availability',
    'energy market analysis',
  ],
  authors: [{ name: 'Bench Energy' }],
  openGraph: {
    title: 'Bench Energy - Coal Market News & Freight Tender Platform',
    description: 'Daily coal market news, expert analysis, and freight intelligence for commodity traders. FreightTender platform for closed freight tenders.',
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
    title: 'Bench Energy - Coal Market News & Freight Tender Platform',
    description: 'Daily coal market news, expert analysis, and freight intelligence for commodity traders.',
    images: ['https://www.bench.energy/logo.png'],
    site: '@Bench_energy',
    creator: '@Bench_energy',
  },
  alternates: {
    canonical: 'https://www.bench.energy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface Article {
  id: string;
  slug: string;
  title: string;
  description?: string;
  publishedAt: string;
  sourceUrl?: string;
  sourceName?: string;
  category?: string;
}

async function getLatestArticles(): Promise<Article[]> {
  try {
    // Use the API route that already works
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
    
    const response = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 900 }, // 15 minutes cache
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const articles = data.articles || [];
    
    // Return only the latest 6 articles
    return articles.slice(0, 6);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

// Force dynamic generation to fetch latest news
export const dynamic = 'force-dynamic';
export const revalidate = 900; // 15 minutes

export default async function HomePage() {
  const latestArticles = await getLatestArticles();
  
  const featuresTabs = [
    {
      name: 'FreightTender',
      description: 'Closed freight tender platform for commodity and chemical traders. Replace email-based tendering with structured offers, closed competition, and full auditability.',
      longDescription: 'FreightTender is a closed tender platform designed specifically for commodity and chemical traders. Submit structured freight offers in a competitive but private environment where brokers can\'t see each other\'s bids. Get better rates through true competition while maintaining complete privacy and control. Full audit trail ensures transparency where you need it.',
      icon: <Ship className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    },
    {
      name: 'Market News',
      description: 'Daily updates on coal markets, prices, and industry analysis with expert insights from Bench Energy.',
      longDescription: 'Get the latest coal market news with comprehensive analysis. We track price movements, supply chain dynamics, and regional developments across major coal markets including thermal and coking coal. Stay informed to make better trading decisions.',
      icon: <Newspaper className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    },
    {
      name: 'Expert Analysis',
      description: 'In-depth articles about coal markets, freight, and energy industry insights from Bench Energy experts.',
      longDescription: 'Read detailed analysis articles covering market trends, freight logistics, and strategic insights. Our experts provide actionable intelligence for commodity traders and energy market participants. Deep dive into freight rates, market dynamics, and trading strategies.',
      icon: <FileText className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    }
  ];

  return (
    <>
      {/* Schema.org WebSite and BreadcrumbList for LLM optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Bench Energy",
            "url": "https://www.bench.energy",
            "description": "Coal market intelligence and freight solutions for commodity traders",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.bench.energy/news?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Bench Energy",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.bench.energy/logo.png"
              }
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.bench.energy"
              }
            ]
          })
        }}
      />
      {/* FAQPage Schema for LLM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What services does Bench Energy offer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Bench Energy provides daily coal market news, expert analysis articles, and the FreightTender platform for closed freight tenders. We specialize in delivering actionable intelligence for commodity traders and energy market participants. Our services include thermal coal price analysis, coking coal market insights, freight rate tracking, and a structured freight tender platform."
                }
              },
              {
                "@type": "Question",
                "name": "How often is the news updated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We publish daily market news articles covering coal prices, supply chain dynamics, regional developments, and industry analysis. Our Telegram channel @Bench_energy provides real-time updates throughout the day. Articles are published multiple times daily with the latest market intelligence."
                }
              },
              {
                "@type": "Question",
                "name": "What is FreightTender?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FreightTender is a closed tender platform designed for commodity and chemical traders. It replaces email-based freight tendering with structured offers, closed competition (brokers can't see each other's bids), and full auditability. You get better rates through true competition while maintaining complete privacy and control."
                }
              },
              {
                "@type": "Question",
                "name": "How can I stay updated on coal market news?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Follow our Telegram channel @Bench_energy for daily market updates, or visit our website regularly for in-depth analysis articles and news coverage. You can also subscribe to our RSS feed at https://www.bench.energy/feed.xml for automatic updates."
                }
              },
              {
                "@type": "Question",
                "name": "What types of coal market analysis do you provide?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We provide comprehensive analysis on thermal coal prices, coking coal markets, dry bulk shipping rates, port operations, vessel availability, supply chain dynamics, and regional market developments. Our analysis includes specific data points, price trends, and actionable intelligence for traders."
                }
              },
              {
                "@type": "Question",
                "name": "Who can use FreightTender?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FreightTender is designed for commodity trading companies and chemical trading desks that need to tender freight regularly. If you're currently using email to coordinate freight tenders with multiple brokers, FreightTender will streamline your process significantly with structured offers and closed competition."
                }
              }
            ]
          })
        }}
      />
      {/* HowTo Schema for FreightTender */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Use FreightTender for Closed Freight Tenders",
            "description": "Step-by-step guide to using FreightTender platform for structured freight tendering",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Create a Tender",
                "text": "Create a new freight tender in FreightTender with vessel specifications, laycan, and technical requirements.",
                "position": 1
              },
              {
                "@type": "HowToStep",
                "name": "Invite Brokers",
                "text": "Invite specific brokers to participate. Each broker sees only their own invitation and cannot see other participants.",
                "position": 2
              },
              {
                "@type": "HowToStep",
                "name": "Receive Structured Offers",
                "text": "Brokers submit structured offers with freight rate, vessel specs, laycan confirmation, and technical compliance in standardized format.",
                "position": 3
              },
              {
                "@type": "HowToStep",
                "name": "Compare and Award",
                "text": "View all offers in a single table view for easy comparison. Select and award the best offer with full audit trail.",
                "position": 4
              }
            ]
          })
        }}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-8">
            <Image
              src="/logo.png"
              alt="Bench Energy - Coal Market Intelligence Platform"
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
            />
            <span className="text-sm font-medium text-green-600">
              Bench Energy
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Replace email-based freight tendering
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              with structured closed tenders
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            FreightTender is a closed tender platform for commodity and chemical traders. Submit structured freight offers in a competitive but private environment with full audit trail and transparency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/freighttender"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started with FreightTender
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/freighttender#demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* FreightTender Value Proposition Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why FreightTender?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop losing time and money on email-based freight tendering. Get structured offers, closed competition, and full auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Ship className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Closed Competition
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Brokers can't see each other's offers. No information leakage, no manipulation. True competitive bidding in a private environment.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Structured Offers
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Standardized format eliminates errors and misinterpretation. All technical terms captured systematically. No more rewriting or manual data entry.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Full Auditability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Complete audit trail of all offers, decisions, and communications. Transparency where you need it, privacy where you don't.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/freighttender"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl text-lg"
            >
              Learn More About FreightTender
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News Section - Supporting Content */}
      {latestArticles.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Market Intelligence
                </h2>
                <p className="text-gray-600">
                  Stay informed with daily coal market news and expert analysis
                </p>
              </div>
              <Link
                href="/news"
                className="text-green-600 hover:text-green-700 font-semibold inline-flex items-center"
              >
                View All News
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article, index) => (
                <article 
                  key={article.id} 
                  className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex-grow flex flex-col">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                      <Link href={`/news/${article.slug}`} className="no-underline">
                        {article.title}
                      </Link>
                    </h3>
                    {article.description && (
                      <p className="text-gray-600 mb-4 flex-grow line-clamp-3 text-sm leading-relaxed">
                        {article.description.length > 150 ? `${article.description.substring(0, 150)}...` : article.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <time className="text-xs text-gray-500 font-medium">
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                      <Link 
                        href={`/news/${article.slug}`} 
                        className="text-green-600 font-semibold text-xs hover:text-green-700 no-underline inline-flex items-center group/link"
                      >
                        Read more
                        <svg className="ml-1 w-3 h-3 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FreightTender Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How FreightTender Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, powerful platform designed specifically for commodity and chemical traders
            </p>
          </div>

          <div className="mx-auto max-w-2xl lg:max-w-none">
            <FeatureTabs tabs={featuresTabs} />
          </div>
        </div>
      </section>

      {/* Who Uses FreightTender Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Commodity & Chemical Traders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              FreightTender is designed specifically for companies that need structured, competitive freight tendering without the chaos of email chains
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Commodity Trading Companies
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Streamline your freight tendering process. Get better rates through true competition while maintaining complete privacy and control.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4">
                <Ship className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Chemical Trading Desks
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Eliminate email-based coordination headaches. Standardize your tender process and get all offers in one structured view.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/freighttender"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors text-lg"
            >
              See Full Capabilities
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - FreightTender Focus */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-green-600 to-emerald-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Freight Tender Process?
          </h2>
          <p className="text-xl text-green-50 mb-10 leading-relaxed">
            Get a demo of FreightTender and see how structured closed tenders can save you time, improve rates, and eliminate coordination headaches.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/freighttender"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl text-lg"
            >
              Get Started with FreightTender
              <ArrowRight className="w-5 h-5" />
            </Link>
            <ContactLink
              type="email"
              href="mailto:support@bench.energy?subject=FreightTender Demo Request"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg"
            >
              Request Demo
            </ContactLink>
          </div>
          <p className="mt-8 text-green-100 text-sm">
            Or contact us:{' '}
            <ContactLink
              type="email"
              href="mailto:support@bench.energy"
              className="underline font-semibold"
            >
              support@bench.energy
            </ContactLink>
            {' | '}
            <ContactLink
              type="telegram"
              href="https://t.me/Bench_energy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              @Bench_energy
            </ContactLink>
          </p>
        </div>
      </section>

      {/* FAQ Section - FreightTender Focus */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Everything you need to know about FreightTender
          </p>
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                What is FreightTender?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                FreightTender is a closed tender platform designed specifically for commodity and chemical traders. It replaces email-based freight tendering with structured offers, closed competition (brokers can't see each other), and full auditability. You get better rates through true competition while maintaining complete privacy.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                How is FreightTender different from email tendering?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Email tendering has major problems: brokers can see each other's offers (information leakage), unstructured data requires manual entry, and there's no audit trail. FreightTender solves all of this with structured offers, closed competition, and complete transparency where you need it.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Who can use FreightTender?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                FreightTender is designed for commodity trading companies and chemical trading desks that need to tender freight regularly. If you're currently using email to coordinate freight tenders with multiple brokers, FreightTender will streamline your process significantly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                How do I get started?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Contact us at <ContactLink type="email" href="mailto:support@bench.energy" className="text-green-600 hover:underline font-semibold">support@bench.energy</ContactLink> or <ContactLink type="telegram" href="https://t.me/Bench_energy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-semibold">@Bench_energy</ContactLink> to request a demo. We'll show you how FreightTender works and help you set up your first closed tender.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/freighttender"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              Learn More About FreightTender
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
