import { MetadataRoute } from 'next';

const SITE_URL = 'https://www.bench.energy';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/freighttender`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/freighttender/capabilities`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/freighttender/data-collection`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/freighttender/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/topics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic news articles from Notion
  let newsArticles: MetadataRoute.Sitemap = [];
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const apiKey = process.env.NOTION_API_KEY;

    if (apiKey && databaseId) {
      const NOTION_API_URL = 'https://api.notion.com/v1';
      const NOTION_VERSION = '2022-06-28';

      const articles: any[] = [];
      let cursor: string | undefined = undefined;

      do {
        const response = await fetch(
          `${NOTION_API_URL}/databases/${databaseId}/query`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Notion-Version': NOTION_VERSION,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filter: {
                property: 'Published',
                checkbox: {
                  equals: true,
                },
              },
              sorts: [
                {
                  property: 'Published Date',
                  direction: 'descending',
                },
              ],
              start_cursor: cursor,
            }),
            next: { revalidate: 3600 }, // 1 hour cache
          }
        );

        if (!response.ok) break;

        const data = await response.json();
        articles.push(...data.results);
        cursor = data.next_cursor || undefined;
      } while (cursor);

      // Parse articles and create sitemap entries
      newsArticles = articles.map((article: any) => {
        const properties = article.properties || {};
        
        // Get title
        let title = 'Untitled';
        if (properties.Name?.title) {
          title = properties.Name.title
            .map((t: any) => t.plain_text || '')
            .join('');
        }
        
        // Generate slug
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[-\s]+/g, '-')
          .trim()
          .substring(0, 80);

        // Get published date
        let publishedDate = new Date();
        if (properties['Published Date']?.date?.start) {
          publishedDate = new Date(properties['Published Date'].date.start);
        } else if (article.created_time) {
          publishedDate = new Date(article.created_time);
        }

        return {
          url: `${SITE_URL}/news/${slug}`,
          lastModified: publishedDate,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching news articles for sitemap:', error);
  }

  // Dynamic blog posts (if you have a blog database)
  let blogPosts: MetadataRoute.Sitemap = [];
  // Add blog posts fetching logic here if needed

  return [...staticPages, ...newsArticles, ...blogPosts];
}
