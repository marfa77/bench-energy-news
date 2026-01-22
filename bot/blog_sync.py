"""
Модуль для синхронизации блога из Notion.
Читает статьи из родительской страницы Notion и генерирует HTML файлы для блога.
"""
import os
import re
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
from html import escape, unescape
from dotenv import load_dotenv
import requests

load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_BLOG_PAGE_ID_RAW = os.getenv("NOTION_BLOG_PAGE_ID", "").strip()  # Убираем пробелы по краям
# Очищаем ID от пробелов и нормализуем формат
if NOTION_BLOG_PAGE_ID_RAW:
    # Убираем все пробелы
    cleaned_id = NOTION_BLOG_PAGE_ID_RAW.replace(" ", "").replace("\t", "").replace("\n", "")
    # UUID должен быть 32 символа (без дефисов) или 36 (с дефисами)
    if len(cleaned_id) == 32:
        # UUID без дефисов - добавляем дефисы
        NOTION_BLOG_PAGE_ID = f"{cleaned_id[:8]}-{cleaned_id[8:12]}-{cleaned_id[12:16]}-{cleaned_id[16:20]}-{cleaned_id[20:]}"
    elif len(cleaned_id) == 36 and cleaned_id.count("-") == 4:
        # UUID с дефисами - используем как есть
        NOTION_BLOG_PAGE_ID = cleaned_id
    else:
        NOTION_BLOG_PAGE_ID = None
        print(f"⚠️  NOTION_BLOG_PAGE_ID имеет неверный формат (ожидается UUID): длина={len(cleaned_id)}")
        if len(cleaned_id) > 0:
            print(f"   Первые символы: {cleaned_id[:20]}...")
else:
    NOTION_BLOG_PAGE_ID = None
NOTION_API_URL = "https://api.notion.com/v1"
GITHUB_REPO_PATH = os.getenv("GITHUB_REPO_PATH", ".")
SITE_URL = os.getenv("SITE_URL", "https://www.bench.energy")

def fetch_blog_pages() -> List[Dict]:
    """
    Получает все дочерние страницы из родительской страницы блога в Notion.
    
    Returns:
        Список словарей с данными страниц блога
    """
    if not NOTION_API_KEY:
        print("❌ NOTION_API_KEY не установлен")
        print("   Установите секрет NOTION_API_KEY в GitHub Secrets")
        return []
    
    if not NOTION_BLOG_PAGE_ID:
        print("❌ NOTION_BLOG_PAGE_ID не установлен или имеет неверный формат")
        print("   Установите секрет NOTION_BLOG_PAGE_ID в GitHub Secrets")
        print("   Формат: UUID (например, 2f05f382-1e21-8e99-cdef-21e05a7a624)")
        return []
    
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    # Получаем дочерние страницы родительской страницы блога
    all_pages = []
    start_cursor = None
    
    while True:
        url = f"{NOTION_API_URL}/blocks/{NOTION_BLOG_PAGE_ID}/children"
        if start_cursor:
            url += f"?start_cursor={start_cursor}"
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Фильтруем только страницы (type == "child_page")
            pages = [block for block in data.get("results", []) if block.get("type") == "child_page"]
            all_pages.extend(pages)
            
            if not data.get("has_more"):
                break
            
            start_cursor = data.get("next_cursor")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка получения страниц блога из Notion: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Response: {e.response.text}")
            break
    
    print(f"✅ Получено {len(all_pages)} страниц блога из Notion")
    return all_pages

def fetch_page_details(page_id: str) -> Optional[Dict]:
    """
    Получает детальную информацию о странице.
    
    Args:
        page_id: ID страницы в Notion
        
    Returns:
        Словарь с данными страницы или None
    """
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    try:
        response = requests.get(
            f"{NOTION_API_URL}/pages/{page_id}",
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка получения деталей страницы {page_id}: {e}")
        return None

def extract_page_title(page: Dict) -> str:
    """Извлекает заголовок страницы из Notion page."""
    title = "Untitled"
    
    # Пробуем получить из properties
    properties = page.get("properties", {})
    if "title" in properties:
        title_prop = properties["title"]
        if title_prop.get("type") == "title":
            title_rich_text = title_prop.get("title", [])
            if title_rich_text:
                title = "".join([rt.get("plain_text", "") for rt in title_rich_text])
    
    # Fallback: пробуем получить из child_page
    if title == "Untitled" and "child_page" in page:
        child_page = page["child_page"]
        title = child_page.get("title", "Untitled")
    
    return title.strip() or "Untitled"

def create_slug(title: str) -> str:
    """Создает URL-friendly slug из заголовка."""
    # Убираем HTML теги
    title = re.sub(r'<[^>]+>', '', title)
    # Заменяем пробелы на дефисы, убираем спецсимволы
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    # Ограничиваем длину
    if len(slug) > 80:
        slug = slug[:80].rstrip('-')
    return slug

def fetch_page_blocks(page_id: str) -> List[Dict]:
    """Получает все блоки страницы из Notion."""
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    all_blocks = []
    start_cursor = None
    
    while True:
        url = f"{NOTION_API_URL}/blocks/{page_id}/children"
        if start_cursor:
            url += f"?start_cursor={start_cursor}"
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            all_blocks.extend(data.get("results", []))
            
            if not data.get("has_more"):
                break
            
            start_cursor = data.get("next_cursor")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка получения блоков страницы {page_id}: {e}")
            break
    
    return all_blocks

def convert_blocks_to_html(blocks: List[Dict]) -> str:
    """Конвертирует Notion blocks в HTML."""
    html_parts = []
    
    for block in blocks:
        block_type = block.get("type")
        if not block_type:
            continue
        
        block_data = block.get(block_type, {})
        
        # Получаем текст из rich_text
        def get_text(rich_text_array):
            if not rich_text_array:
                return ""
            text_parts = []
            for rt in rich_text_array:
                text = rt.get("plain_text", "")
                annotations = rt.get("annotations", {})
                
                # Применяем форматирование
                if annotations.get("bold"):
                    text = f"<strong>{text}</strong>"
                if annotations.get("italic"):
                    text = f"<em>{text}</em>"
                if annotations.get("code"):
                    text = f"<code>{text}</code>"
                
                # Ссылки
                if rt.get("href"):
                    text = f'<a href="{rt["href"]}">{text}</a>'
                
                text_parts.append(text)
            return "".join(text_parts)
        
        if block_type == "paragraph":
            text = get_text(block_data.get("rich_text", []))
            if text:
                html_parts.append(f"<p>{text}</p>")
        
        elif block_type == "heading_1":
            text = get_text(block_data.get("rich_text", []))
            if text:
                html_parts.append(f"<h1>{text}</h1>")
        
        elif block_type == "heading_2":
            text = get_text(block_data.get("rich_text", []))
            if text:
                html_parts.append(f"<h2>{text}</h2>")
        
        elif block_type == "heading_3":
            text = get_text(block_data.get("rich_text", []))
            if text:
                html_parts.append(f"<h3>{text}</h3>")
        
        elif block_type == "bulleted_list_item":
            text = get_text(block_data.get("rich_text", []))
            if text:
                html_parts.append(f"<li>{text}</li>")
        
        elif block_type == "numbered_list_item":
            text = get_text(block_data.get("rich_text", []))
            if text:
                html_parts.append(f"<li>{text}</li>")
        
        elif block_type == "quote":
            text = get_text(block_data.get("rich_text", []))
            if text:
                html_parts.append(f"<blockquote>{text}</blockquote>")
        
        elif block_type == "code":
            text = get_text(block_data.get("rich_text", []))
            language = block_data.get("language", "")
            if text:
                html_parts.append(f'<pre><code class="language-{language}">{escape(text)}</code></pre>')
        
        elif block_type == "divider":
            html_parts.append("<hr />")
        
        elif block_type == "image":
            image_data = block_data.get("file") or block_data.get("external")
            if image_data:
                image_url = image_data.get("url", "")
                caption = get_text(block_data.get("caption", []))
                html_parts.append(f'<img src="{image_url}" alt="{escape(caption)}" />')
                if caption:
                    html_parts.append(f"<p><em>{caption}</em></p>")
    
    # Обертываем списки
    html = "".join(html_parts)
    html = re.sub(r'(<li>.*?</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)
    html = re.sub(r'</ul>\s*<ul>', '', html)  # Убираем дублирующиеся <ul>
    
    return html

def generate_blog_html(article: Dict, repo_path: Path) -> Optional[str]:
    """Генерирует HTML файл для статьи блога."""
    title = article.get("title", "Untitled")
    slug = article.get("slug", "untitled")
    content = article.get("html_content", "")
    published_date = article.get("published_date", datetime.now().isoformat())
    notion_url = article.get("notion_url", "")
    
    # Парсим дату
    try:
        if "T" in published_date:
            date_obj = datetime.fromisoformat(published_date.replace("Z", "+00:00"))
        else:
            date_obj = datetime.fromisoformat(published_date)
        formatted_date = date_obj.strftime("%Y-%m-%d")
        iso_date = date_obj.isoformat()
    except:
        formatted_date = datetime.now().strftime("%Y-%m-%d")
        iso_date = datetime.now().isoformat()
    
    # Создаем директорию для блога
    blog_dir = repo_path / "blog"
    blog_dir.mkdir(exist_ok=True)
    
    # Генерируем HTML
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title)} | Bench Energy Blog</title>
    <meta name="description" content="{escape(title)} - Bench Energy Blog">
    <meta name="author" content="Bench Energy">
    <link rel="canonical" href="{SITE_URL}/blog/{slug}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{SITE_URL}/blog/{slug}">
    <meta property="og:title" content="{escape(title)}">
    <meta property="og:description" content="{escape(title)} - Bench Energy Blog">
    <meta property="article:published_time" content="{iso_date}">
    
    <!-- Schema.org -->
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "{escape(title)}",
        "datePublished": "{iso_date}",
        "author": {{
            "@type": "Organization",
            "name": "Bench Energy"
        }},
        "publisher": {{
            "@type": "Organization",
            "name": "Bench Energy",
            "logo": {{
                "@type": "ImageObject",
                "url": "{SITE_URL}/logo.png"
            }}
        }}
    }}
    </script>
    
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        h1 {{
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }}
        .meta {{
            color: #666;
            font-size: 0.9em;
            margin-bottom: 2rem;
        }}
        article {{
            margin-top: 2rem;
        }}
        article p {{
            margin-bottom: 1rem;
        }}
        article h2 {{
            margin-top: 2rem;
            margin-bottom: 1rem;
        }}
        article img {{
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 2rem 0;
        }}
        .back-link {{
            display: inline-block;
            margin-bottom: 2rem;
            color: #0066cc;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <a href="/blog" class="back-link">← Back to Blog</a>
    
    <article>
        <h1>{escape(title)}</h1>
        <div class="meta">
            Published: {formatted_date} | Bench Energy
        </div>
        
        <div class="content">
            {content}
        </div>
    </article>
    
    {f'<p style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e0e0e0;"><a href="{notion_url}" target="_blank" rel="noopener">View in Notion</a></p>' if notion_url else ''}
</body>
</html>"""
    
    # Сохраняем файл
    html_file = blog_dir / f"{slug}.html"
    try:
        html_file.write_text(html_content, encoding="utf-8")
        print(f"   ✅ Создан: blog/{slug}.html")
        return str(html_file.relative_to(repo_path))
    except Exception as e:
        print(f"   ❌ Ошибка создания файла: {e}")
        return None

def sync_blog():
    """Основная функция синхронизации блога."""
    print("🔄 СИНХРОНИЗАЦИЯ БЛОГА ИЗ NOTION")
    print("=" * 80)
    
    if not NOTION_API_KEY:
        print("❌ NOTION_API_KEY не установлен")
        print("   Установите секрет NOTION_API_KEY в GitHub Secrets")
        return
    
    if not NOTION_BLOG_PAGE_ID:
        print("❌ NOTION_BLOG_PAGE_ID не установлен или имеет неверный формат")
        print("   Установите секрет NOTION_BLOG_PAGE_ID в GitHub Secrets")
        print("   Формат: UUID (например, 2f05f382-1e21-8e99-cdef-21e05a7a624)")
        return
    
    repo_path = Path(GITHUB_REPO_PATH).expanduser().resolve()
    blog_dir = repo_path / "blog"
    blog_dir.mkdir(exist_ok=True)
    
    # Получаем страницы блога
    blog_pages = fetch_blog_pages()
    
    if not blog_pages:
        print("⚠️  Не найдено страниц блога")
        return
    
    articles = []
    
    for page in blog_pages:
        page_id = page.get("id")
        if not page_id:
            continue
        
        print(f"\n📄 Обработка страницы: {page_id[:8]}...")
        
        # Получаем детали страницы
        page_details = fetch_page_details(page_id)
        if not page_details:
            continue
        
        # Извлекаем заголовок
        title = extract_page_title(page_details)
        slug = create_slug(title)
        
        # Получаем контент
        blocks = fetch_page_blocks(page_id)
        html_content = convert_blocks_to_html(blocks)
        
        # Получаем дату публикации
        created_time = page_details.get("created_time", datetime.now().isoformat())
        
        # Получаем URL страницы в Notion
        notion_url = page_details.get("url", "")
        if notion_url and not notion_url.startswith("http"):
            notion_url = f"https://www.notion.so/{notion_url}"
        
        article = {
            "title": title,
            "slug": slug,
            "html_content": html_content,
            "published_date": created_time,
            "notion_url": notion_url,
            "notion_page_id": page_id
        }
        
        articles.append(article)
        
        # Генерируем HTML
        generate_blog_html(article, repo_path)
    
    print(f"\n✅ Синхронизировано {len(articles)} статей блога")
    
    # Создаем индексный файл блога
    create_blog_index(articles, repo_path)
    
    print("\n🎉 Синхронизация блога завершена!")

def create_blog_index(articles: List[Dict], repo_path: Path):
    """Создает индексный файл со списком всех статей блога."""
    blog_dir = repo_path / "blog"
    
    articles_html = ""
    for article in sorted(articles, key=lambda x: x.get("published_date", ""), reverse=True):
        title = article.get("title", "Untitled")
        slug = article.get("slug", "untitled")
        date = article.get("published_date", "")
        
        try:
            if "T" in date:
                date_obj = datetime.fromisoformat(date.replace("Z", "+00:00"))
            else:
                date_obj = datetime.fromisoformat(date)
            formatted_date = date_obj.strftime("%B %d, %Y")
        except:
            formatted_date = "Unknown date"
        
        articles_html += f"""
        <article style="margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #e0e0e0;">
            <h2><a href="/blog/{slug}" style="color: #1a1a1a; text-decoration: none;">{escape(title)}</a></h2>
            <p style="color: #666; font-size: 0.9em;">{formatted_date}</p>
            <p><a href="/blog/{slug}" style="color: #0066cc;">Read more →</a></p>
        </article>
        """
    
    index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bench Energy Blog</title>
    <meta name="description" content="Bench Energy Blog - Articles about coal markets, freight, and energy industry">
    <link rel="canonical" href="{SITE_URL}/blog">
    
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        h1 {{
            font-size: 3rem;
            margin-bottom: 1rem;
        }}
        .back-link {{
            display: inline-block;
            margin-bottom: 2rem;
            color: #0066cc;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <a href="/" class="back-link">← Back to Home</a>
    
    <h1>Bench Energy Blog</h1>
    <p style="font-size: 1.2em; color: #666; margin-bottom: 3rem;">
        Articles about coal markets, freight, and energy industry insights.
    </p>
    
    {articles_html}
</body>
</html>"""
    
    index_file = blog_dir / "index.html"
    index_file.write_text(index_html, encoding="utf-8")
    print(f"   ✅ Создан индекс блога: blog/index.html")

if __name__ == "__main__":
    sync_blog()
