import { readFile } from 'fs/promises';
import { join } from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

async function getBlogPost(slug: string) {
  const blogDir = join(process.cwd(), 'blog');
  const filePath = join(blogDir, `${slug}.html`);
  
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Извлекаем title
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Bench Energy Blog\s*/i, '').trim() : slug;
    
    // Извлекаем дату
    const dateMatch = content.match(/Published:\s*([^<|]+)/i) ||
                     content.match(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
    const publishedDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
    
    // Извлекаем контент из <div class="content"> или <article>
    // Используем более точное регулярное выражение для извлечения всего контента
    let htmlContent = '';
    const contentDivMatch = content.match(/<div[^>]*class=["']content["'][^>]*>([\s\S]*?)<\/div>/i);
    const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    
    if (contentDivMatch) {
      htmlContent = contentDivMatch[1];
    } else if (articleMatch) {
      // Если нашли article, извлекаем только содержимое без заголовка и мета
      const articleContent = articleMatch[1];
      // Убираем заголовок и мета-информацию
      htmlContent = articleContent
        .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '')
        .replace(/<div[^>]*class=["']meta["'][^>]*>[\s\S]*?<\/div>/i, '')
        .trim();
    }
    
    // Если контент пустой, пробуем извлечь все между <body> и </body>
    if (!htmlContent) {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        const bodyContent = bodyMatch[1];
        // Убираем навигацию и мета-информацию
        htmlContent = bodyContent
          .replace(/<a[^>]*class=["']back-link["'][^>]*>[\s\S]*?<\/a>/i, '')
          .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '')
          .replace(/<div[^>]*class=["']meta["'][^>]*>[\s\S]*?<\/div>/i, '')
          .replace(/<p[^>]*style[^>]*>[\s\S]*?View in Notion[\s\S]*?<\/p>/i, '')
          .trim();
      }
    }
    
    // Извлекаем description
    const descMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const description = descMatch ? descMatch[1] : title;
    
    // Извлекаем первое изображение из контента
    let imageUrl: string | undefined = undefined;
    const doubleQuoteMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
    if (doubleQuoteMatch) {
      imageUrl = doubleQuoteMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
    } else {
      const singleQuoteMatch = content.match(/<img[^>]*src='([^']+)'[^>]*>/i);
      if (singleQuoteMatch) {
        imageUrl = singleQuoteMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
      }
    }
    
    return {
      title,
      slug,
      publishedDate,
      htmlContent,
      description,
      imageUrl,
    };
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  const blogDir = join(process.cwd(), 'blog');
  const { readdir } = await import('fs/promises');
  
  try {
    const files = await readdir(blogDir);
    const slugs = files
      .filter(file => file.endsWith('.html') && file !== 'index.html')
      .map(file => file.replace('.html', ''));
    
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return {
    title: `${post.title} | Bench Energy Blog`,
    description: post.description || post.title,
    keywords: [
      'coal market',
      'energy analysis',
      'freight logistics',
      'commodity trading',
      'Bench Energy',
      'thermal coal',
      'coking coal',
      'dry bulk shipping',
      'freight rates',
      'port operations',
      'vessel availability',
    ],
    authors: [{ name: 'Bench Energy' }],
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      type: 'article',
      publishedTime: post.publishedDate,
      modifiedTime: post.publishedDate,
      url: `https://www.bench.energy/blog/${post.slug}`,
      siteName: 'Bench Energy',
      locale: 'en_US',
      images: [
        {
          url: post.imageUrl || 'https://www.bench.energy/logo.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || post.title,
      images: [post.imageUrl || 'https://www.bench.energy/logo.png'],
      site: '@Bench_energy',
      creator: '@Bench_energy',
    },
    alternates: {
      canonical: `https://www.bench.energy/blog/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };
  
  // Schema.org BlogPosting for LLM
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description || post.title,
    "datePublished": post.publishedDate,
    "dateModified": post.publishedDate,
    "author": {
      "@type": "Organization",
      "name": "Bench Energy",
      "url": "https://www.bench.energy"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bench Energy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.bench.energy/logo.png",
        "width": 1200,
        "height": 630
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.bench.energy/blog/${post.slug}`
    },
    "articleSection": "Coal Market Analysis",
    "inLanguage": "en-US"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema)
        }}
      />
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.bench.energy"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.bench.energy/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `https://www.bench.energy/blog/${post.slug}`
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.bench.energy"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://www.bench.energy/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": `https://www.bench.energy/blog/${post.slug}`
              }
            ]
          })
        }}
      />
      <div className="pt-24 pb-12 md:pb-20 bg-white min-h-screen">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
        
        <article className="max-w-none">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="text-gray-500 text-sm border-b border-gray-200 pb-6">
              Published: {formatDate(post.publishedDate)} | Bench Energy
            </div>
          </header>
          
          <div 
            className="blog-content text-gray-800 leading-relaxed
              [&_p]:mb-6 [&_p]:text-base [&_p]:leading-7
              [&_p:first-of-type]:text-lg [&_p:first-of-type]:font-medium [&_p:first-of-type]:text-gray-900 [&_p:first-of-type]:mb-8
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:leading-tight
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-5 [&_h2]:leading-tight [&_h2]:pt-2 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-3
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:leading-tight
              [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-6 [&_h4]:mb-3
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-6 [&_ul]:space-y-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-6 [&_ol]:space-y-2
              [&_li]:mb-2 [&_li]:leading-7 [&_li]:text-base [&_li]:pl-1
              [&_strong]:font-bold [&_strong]:text-gray-900
              [&_em]:italic [&_em]:text-gray-800
              [&_a]:text-green-600 [&_a]:font-semibold [&_a]:no-underline [&_a]:hover:text-green-700 [&_a]:hover:underline [&_a]:transition-colors
              [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-lg [&_img]:my-8 [&_img]:border [&_img]:border-gray-200
              [&_blockquote]:border-l-4 [&_blockquote]:border-green-600 [&_blockquote]:bg-green-50 [&_blockquote]:pl-6 [&_blockquote]:pr-4 [&_blockquote]:py-4 [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-gray-800 [&_blockquote]:rounded-r
              [&_code]:bg-gray-100 [&_code]:text-green-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:font-semibold
              [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre]:border [&_pre]:border-gray-700
              [&_hr]:my-8 [&_hr]:border-gray-300 [&_hr]:border-t
              [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse
              [&_th]:bg-gray-100 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-900 [&_th]:border [&_th]:border-gray-300
              [&_td]:px-4 [&_td]:py-2 [&_td]:border [&_td]:border-gray-200 [&_td]:text-gray-700"
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />
        </article>
      </div>
    </div>
    </>
  );
}
