"""
Модуль для синхронизации статей из Notion в GitHub Pages.
Читает все опубликованные статьи из Notion и генерирует статический сайт.
"""
import os
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv
import requests

load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")
NOTION_API_URL = "https://api.notion.com/v1"
GITHUB_REPO_PATH = os.getenv("GITHUB_REPO_PATH", ".")
SITE_URL = os.getenv("SITE_URL", "https://marfa77.github.io/bench-energy-news")

def fetch_notion_pages() -> List[Dict]:
    """
    Получает все опубликованные страницы из Notion базы данных.
    
    Returns:
        Список словарей с данными страниц
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ NOTION_API_KEY или NOTION_DATABASE_ID не установлены")
        return []
    
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    # Фильтр: только опубликованные статьи
    filter_payload = {
        "filter": {
            "property": "Published",
            "checkbox": {
                "equals": True
            }
        }
    }
    
    # Сортировка по дате создания (если Published Date отсутствует)
    # Используем created_time как fallback
    try:
        filter_payload["sorts"] = [
            {
                "property": "Published Date",
                "direction": "descending"
            }
        ]
    except:
        # Если Published Date отсутствует, сортируем по created_time
        filter_payload["sorts"] = [
            {
                "timestamp": "created_time",
                "direction": "descending"
            }
        ]
    
    all_pages = []
    start_cursor = None
    
    while True:
        payload = filter_payload.copy()
        if start_cursor:
            payload["start_cursor"] = start_cursor
        
        try:
            response = requests.post(
                f"{NOTION_API_URL}/databases/{NOTION_DATABASE_ID}/query",
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            all_pages.extend(data.get("results", []))
            
            if not data.get("has_more"):
                break
            
            start_cursor = data.get("next_cursor")
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка получения страниц из Notion: {e}")
            break
    
    print(f"✅ Получено {len(all_pages)} страниц из Notion")
    return all_pages

def extract_page_content(page: Dict) -> Dict:
    """
    Извлекает контент из страницы Notion.
    
    Args:
        page: Объект страницы из Notion API
        
    Returns:
        Словарь с данными статьи
    """
    properties = page.get("properties", {})
    
    # Извлекаем свойства (адаптировано под реальную структуру базы данных)
    # Основное поле - Name (title), дополнительное - Title (rich_text)
    title = ""
    if "Name" in properties and properties["Name"].get("title"):
        title = "".join([t.get("text", {}).get("content", "") for t in properties["Name"]["title"]])
    elif "Title" in properties and properties["Title"].get("rich_text"):
        title = "".join([t.get("text", {}).get("content", "") for t in properties["Title"]["rich_text"]])
    
    slug = ""
    if "Slug" in properties and properties["Slug"].get("rich_text"):
        slug = "".join([t.get("text", {}).get("content", "") for t in properties["Slug"]["rich_text"]])
    
    source_name = ""
    if "Source" in properties and properties["Source"].get("rich_text"):
        source_name = "".join([t.get("text", {}).get("content", "") for t in properties["Source"]["rich_text"]])
    
    source_url = ""
    if "Source URL" in properties and properties["Source URL"].get("url"):
        source_url = properties["Source URL"]["url"]
    
    category = "Coal"
    # Category - это rich_text, а не select
    if "Category" in properties and properties["Category"].get("rich_text"):
        category = "".join([t.get("text", {}).get("content", "") for t in properties["Category"]["rich_text"]]) or "Coal"
    elif "Category" in properties and properties["Category"].get("select"):
        category = properties["Category"]["select"].get("name", "Coal")
    
    seo_title = title
    if "SEO Title" in properties and properties["SEO Title"].get("rich_text"):
        seo_title = "".join([t.get("text", {}).get("content", "") for t in properties["SEO Title"]["rich_text"]])
    
    seo_description = ""
    if "SEO Description" in properties and properties["SEO Description"].get("rich_text"):
        seo_description = "".join([t.get("text", {}).get("content", "") for t in properties["SEO Description"]["rich_text"]])
    
    published_date = datetime.now()
    # Published Date может отсутствовать, используем текущую дату
    if "Published Date" in properties and properties["Published Date"].get("date"):
        date_str = properties["Published Date"]["date"]["start"]
        try:
            published_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except:
            pass
    
    # Получаем контент страницы (blocks)
    page_id = page.get("id")
    content_blocks = fetch_page_blocks(page_id)
    
    # Конвертируем blocks в HTML
    html_content = convert_blocks_to_html(content_blocks)
    
    return {
        "title": title,
        "slug": slug,
        "source_name": source_name,
        "source_url": source_url,
        "category": category,
        "seo_title": seo_title,
        "seo_description": seo_description,
        "published_date": published_date,
        "html_content": html_content,
        "notion_page_id": page_id
    }

def fetch_page_blocks(page_id: str) -> List[Dict]:
    """
    Получает все блоки страницы из Notion.
    
    Args:
        page_id: ID страницы в Notion
        
    Returns:
        Список блоков
    """
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
            print(f"❌ Ошибка получения блоков: {e}")
            break
    
    return all_blocks

def convert_blocks_to_html(blocks: List[Dict]) -> str:
    """
    Конвертирует Notion blocks в HTML.
    
    Args:
        blocks: Список блоков из Notion
        
    Returns:
        HTML строка
    """
    html_parts = []
    
    for block in blocks:
        block_type = block.get("type")
        
        if block_type == "heading_1":
            text = extract_rich_text(block.get("heading_1", {}).get("rich_text", []))
            html_parts.append(f"<h1>{text}</h1>")
        
        elif block_type == "heading_2":
            text = extract_rich_text(block.get("heading_2", {}).get("rich_text", []))
            html_parts.append(f"<h2>{text}</h2>")
        
        elif block_type == "heading_3":
            text = extract_rich_text(block.get("heading_3", {}).get("rich_text", []))
            html_parts.append(f"<h3>{text}</h3>")
        
        elif block_type == "paragraph":
            text = extract_rich_text(block.get("paragraph", {}).get("rich_text", []))
            html_parts.append(f"<p>{text}</p>")
        
        elif block_type == "bulleted_list_item":
            text = extract_rich_text(block.get("bulleted_list_item", {}).get("rich_text", []))
            html_parts.append(f"<li>{text}</li>")
        
        elif block_type == "numbered_list_item":
            text = extract_rich_text(block.get("numbered_list_item", {}).get("rich_text", []))
            html_parts.append(f"<li>{text}</li>")
        
        elif block_type == "image":
            image_data = block.get("image", {})
            if image_data.get("type") == "external":
                url = image_data.get("external", {}).get("url", "")
                html_parts.append(f'<img src="{url}" alt="" />')
            elif image_data.get("type") == "file":
                url = image_data.get("file", {}).get("url", "")
                html_parts.append(f'<img src="{url}" alt="" />')
        
        elif block_type == "divider":
            html_parts.append("<hr />")
        
        elif block_type == "callout":
            text = extract_rich_text(block.get("callout", {}).get("rich_text", []))
            html_parts.append(f'<div class="callout">{text}</div>')
    
    return "\n".join(html_parts)

def extract_rich_text(rich_text: List[Dict]) -> str:
    """
    Извлекает текст из rich_text массива Notion.
    
    Args:
        rich_text: Массив rich_text объектов
        
    Returns:
        HTML строка с текстом
    """
    html_parts = []
    
    for item in rich_text:
        text = item.get("text", {}).get("content", "")
        annotations = item.get("annotations", {})
        link = item.get("text", {}).get("link")
        
        # Применяем форматирование
        if annotations.get("bold"):
            text = f"<strong>{text}</strong>"
        if annotations.get("italic"):
            text = f"<em>{text}</em>"
        if annotations.get("code"):
            text = f"<code>{text}</code>"
        if link:
            text = f'<a href="{link.get("url", "")}">{text}</a>'
        
        html_parts.append(text)
    
    return "".join(html_parts)

def sync_notion_to_github():
    """
    Синхронизирует все статьи из Notion в GitHub Pages.
    Генерирует HTML файлы, обновляет sitemap и index.html.
    """
    print("=" * 80)
    print("🔄 СИНХРОНИЗАЦИЯ NOTION → GITHUB PAGES")
    print("=" * 80)
    
    # Получаем все страницы из Notion
    pages = fetch_notion_pages()
    
    if not pages:
        print("⚠️  Нет опубликованных статей в Notion")
        return
    
    repo_path = Path(GITHUB_REPO_PATH).expanduser().resolve()
    posts_dir = repo_path / "posts"
    posts_dir.mkdir(exist_ok=True)
    
    # Импортируем функции из web_publisher для генерации HTML
    from web_publisher import create_html_article, create_schema_org_markup
    
    articles_data = []
    
    for page in pages:
        try:
            article_data = extract_page_content(page)
            
            # Создаем HTML статью
            news_data = {
                "title": article_data["title"],
                "summary": article_data["seo_description"] or article_data["title"],
                "source_url": article_data["source_url"],
                "source_name": article_data["source_name"],
                "category": article_data["category"]
            }
            
            html_content, article_url, slug = create_html_article(
                news_data,
                article_data["html_content"],
                None  # image_url - можно добавить позже
            )
            
            # Сохраняем HTML файл
            html_file = posts_dir / f"{slug}.html"
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            articles_data.append({
                "slug": slug,
                "url": article_url,
                "title": article_data["title"],
                "date": article_data["published_date"]
            })
            
            print(f"✅ Синхронизировано: {article_data['title'][:50]}...")
            
        except Exception as e:
            print(f"❌ Ошибка обработки страницы: {e}")
            import traceback
            traceback.print_exc()
    
    # Обновляем sitemap
    update_sitemap_from_articles(articles_data, repo_path)
    
    # Обновляем index.html
    update_index_from_articles(articles_data, repo_path)
    
    # Обновляем RSS feed
    update_rss_from_articles(articles_data, repo_path)
    
    print("=" * 80)
    print(f"✅ Синхронизация завершена: {len(articles_data)} статей")
    print("=" * 80)

def update_sitemap_from_articles(articles: List[Dict], repo_path: Path):
    """Обновляет sitemap.xml на основе статей."""
    sitemap_path = repo_path / "sitemap.xml"
    
    sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{}</loc>
    <lastmod>{}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
""".format(SITE_URL, datetime.now().strftime("%Y-%m-%d"))
    
    for article in articles:
        lastmod = article["date"].strftime("%Y-%m-%d")
        sitemap_content += f"""  <url>
    <loc>{article["url"]}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
"""
    
    sitemap_content += "</urlset>"
    
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    
    print(f"✅ Sitemap обновлен: {len(articles)} статей")

def update_index_from_articles(articles: List[Dict], repo_path: Path):
    """Обновляет index.html на основе статей."""
    # Используем существующий скрипт update_index.py
    update_script = repo_path / "update_index.py"
    if update_script.exists():
        subprocess.run(
            ["python3", str(update_script)],
            cwd=str(repo_path),
            timeout=30
        )

def update_rss_from_articles(articles: List[Dict], repo_path: Path):
    """Обновляет RSS feed на основе статей."""
    rss_script = repo_path / "generate_rss.py"
    if rss_script.exists():
        subprocess.run(
            ["python3", str(rss_script)],
            cwd=str(repo_path),
            timeout=30
        )

if __name__ == "__main__":
    try:
        sync_notion_to_github()
    except Exception as e:
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
