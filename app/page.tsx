import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { Newspaper, FileText, Ship } from 'lucide-react';

const FeatureTabs = dynamicImport(() => import('./components/FeatureTabs'), { ssr: false });

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false;

export default function HomePage() {
  const featuresTabs = [
    {
      name: 'Market News',
      description: 'Daily updates on coal markets, prices, and industry analysis with expert insights from Bench Energy.',
      longDescription: 'Get the latest coal market news with comprehensive analysis. We track price movements, supply chain dynamics, and regional developments across major coal markets including thermal and coking coal.',
      icon: <Newspaper className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    },
    {
      name: 'Expert Analysis',
      description: 'In-depth articles about coal markets, freight, and energy industry insights from Bench Energy experts.',
      longDescription: 'Read detailed analysis articles covering market trends, freight logistics, and strategic insights. Our experts provide actionable intelligence for commodity traders and energy market participants.',
      icon: <FileText className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    },
    {
      name: 'FreightTender',
      description: 'Closed freight tender platform for commodity and chemical traders. Structured offers, closed competition, full auditability.',
      longDescription: 'Bench Energy FreightTender is a closed tender platform designed for commodity and chemical traders. Submit structured freight offers in a competitive but private environment with full audit trail and transparency.',
      icon: <Ship className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
              Coal market intelligence{' '}
              <span className="relative whitespace-nowrap text-green-600">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 418 42"
                  className="absolute left-0 top-2/3 h-[0.58em] w-full fill-green-300/70"
                  preserveAspectRatio="none"
                >
                  <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.2 14.2 21.7 6.004 25.49l-1.977.83-2.025 1.04c-5.799 2.988-7.331 9.08-5.272 13.975l11.376 31.462 11.432 31.46c2.068 4.885 7.328 10.987 13.127 13.975l2.025 1.04 1.977.83c8.196 3.79 29.417 7.29 61.296 12.74l11.341 1.882 11.341-1.882c31.88-5.45 53.101-8.95 61.297-12.74l1.977-.83 2.025-1.04c5.799-2.988 7.331-9.08 5.272-13.975l-11.432-31.46-11.376-31.462c-2.068-4.885-7.328-10.987-13.127-13.975l-2.025-1.04-1.977-.83c-8.196-3.79-29.417-7.29-61.296-12.74L67.3 12.75 17.15 2.648C-30.864-5.35-80.152-.326-106.164 1.752l-1.921.123c-26.068 2.073-76.686 1.963-124.73-9.946z" />
                </svg>
                <span className="relative">made simple</span>
              </span>{' '}
              for traders.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Daily coal market news, expert analysis, and freight intelligence. Get actionable insights you can actually use in your trading decisions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/news"
                className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                View Latest News
              </Link>
              <Link href="/freighttender" className="text-sm font-semibold leading-6 text-gray-900">
                Learn about FreightTender <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Our Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to stay informed about coal markets
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            From daily market news to expert analysis and freight solutions, Bench Energy provides comprehensive intelligence for commodity traders.
          </p>
        </div>
        <div className="mx-auto max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <FeatureTabs tabs={featuresTabs} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Stay updated with Bench Energy
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Follow our Telegram channel for real-time coal market updates, expert insights, and freight intelligence delivered daily.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="https://t.me/benchenergy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Join @benchenergy on Telegram
            </a>
            <Link href="/news" className="text-sm font-semibold leading-6 text-gray-900">
              Explore News <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
