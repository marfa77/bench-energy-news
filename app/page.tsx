import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { Newspaper, FileText, Ship, TrendingUp, BarChart3, Users } from 'lucide-react';

const Tabs = dynamicImport(() => import('./components/Tabs'), { ssr: false });

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false;

export default function HomePage() {
  const featuresTabs = [
    {
      name: 'Market News',
      description: 'Daily updates on coal markets, prices, and industry analysis with expert insights from Bench Energy.',
      icon: <Newspaper className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    },
    {
      name: 'Expert Analysis',
      description: 'In-depth articles about coal markets, freight, and energy industry insights from Bench Energy experts.',
      icon: <FileText className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    },
    {
      name: 'FreightTender',
      description: 'Closed freight tender platform for commodity and chemical traders. Structured offers, closed competition, full auditability.',
      icon: <Ship className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
    }
  ];

  return (
    <>
      {/* Hero Section - Salient Style with highlighted text */}
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
              Most market intelligence platforms are accurate, but hard to use. We make the opposite trade-off, and provide actionable insights you can actually understand.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/news"
                className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Get started
              </Link>
              <Link href="/freighttender" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Tabs - Salient Style */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to track coal markets.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Well everything you need if you aren't that picky about minor details like real-time price feeds from every exchange.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <Tabs tabs={featuresTabs} />
        </div>
      </div>

      {/* Secondary Features */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Simplify market tracking</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simplify everyday trading decisions.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Because you'd probably be a little confused if we suggested you complicate your everyday trading decisions instead.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <TrendingUp className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
                Price Trends
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Stay on top of things with always up-to-date price reporting features.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <BarChart3 className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
                Market Analysis
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Never lose track of market movements with accurate trend tracking.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Users className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
                Expert Network
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Connect with industry experts and get insights from Bench Energy analysts.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section - Salient Style with Green */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Get started today
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            It's time to take control of your market intelligence. Follow our Telegram channel for real-time coal market updates and freight insights.
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
