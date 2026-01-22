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
      <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          {/* Answer Capsule for LLM Search */}
          <div style={{
            background: '#f0f7ff',
            borderLeft: '4px solid #0066cc',
            padding: '1.5rem',
            marginBottom: '2rem',
            borderRadius: '4px',
          }}>
            <p style={{
              margin: 0,
              fontSize: '1.05rem',
              lineHeight: '1.7',
              color: '#1a1a1a',
            }}>
              <strong>Bench Energy Blog</strong> provides in-depth analysis on coal markets, freight logistics, and energy industry trends. Our expert articles cover thermal coal prices, coking coal markets, dry bulk shipping rates, port operations, and commodity trading strategies. Each article includes specific data points, market analysis, and actionable insights for traders and industry professionals.
            </p>
          </div>
          
          <h1 style={{ marginBottom: '1rem' }}>Bench Energy Blog</h1>
          <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1rem', maxWidth: '800px' }} className="blog-intro">
            Expert articles about coal markets, freight logistics, and energy industry insights from Bench Energy analysts.
          </p>
          <p style={{ fontSize: '0.95rem', color: '#888', marginBottom: '3rem', maxWidth: '800px' }} className="blog-topics">
            Topics include: thermal coal prices, coking coal markets, dry bulk shipping, freight rates, port congestion, vessel availability, commodity trading strategies, and energy market analysis.
          </p>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#666' }}>No blog posts found. Posts will appear here after synchronization from Notion.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '2rem',
          }}
          className="blog-grid"
          >
            {posts.map((post) => (
              <article key={post.id} style={{
                padding: '2rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }} className="hover-card">
                <div style={{
                  width: '100%',
                  height: '200px',
                  marginBottom: '1.5rem',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {post.coverImage ? (
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 0.9rem;">📄 ' + post.title.substring(0, 30) + '...</div>';
                        }
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#999',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      padding: '1rem',
                    }}>
                      📄 {post.title.substring(0, 40)}...
                    </div>
                  )}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}>
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          background: '#e3f2fd',
                          color: '#1976d2',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 style={{ 
                  marginBottom: '0.75rem',
                  fontSize: '1.5rem',
                  lineHeight: '1.3',
                }}>
                  <Link href={`/blog/${post.slug}`} style={{
                    color: '#1a1a1a',
                    textDecoration: 'none',
                  }}>
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p style={{ 
                    color: '#666', 
                    marginBottom: '1rem',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    flexGrow: 1,
                  }}>
                    {post.excerpt.length > 150 ? `${post.excerpt.substring(0, 150)}...` : post.excerpt}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f0f0f0',
                }}>
                  <time style={{ color: '#999', fontSize: '0.875rem' }}>
                    {formatDate(post.publishedAt)}
                  </time>
                  <Link href={`/blog/${post.slug}`} style={{
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                  }}>
                    Read more →
                  </Link>
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
