import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

// Cache for blog posts (in-memory cache)
const postsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  content?: any; // Notion blocks for full post
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
              "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
          }
        );
      }

      // First, get all pages (with cache)
      const allPages = await getAllPages(parentPageId);
      
      // Find page by slug
      const page = allPages.find((p: any) => {
        const pageSlug = getSlugFromPage(p);
        return pageSlug === slug;
      });

      if (!page) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      // Get all blocks recursively for the full post
      const allBlocks: any[] = [];
      let cursor: string | undefined = undefined;
      
      do {
        const response = await notion.blocks.children.list({
          block_id: page.id,
          start_cursor: cursor,
        });
        allBlocks.push(...response.results);
        cursor = response.next_cursor || undefined;
      } while (cursor);

      const post = parseNotionPage(page, allBlocks);
      
      // Cache the result
      postsCache.set(cacheKey, { data: post, timestamp: Date.now() });
      
      return NextResponse.json(
        { post },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Otherwise, fetch all posts (without loading blocks for performance)
    const cacheKey = "posts-list";
    const cached = postsCache.get(cacheKey);
    
    // Check cache
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(
        { posts: cached.data },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const allPages = await getAllPages(parentPageId);
    const posts = allPages.map((page: any) => parseNotionPage(page));
    
    // Sort by created date (newest first)
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    // Cache the result
    postsCache.set(cacheKey, { data: posts, timestamp: Date.now() });
    
    return NextResponse.json(
      { posts },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

async function getAllPages(parentPageId: string): Promise<any[]> {
  const pages: any[] = [];

  // Get child pages from parent page
  if (parentPageId) {
    try {
      // Get child blocks from parent page
      const blocks = await notion.blocks.children.list({
        block_id: parentPageId,
      });

      // Filter for child pages (type: child_page) and retrieve full page data (in parallel)
      const childPageBlocks = blocks.results.filter((block: any) => block.type === "child_page");
      
      const pagePromises = childPageBlocks.map(async (block: any) => {
        try {
          // Retrieve full page data to get title and other properties
          return await notion.pages.retrieve({ page_id: block.id });
        } catch (error) {
          console.error(`Error retrieving page ${block.id}:`, error);
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

function getSlugFromPage(page: any): string {
  // Try to get title from various sources
  let title = "";
  
  // Try child_page title
  if ((page as any).child_page?.title) {
    title = (page as any).child_page.title
      .map((t: any) => t.plain_text)
      .join("");
  }
  
  // Try properties
  if (!title) {
    title = page.properties?.title?.title?.[0]?.plain_text || 
            (page as any).properties?.Title?.title?.[0]?.plain_text ||
            "";
  }
  
  // Create slug from title
  if (title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  // Fallback to page ID
  return page.id.replace(/-/g, "");
}

function parseNotionPage(page: any, blocks?: any[]): BlogPost {
  const properties = page.properties || {};

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
  if (!title && properties.title?.title) {
    title = properties.title.title
      .map((t: any) => t.plain_text)
      .join("");
  }
  
  // Try other property names
  if (!title) {
    title = 
      properties.Title?.title?.[0]?.plain_text ||
      properties.Name?.title?.[0]?.plain_text ||
      "";
  }
  
  // Try page title directly
  if (!title && (page as any).title) {
    if (Array.isArray((page as any).title)) {
      title = (page as any).title
        .map((t: any) => t.plain_text || t)
        .join("");
    } else {
      title = (page as any).title;
    }
  }
  
  // Fallback to Untitled
  if (!title) {
    title = "Untitled";
  }

  // Extract slug - create from title if not provided
  const slug =
    properties.Slug?.rich_text?.[0]?.plain_text ||
    properties.URL?.rich_text?.[0]?.plain_text ||
    getSlugFromPage(page);

  // Extract excerpt - try to get from first paragraph block if available
  let excerpt = 
    properties.Excerpt?.rich_text?.[0]?.plain_text ||
    properties.Description?.rich_text?.[0]?.plain_text ||
    "";
  
  // If no excerpt in properties, try to get from first block
  if (!excerpt && blocks && blocks.length > 0) {
    const firstParagraph = blocks.find((b: any) => b.type === "paragraph");
    if (firstParagraph) {
      const text = (firstParagraph as any).paragraph?.rich_text
        ?.map((t: any) => t.plain_text)
        .join("") || "";
      excerpt = text.substring(0, 200); // First 200 chars
    }
  }

  // Extract published date
  let publishedAt = 
    properties["Published Date"]?.date?.start ||
    properties.Date?.date?.start ||
    "";
  
  // Try page created_time
  if (!publishedAt) {
    publishedAt = page.created_time || (page as any).created_time || "";
  }
  
  // Fallback to current date if nothing found
  if (!publishedAt) {
    publishedAt = new Date().toISOString();
  }

  // Extract author
  const author =
    properties.Author?.rich_text?.[0]?.plain_text ||
    properties["Author"]?.select?.name ||
    "";

  // Extract tags
  const tags =
    properties.Tags?.multi_select?.map((tag: any) => tag.name) ||
    properties.Tag?.multi_select?.map((tag: any) => tag.name) ||
    [];

  // Extract cover image
  const coverImage =
    page.cover?.external?.url ||
    page.cover?.file?.url ||
    properties["Cover Image"]?.files?.[0]?.external?.url ||
    properties["Cover Image"]?.files?.[0]?.file?.url ||
    "";

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
