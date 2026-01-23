import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coal Market News - Latest Updates & Analysis | Bench Energy',
  description: 'Latest coal market news, price updates, and industry analysis. Daily updates on thermal coal, coking coal, supply chain dynamics, and regional developments with expert insights from Bench Energy.',
  keywords: ['coal market news', 'coal prices', 'thermal coal', 'coking coal', 'coal industry', 'energy news', 'market analysis', 'Bench Energy'],
  openGraph: {
    title: 'Coal Market News - Latest Updates & Analysis | Bench Energy',
    description: 'Latest coal market news, price updates, and industry analysis with expert insights.',
    type: 'website',
    url: 'https://www.bench.energy/news',
    images: [
      {
        url: 'https://www.bench.energy/logo.png',
        width: 1200,
        height: 630,
        alt: 'Bench Energy - Coal Market News',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.bench.energy/news',
  },
};

interface Article {
  id: string;
  slug: string;
  title: string;
  description?: string;
  publishedAt: string;
  sourceUrl?: string;
  sourceName?: string;
  category?: string;
}

const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

async function getAllArticles(databaseId: string): Promise<any[]> {
  const articles: any[] = [];
  let cursor: string | undefined = undefined;
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error('NOTION_API_KEY is not configured');
    return [];
  }

  try {
    do {
      const response: Response = await fetch(`${NOTION_API_URL}/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
          sorts: [
            {
              property: "Published Date",
              direction: "descending",
            },
          ],
          start_cursor: cursor,
        }),
        next: { revalidate: 900 }, // 15 minutes cache
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Notion API error:', response.status, errorText);
        break;
      }

      const data: any = await response.json();
      articles.push(...data.results);
      cursor = data.next_cursor || undefined;
    } while (cursor);
  } catch (error) {
    console.error('Error fetching articles from Notion:', error);
  }

  return articles;
}

function getTitleFromArticle(article: any): string {
  const properties = article.properties || {};
  
  // Try different property names and types
  // Notion database title property is usually "Name" with type "title"
  if (properties.Name && properties.Name.type === 'title' && properties.Name.title) {
    const titleParts = properties.Name.title.map((t: any) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  // Try "Title" as rich_text
  if (properties.Title && properties.Title.type === 'rich_text' && properties.Title.rich_text) {
    const titleParts = properties.Title.rich_text.map((t: any) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  // Try "title" (lowercase)
  if (properties.title && properties.title.type === 'title' && properties.title.title) {
    const titleParts = properties.title.title.map((t: any) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  // Try "name" (lowercase)
  if (properties.name && properties.name.type === 'title' && properties.name.title) {
    const titleParts = properties.name.title.map((t: any) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  return "Untitled";
}

function getSlugFromArticle(article: any): string {
  const title = getTitleFromArticle(article);
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .trim()
    .substring(0, 80);
}

function parseNotionArticle(article: any): Article {
  const properties = article.properties || {};
  const title = getTitleFromArticle(article);
  const slug = getSlugFromArticle(article);
  
  // Extract description
  const descriptionProperty = properties.Description || properties.description || properties.Summary || properties.summary;
  const description = descriptionProperty?.rich_text?.[0]?.plain_text || 
                     descriptionProperty?.title?.[0]?.plain_text || 
                     undefined;
  
  // Extract published date
  const dateProperty = properties["Published Date"] || properties["PublishedDate"] || properties.Date || properties.date;
  let publishedAt = new Date().toISOString();
  
  if (dateProperty?.date?.start) {
    publishedAt = dateProperty.date.start;
  } else if (article.created_time) {
    publishedAt = article.created_time;
  }
  
  // Extract source URL
  const sourceProperty = properties["Source URL"] || properties["SourceURL"] || properties.URL || properties.url;
  const sourceUrl = sourceProperty?.url || sourceProperty?.rich_text?.[0]?.plain_text || undefined;
  
  // Extract source name
  const sourceNameProperty = properties["Source Name"] || properties["SourceName"] || properties.Source || properties.source;
  const sourceName = sourceNameProperty?.rich_text?.[0]?.plain_text || 
                    sourceNameProperty?.title?.[0]?.plain_text || 
                    undefined;
  
  // Extract category
  const categoryProperty = properties.Category || properties.category;
  const category = categoryProperty?.select?.name || 
                  categoryProperty?.rich_text?.[0]?.plain_text || 
                  undefined;

  return {
    id: article.id,
    title,
    slug,
    description,
    publishedAt,
    sourceUrl,
    sourceName,
    category,
  };
}

async function getArticles(): Promise<Article[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const apiKey = process.env.NOTION_API_KEY;
  
  if (!apiKey || !databaseId) {
    const missingVars = [];
    if (!apiKey) missingVars.push('NOTION_API_KEY');
    if (!databaseId) missingVars.push('NOTION_DATABASE_ID');
    
    console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.error('📖 See VERCEL_ENV_SETUP.md for setup instructions');
    
    // In production, log to help with debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('Environment variables check:', {
        hasApiKey: !!apiKey,
        hasDatabaseId: !!databaseId,
      });
    }
    
    return [];
  }

  try {
    const allArticles = await getAllArticles(databaseId);
    
    if (allArticles.length === 0) {
      console.warn('⚠️ No articles found in Notion database. Check that:');
      console.warn('  1. Articles have "Published" checkbox = true');
      console.warn('  2. Notion integration has access to the database');
      console.warn('  3. Database ID is correct');
      return [];
    }
    
    const articles = allArticles.map((article: any) => parseNotionArticle(article));
    
    // Sort by published date (newest first)
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    console.log(`✅ Loaded ${articles.length} articles from Notion`);
    return articles;
  } catch (error) {
    console.error('❌ Error fetching articles from Notion:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('🔑 Authentication error: Check NOTION_API_KEY');
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.error('🔍 Database not found: Check NOTION_DATABASE_ID');
      } else {
        console.error('💡 Error details:', error.message);
      }
    }
    
    return [];
  }
}

export default async function NewsPage() {
  const articles = await getArticles();
  
  return (
    <>
      {/* Schema.org CollectionPage and ItemList for LLM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Coal Market News",
            "description": "Latest coal market news, price updates, and industry analysis with expert insights from Bench Energy",
            "url": "https://www.bench.energy/news",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": articles.length,
              "itemListElement": articles.slice(0, 20).map((article, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "NewsArticle",
                  "@id": `https://www.bench.energy/news/${article.slug}`,
                  "headline": article.title,
                  "description": article.description || article.title,
                  "datePublished": article.publishedAt,
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
          })
        }}
      />
      <div className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Coal Market News
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Latest news and analysis about coal markets, prices, and industry developments with expert insights from Bench Energy.
          </p>
        </div>
        
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📰</span>
            </div>
            <p className="text-gray-600 text-lg">No articles found. Articles will appear here after synchronization from Notion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article, index) => (
              <article 
                key={article.id} 
                className="group relative bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-bl-full transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative flex-grow flex flex-col">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-3 group-hover:text-green-600 transition-colors leading-tight">
                    <Link href={`/news/${article.slug}`} className="no-underline">
                      {article.title}
                    </Link>
                  </h2>
                  {article.description && (
                    <p className="text-gray-600 mb-4 flex-grow line-clamp-3 leading-relaxed text-sm">
                      {article.description.length > 120 ? `${article.description.substring(0, 120)}...` : article.description}
                    </p>
                  )}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-auto">
                    <time className="text-xs text-gray-500 font-medium">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    <Link 
                      href={`/news/${article.slug}`} 
                      className="text-green-600 font-semibold text-xs hover:text-green-700 no-underline inline-flex items-center group/link"
                    >
                      Read more
                      <svg className="ml-1 w-3 h-3 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
