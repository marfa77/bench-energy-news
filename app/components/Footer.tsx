'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-base font-semibold mb-4 text-gray-900">
              Product
            </h4>
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <Link href="/news" className="text-gray-600 no-underline text-sm hover:text-primary-600 transition-colors">
                  News
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/freighttender/capabilities" className="text-gray-600 no-underline text-sm hover:text-primary-600 transition-colors">
                  FreightTender Capabilities
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-4 text-gray-900">
              Legal
            </h4>
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <Link href="/freighttender/privacy/" className="text-gray-600 no-underline text-sm hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/freighttender/data-collection/" className="text-gray-600 no-underline text-sm hover:text-primary-600 transition-colors">
                  Data Collection
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-4 text-gray-900">
              Contact
            </h4>
            <ul className="list-none p-0 m-0">
              <li className="mb-2">
                <a href="mailto:support@bench.energy" className="text-gray-600 no-underline text-sm hover:text-primary-600 transition-colors">
                  support@bench.energy
                </a>
              </li>
              <li className="mb-2">
                <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer" className="text-gray-600 no-underline text-sm hover:text-primary-600 transition-colors">
                  Telegram: @freightTender_sales
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
          <p className="m-0">
            © {new Date().getFullYear()} FreightTender by Bench Energy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

