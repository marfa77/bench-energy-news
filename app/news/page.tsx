import Link from 'next/link';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  url: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const postsDir = join(process.cwd(), 'posts');
    const files = await readdir(postsDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    
    const articles: Article[] = [];
    
    // Сначала читаем все файлы, потом сортируем
    for (const file of htmlFiles) {
      try {
        const filePath = join(postsDir, file);
        const content = await readFile(filePath, 'utf-8');
        
        // Extract title
        const titleMatch = content.match(/<title>(.*?)<\/title>/s);
        let title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Bench Energy\s*$/i, '').trim() : file.replace('.html', '').replace(/-/g, ' ');
        // Decode HTML entities (&#x27; -> ', &amp; -> &, etc.)
        title = title.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        // Extract description
        const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
        const description = descMatch ? descMatch[1] : title;
        
        // Extract date
        const dateMatch = content.match(/<meta property="article:published_time" content="([^"]+)"/);
        const date = dateMatch ? dateMatch[1] : new Date().toISOString();
        
        const slug = file.replace('.html', '');
        articles.push({
          slug,
          title,
          description,
          date,
          url: `/news/${slug}`,
        });
      } catch (e) {
        // Error reading file - skip
      }
    }
    
    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return articles;
  } catch (error) {
    // Error reading articles
    return [];
  }
}

export default async function NewsPage() {
  const articles = await getArticles();
  
  return (
    <div className="py-12 md:py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Coal Market News</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Latest news and analysis about coal markets, prices, and industry developments with expert insights from Bench Energy.
          </p>
        </div>
        
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found. Articles will appear here after synchronization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {articles.map((article) => (
              <article 
                key={article.slug} 
                className="group bg-white border border-gray-200 rounded-xl p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  <Link href={article.url} className="no-underline">
                    {article.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {article.description.length > 200 ? `${article.description.substring(0, 200)}...` : article.description}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                  <time className="text-sm text-gray-500">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <Link 
                    href={article.url} 
                    className="text-primary-600 font-medium text-sm hover:text-primary-700 no-underline inline-flex items-center"
                  >
                    Read more
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
