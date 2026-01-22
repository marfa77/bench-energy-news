import Link from 'next/link';

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false;

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-600 text-white py-24 md:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bench Energy
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed">
              Coal market intelligence and freight tender solutions for commodity traders
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Card */}
            <div className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">📰</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Coal Market News
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Daily updates on coal markets, prices, and industry analysis with expert insights from Bench Energy.
              </p>
              <Link 
                href="/news" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                View News
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Blog Card */}
            <div className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">✍️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Blog
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                In-depth articles about coal markets, freight, and energy industry insights from Bench Energy experts.
              </p>
              <Link 
                href="/blog" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Read Blog
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* FreightTender Card */}
            <div className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">🚢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                FreightTender
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Closed freight tender platform for commodity and chemical traders. Structured offers, closed competition, full auditability.
              </p>
              <Link 
                href="/freighttender" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Learn More
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">About Bench Energy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Market Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide daily analysis of coal markets, price trends, and industry developments with expert commentary.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Freight Solutions</h3>
              <p className="text-gray-600 leading-relaxed">
                FreightTender platform enables structured, transparent, and auditable freight procurement for commodity traders.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team provides actionable market analysis and freight procurement strategies for trading companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8">
              Follow our Telegram channel for real-time coal market updates and freight insights.
            </p>
            <a 
              href="https://t.me/benchenergy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#0088cc] text-white font-medium rounded-lg hover:bg-[#006ba3] transition-colors text-lg"
            >
              <span className="mr-2">📱</span>
              Join @benchenergy on Telegram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
