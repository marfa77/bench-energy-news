'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/news" className="text-sm leading-6 text-gray-600 hover:text-gray-900 no-underline">
                      News
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm leading-6 text-gray-600 hover:text-gray-900 no-underline">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/freighttender/capabilities" className="text-sm leading-6 text-gray-600 hover:text-gray-900 no-underline">
                      FreightTender Capabilities
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link href="/freighttender/privacy/" className="text-sm leading-6 text-gray-600 hover:text-gray-900 no-underline">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/freighttender/data-collection/" className="text-sm leading-6 text-gray-600 hover:text-gray-900 no-underline">
                      Data Collection
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 xl:mt-0">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Subscribe to our newsletter</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Follow our Telegram channel for real-time coal market updates.
            </p>
            <div className="mt-6">
              <a
                href="https://t.me/benchenergy"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Join @benchenergy
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-200 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Bench Energy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

