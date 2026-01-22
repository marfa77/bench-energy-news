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
      <div className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Answer Capsule for LLM Search */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 md:p-8 mb-12 rounded-xl shadow-sm">
            <p className="text-base md:text-lg leading-relaxed text-gray-900 m-0">
              <strong className="font-bold text-blue-900">Bench Energy Blog</strong> provides in-depth analysis on coal markets, freight logistics, and energy industry trends. Our expert articles cover thermal coal prices, coking coal markets, dry bulk shipping rates, port operations, and commodity trading strategies. Each article includes specific data points, market analysis, and actionable insights for traders and industry professionals.
            </p>
          </div>
          
          <div className="mb-16 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                key={post.id} 
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex items-center justify-center h-full text-gray-400 text-sm p-4 bg-gradient-to-br from-purple-100 to-pink-100">📄 ${post.title.substring(0, 30)}...</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4 text-center bg-gradient-to-br from-purple-100 to-pink-100">
                      <span className="text-4xl">✍️</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-full font-semibold border border-purple-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-purple-600 transition-colors">
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
                      {formatDate(post.publishedAt)}
                    </time>
                    <Link 
                      href={`/blog/${post.slug}`} 
                      className="text-purple-600 font-semibold text-sm hover:text-purple-700 no-underline inline-flex items-center group/link"
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
