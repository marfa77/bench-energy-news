'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  description?: string;
  publishedAt: string;
  sourceUrl?: string;
  sourceName?: string;
  category?: string;
  content?: any[];
}

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
  }, [slug]);

  // Add Schema.org structured data when article is loaded
  useEffect(() => {
    if (article) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.description || article.title,
        "datePublished": article.publishedAt,
        "dateModified": article.publishedAt,
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
            "url": "https://www.bench.energy/logo.png",
            "width": 1200,
            "height": 630
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.bench.energy/news/${article.slug}`
        },
        "articleSection": article.category || "Coal Market News",
        ...(article.sourceUrl && {
          "citation": {
            "@type": "WebPage",
            "url": article.sourceUrl,
            "name": article.sourceName || "Source"
          }
        })
      };

      // Remove existing schema script if any
      const existingScript = document.getElementById('article-schema');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new schema script
      const script = document.createElement('script');
      script.id = 'article-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('article-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [article]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?slug=${encodeURIComponent(articleSlug)}`, {
        cache: 'default',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch article");
      }

      setArticle(data.article);
    } catch (err: any) {
      setError(err.message || "Failed to load article");
      console.error("Error fetching article:", err);
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
        <div className="text-gray-600 italic">
          Content is being loaded...
        </div>
      );
    }

    // Filter out blocks containing "Telegram Version" only
    // Also filter out first heading if it matches article title
    // Filter out code blocks with Telegram version (HTML with hashtags)
    let isFirstHeading = true;
    
    const filteredBlocks = blocks.filter((block: any) => {
      const { type } = block;
      const value = block[type];
      
      // Filter out code blocks that contain Telegram version (HTML tags, hashtags)
      if (type === 'code' && value?.rich_text) {
        const codeText = value.rich_text
          .map((t: any) => t.plain_text || '')
          .join('');
        
        // Check if it's a Telegram version block (contains HTML tags, hashtags, or "Bench Energy Expert View" in HTML format)
        if (codeText.includes('<b>') || 
            codeText.includes('</b>') || 
            codeText.includes('<a href') ||
            codeText.includes('#') ||
            (codeText.includes('Bench Energy Expert View') && codeText.includes('•'))) {
          return false;
        }
      }
      
      // Check if block contains "Telegram Version" text
      if (value?.rich_text) {
        const text = value.rich_text
          .map((t: any) => t.plain_text || '')
          .join('')
          .toLowerCase();
        
        if (text.includes('telegram version') || text.includes('telegramversion')) {
          return false;
        }
        
        // Filter out paragraphs that start with "Source:" (to avoid duplication with the source block at the bottom)
        if (type === 'paragraph' && text.trim().startsWith('source:')) {
          return false;
        }
      }
      
      // Check for heading blocks with "Telegram Version"
      if (type.startsWith('heading_') && value?.rich_text) {
        const text = value.rich_text
          .map((t: any) => t.plain_text || '')
          .join('')
          .toLowerCase();
        
        if (text.includes('telegram version') || text.includes('telegramversion')) {
          return false;
        }
        
        // Filter out first heading if it matches article title
        if (isFirstHeading && article) {
          const headingText = value.rich_text
            .map((t: any) => t.plain_text || '')
            .join('');
          
          const articleTitle = article.title.toLowerCase().trim();
          const headingTextLower = headingText.toLowerCase().trim();
          
          // Check if heading matches article title (allowing for slight variations)
          if (headingTextLower === articleTitle || 
              headingTextLower.includes(articleTitle) || 
              articleTitle.includes(headingTextLower)) {
            isFirstHeading = false;
            return false;
          }
          
          isFirstHeading = false;
        }
      }
      
      // Mark that we've passed the first heading
      if (type.startsWith('heading_')) {
        isFirstHeading = false;
      }
      
      return true;
    });

    return filteredBlocks.map((block: any, index: number) => {
      const { type, id } = block;
      const value = block[type];

      switch (type) {
        case "paragraph":
          return (
            <p key={id} className="mb-4 leading-relaxed text-gray-700">
              {value.rich_text?.map((text: any, idx: number) => {
                const annotations = text.annotations;
                let element: any = text.plain_text;

                if (annotations?.bold) {
                  element = <strong key={idx} className="font-semibold text-gray-900">{element}</strong>;
                }
                if (annotations?.italic) {
                  element = <em key={idx} className="italic">{element}</em>;
                }
                if (annotations?.code) {
                  element = (
                    <code
                      key={idx}
                      className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm"
                    >
                      {element}
                    </code>
                  );
                }
                if (text.href) {
                  element = (
                    <a
                      key={idx}
                      href={text.href}
                      className="text-green-600 hover:text-green-700 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {element}
                    </a>
                  );
                }
                return element;
              })}
            </p>
          );

        case "heading_1":
          return (
            <h1 key={id} className="text-4xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-200">
              {value.rich_text?.map((text: any, idx: number) => (
                <span key={idx}>{text.plain_text}</span>
              ))}
            </h1>
          );

        case "heading_2":
          return (
            <h2 key={id} className="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-200">
              {value.rich_text?.map((text: any, idx: number) => (
                <span key={idx}>{text.plain_text}</span>
              ))}
            </h2>
          );

        case "heading_3":
          return (
            <h3 key={id} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              {value.rich_text?.map((text: any, idx: number) => (
                <span key={idx}>{text.plain_text}</span>
              ))}
            </h3>
          );

        case "bulleted_list_item":
        case "numbered_list_item":
          const ListTag = type === "bulleted_list_item" ? "ul" : "ol";
          return (
            <ListTag key={id} className={`list-${type === "bulleted_list_item" ? "disc" : "decimal"} pl-6 my-4`}>
              <li className="text-gray-700 mb-2 leading-relaxed">
                {value.rich_text?.map((text: any, idx: number) => (
                  <span key={idx}>{text.plain_text}</span>
                ))}
              </li>
            </ListTag>
          );

        case "quote":
          return (
            <blockquote
              key={id}
              className="border-l-4 border-green-600 bg-gray-50 pl-6 pr-4 py-4 italic my-6"
            >
              {value.rich_text?.map((text: any, idx: number) => (
                <span key={idx}>{text.plain_text}</span>
              ))}
            </blockquote>
          );

        case "code":
          return (
            <pre
              key={id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto my-4"
            >
              <code className="text-sm">{value.rich_text?.map((text: any) => text.plain_text).join("")}</code>
            </pre>
          );

        case "image":
          const imageUrl = value.type === "external" ? value.external.url : value.file.url;
          const caption = value.caption?.map((cap: any) => cap.plain_text).join("") || "";
          return (
            <figure key={id} className="my-8">
              <img
                src={imageUrl}
                alt={caption}
                className="w-full rounded-xl shadow-lg"
              />
              {caption && (
                <figcaption className="text-sm text-gray-500 mt-2 text-center">{caption}</figcaption>
              )}
            </figure>
          );

        case "divider":
          return <hr key={id} className="my-8 border-gray-300" />;

        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <div className="py-12 md:py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-12 md:py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">{error || "Article not found"}</p>
            <Link href="/news" className="text-green-600 hover:text-green-700 font-medium">
              ← Back to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link 
          href="/news" 
          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mb-8 no-underline transition-colors"
        >
          <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>
        
        <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          <time className="inline-flex items-center text-gray-500 text-sm mb-8 block">
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(article.publishedAt)}
          </time>
          
          {article.description && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {article.description}
            </p>
          )}
          
          <div className="prose prose-lg max-w-none 
            prose-headings:text-gray-900 
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-green-600 prose-a:no-underline prose-a:hover:text-green-700 prose-a:hover:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
            prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
            prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-900 prose-h3:mt-8 prose-h3:mb-3
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
            prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
            prose-blockquote:border-l-4 prose-blockquote:border-green-600 prose-blockquote:bg-gray-50 prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:my-6
            prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
            prose-hr:my-8 prose-hr:border-gray-300">
            {article.content ? renderNotionContent(article.content) : (
              <p className="text-gray-600">Content is being loaded...</p>
            )}
          </div>
          
          {article.sourceUrl && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Source:</strong>{' '}
                <a 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  {article.sourceName || article.sourceUrl}
                </a>
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
