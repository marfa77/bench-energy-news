import Link from 'next/link';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  url: string;
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const blogDir = join(process.cwd(), 'blog');
    const files = await readdir(blogDir);
    const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html');
    
    const posts: BlogPost[] = [];
    
    for (const file of htmlFiles) {
      try {
        const filePath = join(blogDir, file);
        const content = await readFile(filePath, 'utf-8');
        
        // Extract title
        const titleMatch = content.match(/<title>(.*?)<\/title>/s);
        let title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Bench Energy Blog\s*$/i, '').trim() : file.replace('.html', '').replace(/-/g, ' ');
        
        // Extract date
        const dateMatch = content.match(/<meta property="article:published_time" content="([^"]+)"/);
        const date = dateMatch ? dateMatch[1] : new Date().toISOString();
        
        const slug = file.replace('.html', '');
        posts.push({
          slug,
          title,
          date,
          url: `/blog/${slug}`,
        });
      } catch (e) {
        // Error reading file - skip
      }
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return posts;
  } catch (error) {
    // Error reading blog posts
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  
  return (
    <div className="section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ marginBottom: '1rem' }}>Bench Energy Blog</h1>
        <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '3rem', maxWidth: '800px' }}>
          Articles about coal markets, freight, and energy industry insights from Bench Energy experts.
        </p>
        
        {posts.length === 0 ? (
          <p style={{ color: '#666' }}>No blog posts found. Posts will appear here after synchronization from Notion.</p>
        ) : (
          <div style={{
            display: 'grid',
            gap: '2rem',
          }}>
            {posts.map((post) => (
              <article key={post.slug} style={{
                padding: '2rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }} className="hover-card">
                <h2 style={{ marginBottom: '0.75rem' }}>
                  <Link href={post.url} style={{
                    color: '#1a1a1a',
                    textDecoration: 'none',
                  }}>
                    {post.title}
                  </Link>
                </h2>
                <time style={{ 
                  color: '#999', 
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '1rem',
                }}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <Link href={post.url} style={{
                  color: '#0066cc',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}>
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
