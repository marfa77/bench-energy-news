import { notFound } from 'next/navigation';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getArticle(slug: string) {
  try {
    const filePath = join(process.cwd(), 'posts', `${slug}.html`);
    const content = await readFile(filePath, 'utf-8');
    
    // Extract title
    const titleMatch = content.match(/<title>(.*?)<\/title>/s);
    let title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Bench Energy\s*$/i, '').trim() : slug;
    // Decode HTML entities (&#x27; -> ', &quot; -> ", etc.)
    title = title.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    
    // Extract article body - ищем <div class="content"> или <article>
    let articleContent = '';
    const contentDivMatch = content.match(/<div class="content">(.*?)<\/div>/s);
    const articleMatch = content.match(/<article[^>]*>(.*?)<\/article>/s);
    
    if (contentDivMatch) {
      articleContent = contentDivMatch[1];
    } else if (articleMatch) {
      articleContent = articleMatch[1];
    } else {
      // Fallback: ищем содержимое между <body> и </body>
      const bodyMatch = content.match(/<body[^>]*>(.*?)<\/body>/s);
      if (bodyMatch) {
        // Убираем header, ai-summary и другие служебные элементы
        let bodyContent = bodyMatch[1];
        // Убираем header
        bodyContent = bodyContent.replace(/<div class="header">.*?<\/div>/s, '');
        // Убираем ai-summary
        bodyContent = bodyContent.replace(/<div class="ai-summary">.*?<\/div>/s, '');
        // Убираем source-link
        bodyContent = bodyContent.replace(/<div class="source-link">.*?<\/div>/s, '');
        articleContent = bodyContent.trim();
      }
    }
    
    // Extract date
    const dateMatch = content.match(/<meta property="article:published_time" content="([^"]+)"/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString();
    
    return {
      title,
      content: articleContent,
      date,
      slug,
    };
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const postsDir = join(process.cwd(), 'posts');
    const files = await readdir(postsDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    
    // Limit to prevent too many pages during build (max 50 pages)
    return htmlFiles.slice(0, 50).map(file => ({
      slug: file.replace('.html', ''),
    }));
  } catch {
    // Return empty array if directory doesn't exist or can't be read
    return [];
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }
  
  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link href="/news" style={{
          color: '#0066cc',
          textDecoration: 'none',
          fontSize: '0.95rem',
          marginBottom: '2rem',
          display: 'inline-block',
        }}>
          ← Back to News
        </Link>
        
        <article>
          <h1 style={{ marginBottom: '1rem' }}>{article.title}</h1>
          <time style={{ 
            color: '#666', 
            fontSize: '0.95rem',
            display: 'block',
            marginBottom: '2rem',
          }}>
            {new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              lineHeight: '1.8',
            }}
          />
        </article>
      </div>
    </div>
  );
}
