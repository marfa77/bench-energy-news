import { MetadataRoute } from 'next';

const SITE_URL = 'https://www.bench.energy';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Traditional search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // LLM and AI crawlers (2025-2026)
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Bytespider',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: 'Diffbot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
