'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3 text-gray-900 no-underline">
            <img
              src="/logo.png"
              alt="Bench Energy"
              width={50}
              height={50}
              className="object-contain block"
            />
            <span className="text-xl font-semibold text-gray-900">
              Bench Energy
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-gray-600 no-underline text-[0.95rem] font-medium hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/news" className="text-gray-600 no-underline text-[0.95rem] font-medium hover:text-primary-600 transition-colors">
              News
            </Link>
            <Link href="/blog" className="text-gray-600 no-underline text-[0.95rem] font-medium hover:text-primary-600 transition-colors">
              Blog
            </Link>
            <Link href="/topics" className="text-gray-600 no-underline text-[0.95rem] font-medium hover:text-primary-600 transition-colors">
              Topics
            </Link>
            <Link href="/freighttender/" className="text-gray-600 no-underline text-[0.95rem] font-medium hover:text-primary-600 transition-colors">
              FreightTender
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-transparent border-none text-2xl cursor-pointer p-2 text-gray-900"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden flex flex-col bg-white border-t border-gray-200 py-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-gray-600 no-underline text-base font-medium py-3 px-8 block hover:bg-gray-50 transition-colors">
              Home
            </Link>
            <Link href="/news" onClick={() => setIsMenuOpen(false)} className="text-gray-600 no-underline text-base font-medium py-3 px-8 block hover:bg-gray-50 transition-colors">
              News
            </Link>
            <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="text-gray-600 no-underline text-base font-medium py-3 px-8 block hover:bg-gray-50 transition-colors">
              Blog
            </Link>
            <Link href="/topics" onClick={() => setIsMenuOpen(false)} className="text-gray-600 no-underline text-base font-medium py-3 px-8 block hover:bg-gray-50 transition-colors">
              Topics
            </Link>
            <Link href="/freighttender/" onClick={() => setIsMenuOpen(false)} className="text-gray-600 no-underline text-base font-medium py-3 px-8 block hover:bg-gray-50 transition-colors">
              FreightTender
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
