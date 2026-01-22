import type { Metadata } from "next";
import { Client } from "@notionhq/client";

const SITE_URL = "https://www.bench.energy";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function getPostBySlug(slug: string) {
  try {
    const parentPageId = process.env.NOTION_BLOG_PAGE_ID;

    if (!parentPageId) {
      return null;
    }

    // Get all pages
    const allPages: any[] = [];
    
    try {
      const blocks = await notion.blocks.children.list({
        block_id: parentPageId,
      });
      for (const block of blocks.results) {
        if ((block as any).type === "child_page") {
          try {
            const fullPage = await notion.pages.retrieve({ page_id: block.id });
            allPages.push(fullPage);
          } catch (error) {
            console.error(`Error retrieving page ${block.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching child pages:", error);
    }

    // Find page by slug
    const page = allPages.find((p: any) => {
      const properties = p.properties || {};
      const title = 
        (p as any).child_page?.title?.map((t: any) => t.plain_text).join("") ||
        properties.title?.title?.map((t: any) => t.plain_text).join("") ||
        properties.Title?.title?.[0]?.plain_text ||
        "";
      const pageSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || p.id.replace(/-/g, "");
      return pageSlug === slug;
    });

    return page;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

function getTitleFromPage(page: any): string {
  const properties = page.properties || {};
  const title = 
    (page as any).child_page?.title?.map((t: any) => t.plain_text).join("") ||
    properties.title?.title?.map((t: any) => t.plain_text).join("") ||
    properties.Title?.title?.[0]?.plain_text ||
    "Untitled";
  return title;
}

function getExcerptFromPage(page: any): string {
  const properties = page.properties || {};
  return (
    properties.Excerpt?.rich_text?.[0]?.plain_text ||
    properties.Description?.rich_text?.[0]?.plain_text ||
    "Articles about coal markets, freight, and energy industry insights from Bench Energy experts."
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | Bench Energy Blog",
      description: "The requested blog post could not be found.",
    };
  }

  const title = getTitleFromPage(post);
  const excerpt = getExcerptFromPage(post);
  const coverImage = 
    post.cover?.external?.url ||
    post.cover?.file?.url ||
    `${SITE_URL}/logo.png`;

  return {
    title: `${title} | Bench Energy Blog`,
    description: excerpt,
    keywords: [
      "coal market",
      "energy news",
      "freight",
      "commodity trading",
      "bench energy",
    ],
    openGraph: {
      title: `${title} | Bench Energy Blog`,
      description: excerpt,
      url: `${SITE_URL}/blog/${params.slug}`,
      type: "article",
      siteName: "Bench Energy",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: post.created_time || new Date().toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Bench Energy Blog`,
      description: excerpt,
      images: [coverImage],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${params.slug}`,
    },
  };
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
