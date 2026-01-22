import { notFound } from 'next/navigation';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const blogDir = join(process.cwd(), 'blog');
    const files = await readdir(blogDir);
    const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
    
    return htmlFiles.map(file => ({
      slug: file.replace('.html', ''),
    }));
  } catch {
    return [];
  }
}

async function getBlogPost(slug: string) {
  try {
    const filePath = join(process.cwd(), 'blog', `${slug}.html`);
    const content = await readFile(filePath, 'utf-8');
    
    // Extract title
    const titleMatch = content.match(/<title>(.*?)<\/title>/s);
    let title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Bench Energy Blog\s*$/i, '').trim() : slug;
    // Decode HTML entities (&#x27; -> ', &quot; -> ", etc.)
    title = title.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    
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

export async function generateMetadata({ params }: PageProps) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return {
    title: `${post.title} | Bench Energy Blog`,
    description: `${post.title} - Bench Energy Blog`,
    openGraph: {
      title: post.title,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link href="/blog" style={{
          color: '#0066cc',
          textDecoration: 'none',
          fontSize: '0.95rem',
          marginBottom: '2rem',
          display: 'inline-block',
        }}>
          ← Back to Blog
        </Link>
        
        <article>
          <h1 style={{ marginBottom: '1rem' }}>{post.title}</h1>
          <time style={{ 
            color: '#666', 
            fontSize: '0.95rem',
            display: 'block',
            marginBottom: '2rem',
          }}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              lineHeight: '1.8',
            }}
          />
        </article>
      </div>
    </div>
  );
}
