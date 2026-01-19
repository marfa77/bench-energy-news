#!/usr/bin/env python3
"""
Скрипт для миграции существующих новостей с сайта в Notion базу данных.
Читает все HTML файлы из posts/ и создает страницы в Notion.
"""
import os
import re
from pathlib import Path
from datetime import datetime
from html import unescape
from dotenv import load_dotenv
from typing import Dict, Optional
import requests
import time

load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")
NOTION_API_URL = "https://api.notion.com/v1"
SITE_URL = os.getenv("SITE_URL", "https://marfa77.github.io/bench-energy-news")

def extract_article_data(html_file_path: Path) -> Optional[Dict]:
    """
    Извлекает данные статьи из HTML файла.
    
    Args:
        html_file_path: Путь к HTML файлу
        
    Returns:
        Словарь с данными статьи или None при ошибке
    """
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Извлекаем заголовок
        title_match = re.search(r'<title>(.*?)</title>', content, re.DOTALL)
        if title_match:
            title = unescape(title_match.group(1).strip())
            title = re.sub(r'\s*\|\s*Bench Energy\s*$', '', title, flags=re.IGNORECASE)
        else:
            title = html_file_path.stem.replace('-', ' ').title()
        
        # Извлекаем описание
        desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
        description = ""
        if desc_match:
            description = unescape(desc_match.group(1).strip())
        else:
            # Fallback: первый параграф из контента
            content_match = re.search(r'<div class="content">(.*?)</div>', content, re.DOTALL)
            if content_match:
                p_match = re.search(r'<p[^>]*>(.*?)</p>', content_match.group(1), re.DOTALL)
                if p_match:
                    description = re.sub(r'<[^>]+>', '', unescape(p_match.group(1).strip()))[:200]
        
        # Извлекаем дату публикации
        date_match = re.search(r'<meta property="article:published_time" content="([^"]+)"', content)
        published_date = datetime.now()
        if date_match:
            try:
                date_str = date_match.group(1)
                published_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            except:
                pass
        
        # Извлекаем источник
        source_match = re.search(r'<strong>Source:</strong>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)</a>', content)
        source_url = ""
        source_name = "Unknown"
        if source_match:
            source_url = source_match.group(1)
            source_name = unescape(source_match.group(2).strip())
        
        # Извлекаем категорию
        category_match = re.search(r'<meta property="article:section" content="([^"]+)"', content)
        category = "Coal"
        if category_match:
            category = category_match.group(1)
        else:
            # Пробуем извлечь из badge
            badge_match = re.search(r'<span class="category-badge">([^<]+)</span>', content)
            if badge_match:
                category = badge_match.group(1).strip()
        
        # Извлекаем основной контент (web version)
        content_match = re.search(r'<div class="content">(.*?)</div>', content, re.DOTALL)
        web_content = ""
        if content_match:
            web_content = content_match.group(1).strip()
            # Очищаем от лишних тегов, но сохраняем структуру
            web_content = re.sub(r'<script[^>]*>.*?</script>', '', web_content, flags=re.DOTALL | re.IGNORECASE)
        
        # Извлекаем изображение
        image_match = re.search(r'<img[^>]*src="([^"]+)"[^>]*alt="[^"]*"[^>]*>', content)
        image_url = None
        if image_match:
            image_url = image_match.group(1)
            if not image_url.startswith('http'):
                image_url = f"{SITE_URL}/{image_url.lstrip('/')}"
        
        # Создаем slug
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')[:80]
        
        return {
            "title": title,
            "description": description,
            "published_date": published_date,
            "source_url": source_url,
            "source_name": source_name,
            "category": category,
            "web_content": web_content,
            "image_url": image_url,
            "slug": slug,
            "filename": html_file_path.name
        }
        
    except Exception as e:
        print(f"❌ Ошибка чтения {html_file_path.name}: {e}")
        return None

def create_notion_page_from_article(article_data: Dict) -> Optional[str]:
    """
    Создает страницу в Notion из данных статьи.
    
    Args:
        article_data: Словарь с данными статьи
        
    Returns:
        ID созданной страницы или None при ошибке
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ NOTION_API_KEY или NOTION_DATABASE_ID не установлены")
        return None
    
    title = article_data.get("title", "")
    description = article_data.get("description", "")
    source_url = article_data.get("source_url", "")
    source_name = article_data.get("source_name", "Unknown")
    category = article_data.get("category", "Coal")
    slug = article_data.get("slug", "")
    web_content = article_data.get("web_content", "")
    image_url = article_data.get("image_url")
    published_date = article_data.get("published_date", datetime.now())
    
    # Формируем блоки контента
    blocks = []
    
    # AI Summary
    if description:
        blocks.append({
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [{"type": "text", "text": {"content": f"AI Summary: {description}"}}],
                "icon": {"emoji": "🤖"}
            }
        })
    
    # Изображение
    if image_url:
        blocks.append({
            "object": "block",
            "type": "image",
            "image": {
                "type": "external",
                "external": {"url": image_url}
            }
        })
    
    # Разделитель
    blocks.append({
        "object": "block",
        "type": "divider",
        "divider": {}
    })
    
    # Web контент
    if web_content:
        # Парсим HTML и конвертируем в простые блоки
        # Упрощенная версия - просто добавляем как параграфы
        paragraphs = re.split(r'</p>|<p[^>]*>', web_content)
        for para in paragraphs:
            para = re.sub(r'<[^>]+>', '', para).strip()
            if para and len(para) > 10:
                # Разбиваем длинные параграфы
                if len(para) > 2000:
                    for chunk in [para[i:i+2000] for i in range(0, len(para), 2000)]:
                        blocks.append({
                            "object": "block",
                            "type": "paragraph",
                            "paragraph": {
                                "rich_text": [{"type": "text", "text": {"content": chunk}}]
                            }
                        })
                else:
                    blocks.append({
                        "object": "block",
                        "type": "paragraph",
                        "paragraph": {
                            "rich_text": [{"type": "text", "text": {"content": para}}]
                        }
                    })
    
    # Источник
    if source_url:
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [
                    {"type": "text", "text": {"content": "Source: "}},
                    {"type": "text", "text": {"content": source_name, "link": {"url": source_url}}}
                ]
            }
        })
    
    # Формируем payload
    payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Name": {
                "title": [{"type": "text", "text": {"content": title}}]
            },
            "Title": {
                "rich_text": [{"type": "text", "text": {"content": title}}]
            },
            "Slug": {
                "rich_text": [{"type": "text", "text": {"content": slug}}]
            },
            "Category": {
                "rich_text": [{"type": "text", "text": {"content": category}}]
            },
            "Source": {
                "rich_text": [{"type": "text", "text": {"content": source_name}}]
            },
            "Source URL": {
                "url": source_url if source_url else None
            },
            "Published": {
                "checkbox": True
            },
            "SEO Title": {
                "rich_text": [{"type": "text", "text": {"content": f"{title} | Bench Energy"}}]
            },
            "SEO Description": {
                "rich_text": [{"type": "text", "text": {"content": description[:160]}}]
            }
        },
        "children": blocks
    }
    
    # Добавляем дату публикации из статьи
    # Если поле "Published Date" существует в базе, оно будет заполнено
    try:
        published_date = article_data.get("published_date", datetime.now())
        payload["properties"]["Published Date"] = {
            "date": {"start": published_date.isoformat()}
        }
    except:
        pass  # Если поле не существует в базе, просто пропускаем
    
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    try:
        response = requests.post(
            f"{NOTION_API_URL}/pages",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            page_data = response.json()
            page_id = page_data.get("id")
            return page_id
        else:
            print(f"   ❌ Ошибка {response.status_code}: {response.text[:200]}")
            return None
            
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
        return None

def check_if_exists_in_notion(slug: str) -> bool:
    """
    Проверяет, существует ли статья с таким slug в Notion.
    
    Args:
        slug: Slug статьи
        
    Returns:
        True если существует, False иначе
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        return False
    
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    filter_payload = {
        "filter": {
            "property": "Slug",
            "rich_text": {
                "equals": slug
            }
        }
    }
    
    try:
        response = requests.post(
            f"{NOTION_API_URL}/databases/{NOTION_DATABASE_ID}/query",
            headers=headers,
            json=filter_payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return len(data.get("results", [])) > 0
        return False
    except:
        return False

def migrate_articles_to_notion(posts_dir: Path):
    """
    Мигрирует все статьи из posts/ в Notion.
    
    Args:
        posts_dir: Путь к директории с HTML файлами
    """
    print("=" * 80)
    print("🔄 МИГРАЦИЯ СТАТЕЙ В NOTION")
    print("=" * 80)
    print()
    
    if not posts_dir.exists():
        print(f"❌ Директория {posts_dir} не найдена")
        return
    
    # Получаем все HTML файлы
    html_files = list(posts_dir.glob("*.html"))
    print(f"📁 Найдено {len(html_files)} HTML файлов")
    print()
    
    if not html_files:
        print("⚠️  Нет файлов для миграции")
        return
    
    # Сортируем по дате модификации (старые сначала)
    html_files.sort(key=lambda f: f.stat().st_mtime)
    
    migrated = 0
    skipped = 0
    errors = 0
    
    for i, html_file in enumerate(html_files, 1):
        print(f"[{i}/{len(html_files)}] Обработка: {html_file.name}")
        
        # Извлекаем данные
        article_data = extract_article_data(html_file)
        if not article_data:
            print(f"   ⚠️  Пропущено (ошибка извлечения данных)")
            errors += 1
            continue
        
        # Проверяем, существует ли уже
        slug = article_data.get("slug", "")
        if check_if_exists_in_notion(slug):
            print(f"   ⏭️  Пропущено (уже существует в Notion)")
            skipped += 1
            continue
        
        # Создаем страницу в Notion
        page_id = create_notion_page_from_article(article_data)
        if page_id:
            print(f"   ✅ Создано в Notion: {page_id[:8]}...")
            migrated += 1
        else:
            print(f"   ❌ Ошибка создания")
            errors += 1
        
        # Небольшая задержка, чтобы не перегружать API
        time.sleep(0.5)
        print()
    
    print("=" * 80)
    print("📊 ИТОГИ МИГРАЦИИ")
    print("=" * 80)
    print(f"✅ Успешно мигрировано: {migrated}")
    print(f"⏭️  Пропущено (уже существует): {skipped}")
    print(f"❌ Ошибок: {errors}")
    print(f"📁 Всего файлов: {len(html_files)}")
    print("=" * 80)

if __name__ == "__main__":
    # Определяем путь к posts/
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    posts_dir = repo_root / "posts"
    
    migrate_articles_to_notion(posts_dir)
