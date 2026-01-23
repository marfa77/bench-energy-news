'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/news', label: 'News' },
    { href: '/blog', label: 'Blog' },
    { href: '/topics', label: 'Topics' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Bench Energy Home">
            <Image
              src="/logo.png"
              alt="Bench Energy - Coal Market Intelligence Platform Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">
              Bench Energy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/freighttender"
              className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              FreightTender
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-gray-100 hover:bg-gray-200 border-none rounded-lg text-xl cursor-pointer p-2.5 text-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden flex flex-col bg-white border-t border-gray-200 py-4 animate-fadeIn">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'text-base font-medium py-3 px-6 block transition-colors rounded-lg mx-2',
                  pathname === item.href
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/freighttender"
              onClick={() => setIsMenuOpen(false)}
              className="mx-2 mt-2 px-6 py-3 bg-green-600 text-white text-base font-semibold rounded-lg text-center hover:bg-green-700"
            >
              FreightTender
            </Link>
          </nav>
        )}
      </div>
    </nav>
  );
}
