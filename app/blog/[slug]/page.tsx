"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  content?: any[];
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog?slug=${encodeURIComponent(postSlug)}`, {
        cache: 'default',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch post");
      }

      setPost(data.post);
    } catch (err: any) {
      setError(err.message || "Failed to load blog post");
      console.error("Error fetching post:", err);
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

  const renderNotionContent = (blocks: any[]) => {
    if (!blocks || blocks.length === 0) {
      return (
        <div style={{ color: '#666', fontStyle: 'italic' }}>
          Content is being loaded...
        </div>
      );
    }

    return blocks.map((block: any, index: number) => {
      const { type, id } = block;
      const value = block[type];

      switch (type) {
        case "paragraph":
          return (
            <p key={id} style={{ marginBottom: '1rem', lineHeight: '1.8', color: '#333' }}>
              {value.rich_text?.map((text: any, idx: number) => {
                const annotations = text.annotations;
                let element: any = text.plain_text;

                if (annotations?.bold) {
                  element = <strong key={idx}>{element}</strong>;
                }
                if (annotations?.italic) {
                  element = <em key={idx}>{element}</em>;
                }
                if (annotations?.code) {
                  element = (
                    <code
                      key={idx}
                      style={{
                        background: '#f0f0f0',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'monospace',
                      }}
                    >
                      {element}
                    </code>
                  );
                }
                if (annotations?.underline) {
                  element = <u key={idx}>{element}</u>;
                }
                if (annotations?.strikethrough) {
                  element = <s key={idx}>{element}</s>;
                }

                return element;
              })}
            </p>
          );

        case "heading_1":
          return (
            <h1 key={id} style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>
              {value.rich_text?.map((text: any) => text.plain_text).join("")}
            </h1>
          );

        case "heading_2":
          return (
            <h2 key={id} style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#1a1a1a' }}>
              {value.rich_text?.map((text: any) => text.plain_text).join("")}
            </h2>
          );

        case "heading_3":
          return (
            <h3 key={id} style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>
              {value.rich_text?.map((text: any) => text.plain_text).join("")}
            </h3>
          );

        case "bulleted_list_item":
        case "numbered_list_item":
          return (
            <li key={id} style={{ marginBottom: '0.5rem', marginLeft: '1.5rem', color: '#333' }}>
              {value.rich_text?.map((text: any) => text.plain_text).join("")}
            </li>
          );

        case "to_do":
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'start', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={value.checked}
                readOnly
                style={{ marginRight: '0.5rem', marginTop: '0.25rem' }}
              />
              <span style={{ color: '#333' }}>
                {value.rich_text?.map((text: any) => text.plain_text).join("")}
              </span>
            </div>
          );

        case "code":
          return (
            <pre
              key={id}
              style={{
                background: '#f5f5f5',
                borderRadius: '8px',
                padding: '1rem',
                overflowX: 'auto',
                marginBottom: '1rem',
              }}
            >
              <code style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: '#333' }}>
                {value.rich_text?.map((text: any) => text.plain_text).join("")}
              </code>
            </pre>
          );

        case "quote":
          return (
            <blockquote
              key={id}
              style={{
                borderLeft: '4px solid #0066cc',
                paddingLeft: '1rem',
                fontStyle: 'italic',
                color: '#666',
                margin: '1rem 0',
              }}
            >
              {value.rich_text?.map((text: any) => text.plain_text).join("")}
            </blockquote>
          );

        case "divider":
          return <hr key={id} style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />;

        case "image":
          let imageUrl = value.external?.url || value.file?.url || "";
          const imageCaption = value.caption?.map((t: any) => t.plain_text).join("") || "";
          if (!imageUrl) return null;
          
          return (
            <div key={id} style={{ margin: '1.5rem 0' }}>
              <img
                src={imageUrl}
                alt={imageCaption || "Blog image"}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  maxWidth: '100%',
                }}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {imageCaption && (
                <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '0.5rem' }}>
                  {imageCaption}
                </p>
              )}
            </div>
          );

        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#666' }}>Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ 
            background: '#fee', 
            border: '1px solid #fcc', 
            borderRadius: '8px', 
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#c33', marginBottom: '1rem' }}>
              {error || "Post not found"}
            </p>
            <Link
              href="/blog"
              style={{
                color: '#0066cc',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link
          href="/blog"
          style={{
            color: '#0066cc',
            textDecoration: 'none',
            fontSize: '0.95rem',
            marginBottom: '2rem',
            display: 'inline-block',
          }}
        >
          ← Back to Blog
        </Link>

        <article>
          <h1 style={{ marginBottom: '1rem' }}>{post.title}</h1>
          <time style={{ 
            color: '#666', 
            fontSize: '0.95rem',
            display: 'block',
            marginBottom: '2rem',
          }}>
            {formatDate(post.publishedAt)}
          </time>

          {post.excerpt && (
            <div style={{
              background: '#f0f7ff',
              borderLeft: '4px solid #0066cc',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '2rem',
            }}>
              <p style={{ color: '#333', fontStyle: 'italic', margin: 0 }}>{post.excerpt}</p>
            </div>
          )}

          <div style={{ lineHeight: '1.8' }}>
            {post.content ? (
              renderNotionContent(post.content)
            ) : (
              <div style={{ color: '#666' }}>
                Content is being loaded. If this message persists, the post content
                may not be available.
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
