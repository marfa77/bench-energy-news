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
    
    // Используем более надежный подход - находим позиции начала и конца
    const contentStart = content.indexOf('<div class="content">');
    if (contentStart !== -1) {
      const contentStartPos = contentStart + '<div class="content">'.length;
      // Ищем следующий блок или конец body
      const sourceLinkPos = content.indexOf('<div class="source-link">', contentStartPos);
      const bodyEndPos = content.indexOf('</body>', contentStartPos);
      
      let contentEndPos = -1;
      if (sourceLinkPos !== -1 && (bodyEndPos === -1 || sourceLinkPos < bodyEndPos)) {
        contentEndPos = sourceLinkPos;
      } else if (bodyEndPos !== -1) {
        contentEndPos = bodyEndPos;
      }
      
      if (contentEndPos !== -1) {
        articleContent = content.substring(contentStartPos, contentEndPos).trim();
        // Убираем закрывающий </div> если есть в конце
        articleContent = articleContent.replace(/<\/div>\s*$/, '').trim();
        // Убираем заголовки версий и разделители, которые не должны отображаться
        articleContent = articleContent.replace(/<hr\s*\/?>\s*<h2>Web Version<\/h2>\s*/gi, '');
        articleContent = articleContent.replace(/<hr\s*\/?>\s*<h2>Telegram Version<\/h2>\s*/gi, '');
        articleContent = articleContent.replace(/<h2>Web Version<\/h2>\s*/gi, '');
        articleContent = articleContent.replace(/<h2>Telegram Version<\/h2>\s*/gi, '');
        articleContent = articleContent.replace(/---\s*<h2>Web Version<\/h2>\s*/gi, '');
        articleContent = articleContent.replace(/---\s*<h2>Telegram Version<\/h2>\s*/gi, '');
        articleContent = articleContent.replace(/##\s*Web Version\s*/gi, '');
        articleContent = articleContent.replace(/##\s*Telegram Version\s*/gi, '');
        // Убираем лишние разделители
        articleContent = articleContent.replace(/<hr\s*\/?>\s*<hr\s*\/?>/gi, '<hr />');
        // Убираем дублирующийся заголовок h1 из контента (заголовок уже отображается отдельно)
        articleContent = articleContent.replace(/<h1[^>]*>.*?<\/h1>\s*/gi, '');
      }
    }
    
    // Fallback: ищем <article>
    if (!articleContent) {
      const articleMatch = content.match(/<article[^>]*>(.*?)<\/article>/s);
      if (articleMatch) {
        articleContent = articleMatch[1].trim();
      }
    }
    
    // Fallback: ищем содержимое между <body> и </body>
    if (!articleContent) {
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
        // Убираем telegram link блок
        bodyContent = bodyContent.replace(/<div style="margin-top: 40px.*?<\/div>\s*<\/body>/s, '');
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
        }} className="back-link">
          ← Back to News
        </Link>
        
        <article>
          <h1 style={{ marginBottom: '1rem' }} className="article-title">{article.title}</h1>
          <time style={{ 
            color: '#666', 
            fontSize: '0.95rem',
            display: 'block',
            marginBottom: '2rem',
          }} className="article-date">
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
            className="article-content"
          />
        </article>
      </div>
    </div>
  );
}
