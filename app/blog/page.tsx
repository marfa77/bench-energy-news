import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';
import { Metadata } from 'next';
import BlogImage from '../components/BlogImage';

export const metadata: Metadata = {
  title: 'Bench Energy Blog - Expert Analysis on Coal Markets & Freight',
  description: 'Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts. In-depth analysis on thermal coal, coking coal, freight rates, and commodity trading strategies.',
  keywords: [
    'coal market analysis',
    'freight logistics',
    'energy industry',
    'thermal coal',
    'coking coal',
    'commodity trading',
    'freight rates',
    'market insights',
    'Bench Energy blog',
    'dry bulk shipping',
    'port operations',
    'vessel availability',
    'coal prices',
    'energy market trends',
  ],
  authors: [{ name: 'Bench Energy' }],
  openGraph: {
    title: 'Bench Energy Blog - Expert Analysis on Coal Markets & Freight',
    description: 'Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts. In-depth analysis with specific data points and actionable intelligence.',
    type: 'website',
    url: 'https://www.bench.energy/blog',
    siteName: 'Bench Energy',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.bench.energy/logo.png',
        width: 1200,
        height: 630,
        alt: 'Bench Energy Blog - Expert Analysis on Coal Markets & Freight',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bench Energy Blog - Expert Analysis on Coal Markets & Freight',
    description: 'Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts.',
    images: ['https://www.bench.energy/logo.png'],
    site: '@Bench_energy',
    creator: '@Bench_energy',
  },
  alternates: {
    canonical: 'https://www.bench.energy/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface BlogPost {
  slug: string;
  title: string;
  publishedDate: string;
  excerpt?: string;
  imageUrl?: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDir = join(process.cwd(), 'blog');
  const files = await readdir(blogDir);
  
  const posts: BlogPost[] = [];
  
  for (const file of files) {
    if (file === 'index.html' || !file.endsWith('.html')) {
      continue;
    }
    
    try {
      const filePath = join(blogDir, file);
      const content = await readFile(filePath, 'utf-8');
      
      // Извлекаем title из <title> или <h1>
      const titleMatch = content.match(/<title>(.*?)<\/title>/i) || 
                        content.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Bench Energy Blog\s*/i, '').trim() : file.replace('.html', '');
      
      // Извлекаем дату из meta или content
      const dateMatch = content.match(/Published:\s*([^<|]+)/i) ||
                       content.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
      const publishedDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
      
      // Извлекаем excerpt из первого параграфа
      const excerptMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
      const excerpt = excerptMatch ? excerptMatch[1].replace(/<[^>]+>/g, '').substring(0, 200) : undefined;
      
      // Извлекаем первое изображение из контента
      // Ищем img тег с src атрибутом, обрабатывая как одинарные, так и двойные кавычки
      // Улучшенное регулярное выражение для обработки длинных URL с query параметрами
      let imageUrl: string | undefined = undefined;
      
      // Сначала пробуем найти с двойными кавычками
      const doubleQuoteMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
      if (doubleQuoteMatch) {
        imageUrl = doubleQuoteMatch[1];
      } else {
        // Пробуем с одинарными кавычками
        const singleQuoteMatch = content.match(/<img[^>]*src='([^']+)'[^>]*>/i);
        if (singleQuoteMatch) {
          imageUrl = singleQuoteMatch[1];
        } else {
          // Пробуем без кавычек (нестандартный формат)
          const noQuoteMatch = content.match(/<img[^>]*src=([^\s>]+)[^>]*>/i);
          if (noQuoteMatch) {
            imageUrl = noQuoteMatch[1];
          }
        }
      }
      
      // Декодируем HTML entities если есть
      if (imageUrl) {
        imageUrl = imageUrl
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
      }
      
      const slug = file.replace('.html', '');
      
      posts.push({
        slug,
        title,
        publishedDate,
        excerpt,
        imageUrl,
      });
    } catch (error) {
      console.error(`Error reading blog file ${file}:`, error);
    }
  }
  
  // Сортируем по дате (новые сначала)
  posts.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  
  return posts;
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  
  // Schema.org data for blog collection
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Bench Energy Blog",
    "description": "Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts",
    "url": "https://www.bench.energy/blog",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": posts.length,
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "@id": `https://www.bench.energy/blog/${post.slug}`,
          "headline": post.title,
          "description": post.excerpt || post.title,
          "datePublished": post.publishedDate,
          "author": {
            "@type": "Organization",
            "name": "Bench Energy"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Bench Energy",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.bench.energy/logo.png"
            }
          }
        }
      }))
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Schema.org Blog Collection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema)
        }}
      />
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.bench.energy"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.bench.energy/blog"
              }
            ]
          })
        }}
      />
      <div className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Answer Capsule for LLM Search */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 md:p-8 mb-12 rounded-xl shadow-sm">
            <p className="text-base md:text-lg leading-relaxed text-gray-900 m-0">
              <strong className="font-bold text-blue-900">Bench Energy Blog</strong> provides in-depth analysis on coal markets, freight logistics, and energy industry trends. Our expert articles cover thermal coal prices, coking coal markets, dry bulk shipping rates, port operations, and commodity trading strategies. Each article includes specific data points, market analysis, and actionable insights for traders and industry professionals.
            </p>
          </div>
          
          <div className="mb-16 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Bench Energy Blog
            </h1>
            <p className="text-xl text-gray-600 mb-3 max-w-3xl mx-auto leading-relaxed">
              Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts.
            </p>
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              Topics include: thermal coal prices, coking coal markets, dry bulk shipping, freight rates, port congestion, vessel availability, commodity trading strategies, and energy market analysis.
            </p>
          </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✍️</span>
            </div>
            <p className="text-gray-600 text-lg">No blog posts found. Posts will appear here after synchronization from Notion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {posts.map((post, index) => (
              <article 
                key={post.slug} 
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                  {post.imageUrl ? (
                    <BlogImage 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4 text-center bg-gradient-to-br from-green-100 to-emerald-100">
                      <span className="text-4xl">✍️</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-green-600 transition-colors">
                    <Link href={`/blog/${post.slug}`} className="no-underline">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-6 flex-grow line-clamp-3 text-base leading-relaxed">
                      {post.excerpt.length > 150 ? `${post.excerpt.substring(0, 150)}...` : post.excerpt}
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-auto">
                    <time className="text-sm text-gray-500 font-medium">
                      {formatDate(post.publishedDate)}
                    </time>
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className="text-green-600 font-semibold text-sm hover:text-green-700 no-underline inline-flex items-center group/link"
                    >
                      Read more
                      <svg className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
