import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type { NotionPage, NotionBlock } from "@/app/lib/notion-types";

// Cache for blog posts (in-memory cache)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const postsCache = new Map<string, CacheEntry<BlogPost | BlogPost[]>>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes (increased for better performance)
const MAX_CACHE_SIZE = 100; // Maximum number of cache entries

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt: string;
  author?: string;
  tags?: string[];
  content?: unknown[]; // Notion blocks for full post (using unknown due to Notion SDK types)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const parentPageId = process.env.NOTION_BLOG_PAGE_ID;

    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json(
        { error: "NOTION_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!parentPageId) {
      return NextResponse.json(
        { error: "NOTION_BLOG_PAGE_ID is not configured" },
        { status: 500 }
      );
    }

    // If slug is provided, fetch single post
    if (slug) {
      const cacheKey = `post-${slug}`;
      const cached = postsCache.get(cacheKey);
      
      // Check cache
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(
          { post: cached.data },
          {
            headers: {
              "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
            },
          }
        );
      }

      // First, get all pages (with cache)
      const allPages = await getAllPages(parentPageId);
      
      // Find page by slug
      const page = allPages.find((p: unknown) => {
        const pageSlug = getSlugFromPage(p);
        return pageSlug === slug;
      });

      if (!page) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      // Get page ID with type safety
      const pageId = typeof page === 'object' && page !== null && 'id' in page && typeof page.id === 'string'
        ? page.id
        : '';
      
      if (!pageId) {
        return NextResponse.json({ error: "Invalid page data" }, { status: 500 });
      }

      // Get all blocks recursively for the full post
      const allBlocks: unknown[] = [];
      let cursor: string | undefined = undefined;
      
      do {
        const response = await notion.blocks.children.list({
          block_id: pageId,
          start_cursor: cursor,
        });
        allBlocks.push(...response.results);
        cursor = response.next_cursor || undefined;
      } while (cursor);

      const post = parseNotionPage(page as NotionPage | { id: string; created_time?: string; child_page?: { title: string | Array<{ plain_text: string }> }; properties?: unknown }, allBlocks);
      
      // Cache the result with size limit
      ensureCacheSizeLimit();
      postsCache.set(cacheKey, { data: post, timestamp: Date.now() });
      
      return NextResponse.json(
        { post },
        {
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          },
        }
      );
    }

  // Otherwise, fetch all posts (with first image from blocks for better previews)
  const cacheKey = "posts-list";
  const cached = postsCache.get(cacheKey);
  
  // Check cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(
      { posts: cached.data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      }
    );
  }

  const allPages = await getAllPages(parentPageId);
  
  // Parse pages without fetching blocks for better performance
  // Only parse metadata - no additional API calls for images
  const posts = allPages.map((page: unknown) => parseNotionPage(page as NotionPage | { id: string; created_time?: string; child_page?: { title: string | Array<{ plain_text: string }> }; properties?: unknown }));
  
  // Sort by created date (newest first)
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Cache the result with size limit
  ensureCacheSizeLimit();
  postsCache.set(cacheKey, { data: posts, timestamp: Date.now() });
  
  return NextResponse.json(
    { posts },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    }
  );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch blog posts";
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
  if (postsCache.size >= MAX_CACHE_SIZE) {
    // Find oldest entry by timestamp
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, entry] of postsCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      postsCache.delete(oldestKey);
    }
  }
}

async function getAllPages(parentPageId: string): Promise<unknown[]> {
  const pages: unknown[] = [];

  // Get child pages from parent page
  if (parentPageId) {
    try {
      // Get child blocks from parent page
      const blocks = await notion.blocks.children.list({
        block_id: parentPageId,
      });

      // Filter for child pages (type: child_page) and retrieve full page data (in parallel)
      const childPageBlocks = blocks.results.filter((block: unknown) => {
        return typeof block === 'object' && block !== null && 'type' in block && block.type === "child_page";
      });
      
      const pagePromises = childPageBlocks.map(async (block: unknown) => {
        // Extract block ID with type safety
        const blockId = typeof block === 'object' && block !== null && 'id' in block && typeof block.id === 'string' 
          ? block.id 
          : '';
        
        if (!blockId) return block;
        
        try {
          // Retrieve full page data to get title and other properties
          return await notion.pages.retrieve({ page_id: blockId });
        } catch (error) {
          console.error(`Error retrieving page ${blockId}:`, error);
          // Fallback: use block if retrieval fails
          return block;
        }
      });
      
      const retrievedPages = await Promise.all(pagePromises);
      pages.push(...retrievedPages);
    } catch (error) {
      console.error("Error fetching child pages:", error);
    }
  }

  return pages;
}

function getSlugFromPage(page: unknown): string {
  // Try to get title from various sources
  let title = "";
  
  // Type guard for page object
  if (typeof page !== 'object' || page === null) {
    return '';
  }
  
  // Try child_page title (for blocks)
  if ('child_page' in page) {
    const childPage = (page as { child_page?: { title?: string | Array<{ plain_text?: string }> } }).child_page;
    if (childPage?.title) {
      title = Array.isArray(childPage.title) 
        ? childPage.title.map((t) => typeof t === 'string' ? t : t.plain_text || '').join("")
        : childPage.title;
    }
  }
  
  // Try properties (for full pages)
  if (!title && 'properties' in page) {
    const props = (page as { properties?: Record<string, unknown> }).properties;
    if (props) {
      const titleProp = props.title as { type?: string; title?: Array<{ plain_text?: string }> } | undefined;
      const titleUpperProp = props.Title as { type?: string; title?: Array<{ plain_text?: string }> } | undefined;
      
      if (titleProp && titleProp.type === 'title' && titleProp.title?.[0]) {
        title = titleProp.title[0].plain_text || '';
      } else if (titleUpperProp && titleUpperProp.type === 'title' && titleUpperProp.title?.[0]) {
        title = titleUpperProp.title[0].plain_text || '';
      }
    }
  }
  
  // Create slug from title
  if (title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  // Fallback to page ID
  const pageId = 'id' in page && typeof page.id === 'string'
    ? page.id
    : '';
  return pageId.replace(/-/g, "");
}

function parseNotionPage(page: NotionPage | { id: string; created_time?: string; child_page?: { title: string | Array<{ plain_text: string }> }; properties?: unknown }, blocks?: unknown[]): BlogPost {
  const properties = ('properties' in page && page.properties && typeof page.properties === 'object') 
    ? page.properties as Record<string, unknown>
    : {} as Record<string, unknown>;

  // Extract title - for pages, title can be in different places
  // For child_page blocks, title is in child_page.title
  // For full pages, title is in properties.title
  let title = "";
  
  // Try child_page title first (for blocks)
  if ((page as any).child_page?.title) {
    title = (page as any).child_page.title
      .map((t: any) => t.plain_text)
      .join("");
  }
  
  // Try properties.title (for full pages)
  if (!title) {
    const titleProp = properties.title as { type?: string; title?: Array<{ plain_text?: string }> } | undefined;
    if (titleProp && titleProp.type === 'title' && titleProp.title) {
      title = titleProp.title
        .map((t) => t.plain_text || '')
        .join("");
    }
  }
  
  // Try other property names
  if (!title) {
    const titleUpperProp = properties.Title as { type?: string; title?: Array<{ plain_text?: string }> } | undefined;
    const nameProp = properties.Name as { type?: string; title?: Array<{ plain_text?: string }> } | undefined;
    
    title = titleUpperProp?.title?.[0]?.plain_text ||
            nameProp?.title?.[0]?.plain_text ||
            "";
  }
  
  // Try page title directly (for compatibility)
  if (!title && typeof page === 'object' && page !== null && 'title' in page) {
    const pageTitle = (page as { title?: string | Array<{ plain_text?: string }> }).title;
    if (Array.isArray(pageTitle)) {
      title = pageTitle
        .map((t) => typeof t === 'string' ? t : t.plain_text || '')
        .join("");
    } else if (typeof pageTitle === 'string') {
      title = pageTitle;
    }
  }
  
  // Fallback to Untitled
  if (!title) {
    title = "Untitled";
  }

  // Extract slug - create from title if not provided
  const slugProp = properties.Slug as { type?: string; rich_text?: Array<{ plain_text?: string }> } | undefined;
  const urlProp = properties.URL as { type?: string; rich_text?: Array<{ plain_text?: string }> } | undefined;
  const slug =
    slugProp?.rich_text?.[0]?.plain_text ||
    urlProp?.rich_text?.[0]?.plain_text ||
    getSlugFromPage(page);

  // Extract excerpt - try to get from first paragraph block if available
  const excerptProp = properties.Excerpt as { type?: string; rich_text?: Array<{ plain_text?: string }> } | undefined;
  const descProp = properties.Description as { type?: string; rich_text?: Array<{ plain_text?: string }> } | undefined;
  let excerpt = excerptProp?.rich_text?.[0]?.plain_text ||
                descProp?.rich_text?.[0]?.plain_text ||
                "";
  
  // If no excerpt in properties, try to get from first block
  if (!excerpt && blocks && blocks.length > 0) {
    const firstParagraph = blocks.find((b: unknown) => {
      return typeof b === 'object' && b !== null && 'type' in b && b.type === "paragraph";
    });
    if (firstParagraph && typeof firstParagraph === 'object' && firstParagraph !== null && 'paragraph' in firstParagraph) {
      const paragraphData = (firstParagraph as { paragraph?: { rich_text?: Array<{ plain_text?: string }> } }).paragraph;
      const text = paragraphData?.rich_text
        ?.map((t) => t.plain_text || '')
        .join("") || "";
      excerpt = text.substring(0, 200); // First 200 chars
    }
  }

  // Extract published date
  const pubDateProp = properties["Published Date"] as { type?: string; date?: { start?: string } } | undefined;
  const dateProp = properties.Date as { type?: string; date?: { start?: string } } | undefined;
  let publishedAt = pubDateProp?.date?.start ||
                    dateProp?.date?.start ||
                    "";
  
  // Try page created_time
  if (!publishedAt && 'created_time' in page) {
    publishedAt = page.created_time || "";
  }
  
  // Fallback to current date if nothing found
  if (!publishedAt) {
    publishedAt = new Date().toISOString();
  }

  // Extract author
  const authorRichProp = properties.Author as { type?: string; rich_text?: Array<{ plain_text?: string }> } | undefined;
  const authorSelectProp = properties.Author as { type?: string; select?: { name?: string } } | undefined;
  const author = authorRichProp?.rich_text?.[0]?.plain_text ||
                 authorSelectProp?.select?.name ||
                 "";

  // Extract tags
  const tagsProp = properties.Tags as { type?: string; multi_select?: Array<{ name?: string }> } | undefined;
  const tagProp = properties.Tag as { type?: string; multi_select?: Array<{ name?: string }> } | undefined;
  const tags = tagsProp?.multi_select?.map((tag) => tag.name || '') ||
               tagProp?.multi_select?.map((tag) => tag.name || '') ||
               [];

  // Extract cover image
  let coverImage = "";
  if ('cover' in page && page.cover && typeof page.cover === 'object') {
    const cover = page.cover as { external?: { url?: string }; file?: { url?: string } } | undefined;
    coverImage = cover?.external?.url || cover?.file?.url || "";
  }
  
  if (!coverImage) {
    const coverProp = properties["Cover Image"] as { type?: string; files?: Array<{ external?: { url?: string }; file?: { url?: string } }> } | undefined;
    coverImage = coverProp?.files?.[0]?.external?.url ||
                 coverProp?.files?.[0]?.file?.url ||
                 "";
  }

  return {
    id: page.id,
    title,
    slug,
    excerpt,
    coverImage,
    publishedAt,
    author,
    tags,
    content: blocks,
  };
}
