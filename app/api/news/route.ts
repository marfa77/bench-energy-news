import { NextRequest, NextResponse } from "next/server";
import type { NotionPage, NotionBlock, NotionDatabaseQueryResponse, NotionBlocksListResponse, NotionProperty, NotionDateProperty, NotionURLProperty, NotionRichTextProperty, NotionTitleProperty, NotionSelectProperty } from "@/app/lib/notion-types";

// Cache for news articles (in-memory cache)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const newsCache = new Map<string, CacheEntry<NewsArticle | NewsArticle[]>>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cache entries

const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json(
        { error: "NOTION_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!databaseId) {
      return NextResponse.json(
        { error: "NOTION_DATABASE_ID is not configured" },
        { status: 500 }
      );
    }

    // If slug is provided, fetch single article
    if (slug) {
      const cacheKey = `article-${slug}`;
      const cached = newsCache.get(cacheKey);
      
      // Check cache
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(
          { article: cached.data },
          {
            headers: {
              "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
            },
          }
        );
      }

      // Get all articles and find by slug
      const allArticles = await getAllArticles(databaseId);
      const article = allArticles.find((a) => {
        const articleSlug = getSlugFromArticle(a);
        return articleSlug === slug;
      });

      if (!article) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }

      // Get all blocks for the full article
      const allBlocks: unknown[] = [];
      let cursor: string | undefined = undefined;
      const apiKey = process.env.NOTION_API_KEY;
      
      do {
        const response: Response = await fetch(`${NOTION_API_URL}/blocks/${article.id}/children${cursor ? `?start_cursor=${cursor}` : ''}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': NOTION_VERSION,
          },
        });

        if (!response.ok) {
          break;
        }

        const data: NotionBlocksListResponse = await response.json();
        allBlocks.push(...data.results);
        cursor = data.next_cursor || undefined;
      } while (cursor);

      const fullArticle = parseNotionArticle(article, allBlocks);
      
      // Cache the result with size limit
      ensureCacheSizeLimit();
      newsCache.set(cacheKey, { data: fullArticle, timestamp: Date.now() });
      
      return NextResponse.json(
        { article: fullArticle },
        {
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          },
        }
      );
    }

    // Otherwise, fetch all articles
    const cacheKey = "articles-list";
    const cached = newsCache.get(cacheKey);
    
    // Check cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(
        { articles: cached.data },
        {
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          },
        }
      );
    }

    const allArticles = await getAllArticles(databaseId);
    const articles = allArticles.map((article) => parseNotionArticle(article));
    
    // Sort by published date (newest first)
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    // Cache the result with size limit
    ensureCacheSizeLimit();
    newsCache.set(cacheKey, { data: articles, timestamp: Date.now() });
    
    return NextResponse.json(
      { articles },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching news articles:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch news articles";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Ensures cache doesn't exceed MAX_CACHE_SIZE by removing oldest entries
 */
function ensureCacheSizeLimit(): void {
  if (newsCache.size >= MAX_CACHE_SIZE) {
    // Find oldest entry by timestamp
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, entry] of newsCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      newsCache.delete(oldestKey);
    }
  }
}

async function getAllArticles(databaseId: string): Promise<NotionPage[]> {
  const articles: NotionPage[] = [];
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Notion API error: ${response.status} ${response.statusText}`);
        console.error('   Response:', errorText.substring(0, 500));
        
        if (response.status === 401) {
          console.error('   🔑 Authentication failed: Check NOTION_API_KEY and ensure integration is connected to database');
        } else if (response.status === 404) {
          console.error('   🔍 Database not found: Check NOTION_DATABASE_ID format');
        }
        break;
      }

      const data: NotionDatabaseQueryResponse = await response.json();
      articles.push(...data.results);
      cursor = data.next_cursor || undefined;
    } while (cursor);

    return articles;
  } catch (error) {
    console.error('Error fetching articles from Notion:', error);
    return [];
  }
}

function getSlugFromArticle(article: NotionPage): string {
  const title = getTitleFromArticle(article);
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .trim()
    .substring(0, 80);
}

function getTitleFromArticle(article: NotionPage): string {
  const properties = article.properties || {};
  
  // Try different property names and types
  // Notion database title property is usually "Name" with type "title"
  const nameProp = properties.Name;
  if (nameProp && nameProp.type === 'title' && nameProp.title) {
    const titleParts = nameProp.title.map((t) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  // Try "Title" as rich_text
  const titleProp = properties.Title;
  if (titleProp && titleProp.type === 'rich_text' && titleProp.rich_text) {
    const titleParts = titleProp.rich_text.map((t) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  // Try "title" (lowercase)
  const titleLowerProp = properties.title;
  if (titleLowerProp && titleLowerProp.type === 'title' && titleLowerProp.title) {
    const titleParts = titleLowerProp.title.map((t) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  // Try "name" (lowercase)
  const nameLowerProp = properties.name;
  if (nameLowerProp && nameLowerProp.type === 'title' && nameLowerProp.title) {
    const titleParts = nameLowerProp.title.map((t) => t.plain_text || t.text?.content || '').filter(Boolean);
    if (titleParts.length > 0) {
      return titleParts.join('');
    }
  }
  
  return "Untitled";
}

function parseNotionArticle(article: NotionPage, blocks?: unknown[]): NewsArticle {
  const properties = article.properties || {};
  const title = getTitleFromArticle(article);
  const slug = getSlugFromArticle(article);
  
  // Extract description with type safety
  const descriptionProperty = (properties.Description || properties.description || properties.Summary || properties.summary) as NotionProperty | undefined;
  let description: string | undefined = undefined;
  if (descriptionProperty) {
    if (descriptionProperty.type === 'rich_text' && descriptionProperty.rich_text?.[0]) {
      description = descriptionProperty.rich_text[0].plain_text;
    } else if (descriptionProperty.type === 'title' && descriptionProperty.title?.[0]) {
      description = descriptionProperty.title[0].plain_text;
    }
  }
  
  // Extract published date
  const dateProperty = (properties["Published Date"] || properties["PublishedDate"] || properties.Date || properties.date) as NotionDateProperty | undefined;
  let publishedAt = new Date().toISOString();
  
  if (dateProperty?.type === 'date' && dateProperty.date?.start) {
    publishedAt = dateProperty.date.start;
  } else if (article.created_time) {
    publishedAt = article.created_time;
  }
  
  // Extract source URL
  const sourceProperty = (properties["Source URL"] || properties["SourceURL"] || properties.URL || properties.url) as NotionURLProperty | NotionRichTextProperty | undefined;
  let sourceUrl: string | undefined = undefined;
  if (sourceProperty) {
    if (sourceProperty.type === 'url') {
      sourceUrl = sourceProperty.url || undefined;
    } else if (sourceProperty.type === 'rich_text' && sourceProperty.rich_text?.[0]) {
      sourceUrl = sourceProperty.rich_text[0].plain_text;
    }
  }
  
  // Extract source name
  const sourceNameProperty = (properties["Source Name"] || properties["SourceName"] || properties.Source || properties.source) as NotionRichTextProperty | NotionTitleProperty | undefined;
  let sourceName: string | undefined = undefined;
  if (sourceNameProperty) {
    if (sourceNameProperty.type === 'rich_text' && sourceNameProperty.rich_text?.[0]) {
      sourceName = sourceNameProperty.rich_text[0].plain_text;
    } else if (sourceNameProperty.type === 'title' && sourceNameProperty.title?.[0]) {
      sourceName = sourceNameProperty.title[0].plain_text;
    }
  }
  
  // Extract category
  const categoryProperty = (properties.Category || properties.category) as NotionSelectProperty | NotionRichTextProperty | undefined;
  let category: string | undefined = undefined;
  if (categoryProperty) {
    if (categoryProperty.type === 'select' && categoryProperty.select) {
      category = categoryProperty.select.name;
    } else if (categoryProperty.type === 'rich_text' && categoryProperty.rich_text?.[0]) {
      category = categoryProperty.rich_text[0].plain_text;
    }
  }

  return {
    id: article.id,
    title,
    slug,
    description,
    publishedAt,
    sourceUrl,
    sourceName,
    category,
    content: blocks,
  };
}
