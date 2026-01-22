"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt: string;
  author?: string;
  tags?: string[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/blog", {
        cache: 'force-cache',
        next: { revalidate: 900 }, // Revalidate every 15 minutes
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch posts");
      }

      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || "Failed to load blog posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#666' }}>Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ 
            background: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '8px', 
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#c33', marginBottom: '1rem' }}>{error}</p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Please check that NOTION_API_KEY and NOTION_BLOG_PAGE_ID are configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Schema.org Blog Collection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Bench Energy Blog",
            "description": "Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts.",
            "url": "https://www.bench.energy/blog",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": posts.map((post, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "BlogPosting",
                  "@id": `https://www.bench.energy/blog/${post.slug}`,
                  "headline": post.title,
                  "description": post.excerpt || post.title,
                  "datePublished": post.publishedAt,
                  "author": {
                    "@type": "Organization",
                    "name": "Bench Energy",
                    "url": "https://www.bench.energy"
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
          })
        }}
      />
      <div className="py-12 md:py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Answer Capsule for LLM Search */}
          <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8 rounded-lg">
            <p className="text-base md:text-lg leading-relaxed text-gray-900 m-0">
              <strong className="font-semibold">Bench Energy Blog</strong> provides in-depth analysis on coal markets, freight logistics, and energy industry trends. Our expert articles cover thermal coal prices, coking coal markets, dry bulk shipping rates, port operations, and commodity trading strategies. Each article includes specific data points, market analysis, and actionable insights for traders and industry professionals.
            </p>
          </div>
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Bench Energy Blog</h1>
            <p className="text-lg text-gray-600 mb-2 max-w-3xl">
              Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts.
            </p>
            <p className="text-sm text-gray-500 max-w-3xl">
              Topics include: thermal coal prices, coking coal markets, dry bulk shipping, freight rates, port congestion, vessel availability, commodity trading strategies, and energy market analysis.
            </p>
          </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No blog posts found. Posts will appear here after synchronization from Notion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex items-center justify-center h-full text-gray-400 text-sm p-4">📄 ${post.title.substring(0, 30)}...</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
                      📄 {post.title.substring(0, 40)}...
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    <Link href={`/blog/${post.slug}`} className="no-underline">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 flex-grow line-clamp-3 text-sm md:text-base">
                      {post.excerpt.length > 150 ? `${post.excerpt.substring(0, 150)}...` : post.excerpt}
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                    <time className="text-xs text-gray-500">
                      {formatDate(post.publishedAt)}
                    </time>
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className="text-primary-600 font-medium text-sm hover:text-primary-700 no-underline inline-flex items-center"
                    >
                      Read more
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
