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
    
    for (const file of htmlFiles.slice(0, 30)) {
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
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Coal Market News</h1>
        <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '3rem', maxWidth: '800px' }}>
          Latest news and analysis about coal markets, prices, and industry developments with expert insights from Bench Energy.
        </p>
        
        {articles.length === 0 ? (
          <p style={{ color: '#666' }}>No articles found. Articles will appear here after synchronization.</p>
        ) : (
          <div style={{
            display: 'grid',
            gap: '2rem',
          }}>
            {articles.map((article) => (
              <article key={article.slug} style={{
                padding: '2rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }} className="hover-card">
                <h2 style={{ marginBottom: '0.75rem' }}>
                  <Link href={article.url} style={{
                    color: '#1a1a1a',
                    textDecoration: 'none',
                  }}>
                    {article.title}
                  </Link>
                </h2>
                <p style={{ 
                  color: '#666', 
                  marginBottom: '1rem',
                  fontSize: '0.95rem',
                }}>
                  {article.description.length > 200 ? `${article.description.substring(0, 200)}...` : article.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <time style={{ color: '#999', fontSize: '0.875rem' }}>
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <Link href={article.url} style={{
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                  }}>
                    Read more →
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
