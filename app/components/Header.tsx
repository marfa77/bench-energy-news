'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3 text-gray-900 no-underline group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Bench Energy"
                width={48}
                height={48}
                className="object-contain block transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Bench Energy
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1 items-center">
            <Link 
              href="/" 
              className="px-4 py-2 text-gray-700 no-underline text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
            >
              Home
            </Link>
            <Link 
              href="/news" 
              className="px-4 py-2 text-gray-700 no-underline text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
            >
              News
            </Link>
            <Link 
              href="/blog" 
              className="px-4 py-2 text-gray-700 no-underline text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
            >
              Blog
            </Link>
            <Link 
              href="/topics" 
              className="px-4 py-2 text-gray-700 no-underline text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
            >
              Topics
            </Link>
            <Link 
              href="/freighttender/" 
              className="ml-2 px-5 py-2 bg-green-600 text-white no-underline text-sm font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              FreightTender
            </Link>
          </nav>

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
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-700 no-underline text-base font-medium py-3 px-6 block hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg mx-2"
            >
              Home
            </Link>
            <Link 
              href="/news" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-700 no-underline text-base font-medium py-3 px-6 block hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg mx-2"
            >
              News
            </Link>
            <Link 
              href="/blog" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-700 no-underline text-base font-medium py-3 px-6 block hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg mx-2"
            >
              Blog
            </Link>
            <Link 
              href="/topics" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-700 no-underline text-base font-medium py-3 px-6 block hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg mx-2"
            >
              Topics
            </Link>
            <Link 
              href="/freighttender/" 
              onClick={() => setIsMenuOpen(false)} 
              className="mx-2 mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white no-underline text-base font-semibold rounded-lg text-center"
            >
              FreightTender
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
