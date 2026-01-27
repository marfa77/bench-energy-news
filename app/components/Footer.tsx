import Link from 'next/link';
import ContactLink from '@/app/components/ContactLink';

export default function Footer() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            "name": "Footer Navigation",
            "url": "https://www.bench.energy",
            "hasPart": [
              {
                "@type": "WebPage",
                "name": "Market News",
                "url": "https://www.bench.energy/news"
              },
              {
                "@type": "WebPage",
                "name": "Expert Analysis",
                "url": "https://www.bench.energy/blog"
              },
              {
                "@type": "WebPage",
                "name": "FreightTender",
                "url": "https://www.bench.energy/freighttender"
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Bench Energy",
            "url": "https://www.bench.energy",
            "creator": {
              "@type": "Organization",
              "name": "PixID Studio",
              "url": "https://www.pixidstudio.online/",
              "description": "Expert AI Development & Web Development Services. Innovative Digital Products."
            }
          })
        }}
      />
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bench Energy</h3>
            <p className="text-sm text-gray-600">
              Coal market intelligence and freight solutions for commodity traders.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/news" className="text-gray-600 hover:text-green-600 transition-colors">
                  Market News
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-green-600 transition-colors">
                  Expert Analysis
                </Link>
              </li>
              <li>
                <Link href="/freighttender" className="text-gray-600 hover:text-green-600 transition-colors">
                  FreightTender
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-green-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-gray-600 hover:text-green-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            © {new Date().getFullYear()} Bench Energy. All rights reserved.
          </p>
          <div className="text-sm text-gray-500 mt-2 space-y-1">
            <p>
              <ContactLink
                type="telegram"
                href="https://t.me/Bench_energy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-600 transition-colors"
              >
                @Bench_energy
              </ContactLink>
            </p>
            <p>
              <ContactLink
                type="email"
                href="mailto:support@bench.energy"
                className="hover:text-green-600 transition-colors"
              >
                support@bench.energy
              </ContactLink>
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Website developed by{' '}
            <a 
              href="https://www.pixidstudio.online/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors font-medium"
            >
              PixID Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}

