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
        cache: 'default',
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
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Bench Energy Blog</h1>
        <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '3rem', maxWidth: '800px' }}>
          Articles about coal markets, freight, and energy industry insights from Bench Energy experts.
        </p>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#666' }}>No blog posts found. Posts will appear here after synchronization from Notion.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '2rem',
          }}>
            {posts.map((post) => (
              <article key={post.id} style={{
                padding: '2rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }} className="hover-card">
                <h2 style={{ marginBottom: '0.75rem' }}>
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
                  }}>
                    {post.excerpt.length > 200 ? `${post.excerpt.substring(0, 200)}...` : post.excerpt}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
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
  );
}
