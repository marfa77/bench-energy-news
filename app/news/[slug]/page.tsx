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
    const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Bench Energy\s*$/i, '').trim() : slug;
    
    // Extract article body
    const articleMatch = content.match(/<article[^>]*>(.*?)<\/article>/s);
    const articleContent = articleMatch ? articleMatch[1] : '';
    
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
    
    return htmlFiles.map(file => ({
      slug: file.replace('.html', ''),
    }));
  } catch {
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
