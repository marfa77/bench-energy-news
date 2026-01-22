'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t border-gray-700 py-16 mt-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Bench Energy"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold text-white">Bench Energy</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
              Real-time coal market intelligence and freight tender solutions for commodity traders worldwide.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://t.me/benchenergy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 text-base">
              Product
            </h4>
            <ul className="list-none p-0 m-0 space-y-3">
              <li>
                <Link href="/news" className="text-gray-400 no-underline text-sm hover:text-white transition-colors inline-block">
                  News
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 no-underline text-sm hover:text-white transition-colors inline-block">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/freighttender/capabilities" className="text-gray-400 no-underline text-sm hover:text-white transition-colors inline-block">
                  FreightTender Capabilities
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 text-base">
              Legal
            </h4>
            <ul className="list-none p-0 m-0 space-y-3">
              <li>
                <Link href="/freighttender/privacy/" className="text-gray-400 no-underline text-sm hover:text-white transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/freighttender/data-collection/" className="text-gray-400 no-underline text-sm hover:text-white transition-colors inline-block">
                  Data Collection
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm m-0">
            © {new Date().getFullYear()} Bench Energy. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="mailto:support@bench.energy" className="text-gray-400 hover:text-white transition-colors no-underline">
              support@bench.energy
            </a>
            <a href="https://t.me/freightTender_sales" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors no-underline">
              @freightTender_sales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

