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
    <div className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
            <p className="text-gray-600 text-lg">No articles found. Articles will appear here after synchronization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {articles.map((article, index) => (
              <article 
                key={article.slug} 
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative flex-grow flex flex-col">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    <Link href={article.url} className="no-underline">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {article.description.length > 200 ? `${article.description.substring(0, 200)}...` : article.description}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-auto">
                    <time className="text-sm text-gray-500 font-medium">
                      {new Date(article.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <Link 
                      href={article.url} 
                      className="text-blue-600 font-semibold text-sm hover:text-blue-700 no-underline inline-flex items-center group/link"
                    >
                      Read more
                      <svg className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
