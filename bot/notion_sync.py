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
SITE_URL = os.getenv("SITE_URL", "https://www.bench.energy")

def fetch_notion_pages(today_only: bool = True) -> List[Dict]:
    """
    Получает опубликованные страницы из Notion базы данных.
    
    Args:
        today_only: Если True, возвращает только новости за сегодня
    
    Returns:
        Список словарей с данными страниц
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ NOTION_API_KEY или NOTION_DATABASE_ID не установлены")
        print("   Установите секреты NOTION_API_KEY и NOTION_DATABASE_ID в GitHub Secrets")
        return []
    
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    # Фильтр: только опубликованные статьи
    filter_conditions = {
        "and": [
            {
                "property": "Published",
                "checkbox": {
                    "equals": True
                }
            }
        ]
    }
    
    # Не фильтруем по дате в запросе - получим все и отфильтруем в коде
    # Это более надежно, так как Notion хранит даты в UTC, а нужно учитывать локальный часовой пояс
    filter_payload = {
        "filter": filter_conditions
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
    
    # Если нужны только новости за сегодня, фильтруем по дате с учетом часового пояса
    if today_only:
        from datetime import timedelta
        today_local = datetime.now().date()
        filtered_pages = []
        
        for page in all_pages:
            properties = page.get("properties", {})
            if "Published Date" in properties and properties["Published Date"].get("date"):
                date_str = properties["Published Date"]["date"]["start"]
                try:
                    # Парсим дату из Notion (может быть с временем и часовым поясом)
                    if "T" in date_str:
                        # Дата с временем - парсим и конвертируем в локальное время
                        try:
                            page_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                        except:
                            page_date = datetime.fromisoformat(date_str)
                        # Если есть часовой пояс, конвертируем в локальное время
                        if page_date.tzinfo:
                            import time
                            from datetime import timezone
                            # Получаем локальный часовой пояс
                            local_offset = time.timezone if (time.daylight == 0) else time.altzone
                            local_tz = timezone(timedelta(seconds=-local_offset))
                            page_date_local = page_date.astimezone(local_tz)
                        else:
                            page_date_local = page_date
                    else:
                        # Только дата без времени
                        page_date_local = datetime.fromisoformat(date_str)
                    
                    # Проверяем, попадает ли дата в сегодняшний день
                    if page_date_local.date() == today_local:
                        filtered_pages.append(page)
                except Exception as e:
                    print(f"⚠️  Ошибка парсинга даты '{date_str}': {e}")
        
        print(f"✅ Получено {len(all_pages)} страниц из Notion, отфильтровано {len(filtered_pages)} за сегодня")
        return filtered_pages
    
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
    
    # Извлекаем дату публикации из Notion
    published_date = None
    if "Published Date" in properties and properties["Published Date"].get("date"):
        date_str = properties["Published Date"]["date"]["start"]
        try:
            # Парсим дату (может быть только дата или дата+время)
            if "T" in date_str:
                published_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            else:
                # Только дата без времени
                published_date = datetime.fromisoformat(date_str)
        except Exception as e:
            print(f"⚠️  Ошибка парсинга даты '{date_str}': {e}")
    
    # Если дата не найдена, используем created_time страницы
    if published_date is None:
        created_time = page.get("created_time")
        if created_time:
            try:
                published_date = datetime.fromisoformat(created_time.replace("Z", "+00:00"))
            except:
                pass
    
    # Если всё ещё нет даты, используем текущую (но это не должно происходить)
    if published_date is None:
        print(f"⚠️  Дата публикации не найдена для страницы, используется текущая дата")
        published_date = datetime.now()
    
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
    
    # Проверяем переменные окружения
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        error_msg = "❌ ОШИБКА: NOTION_API_KEY или NOTION_DATABASE_ID не установлены"
        print(error_msg)
        print(f"   NOTION_API_KEY: {'установлен' if NOTION_API_KEY else 'НЕ установлен'}")
        print(f"   NOTION_DATABASE_ID: {'установлен' if NOTION_DATABASE_ID else 'НЕ установлен'}")
        raise ValueError("NOTION_API_KEY или NOTION_DATABASE_ID не установлены")
    
    # Получаем все новости из Notion (для обновления дат)
    # ВАЖНО: Синхронизируем новости за последние 7 дней, чтобы не пропустить новости
    import sys
    full_sync = "--full" in sys.argv or os.getenv("FULL_SYNC", "false").lower() == "true"
    
    if full_sync:
        print("🔄 РЕЖИМ ПОЛНОЙ СИНХРОНИЗАЦИИ: обновление всех новостей из Notion")
        pages = fetch_notion_pages(today_only=False)
    else:
        # Синхронизируем новости за последние 30 дней для более полного охвата
        from datetime import timedelta
        today = datetime.now().date()
        days_ago = today - timedelta(days=30)
        print(f"📅 Фильтр: новости за последние 30 дней (с {days_ago} по {today})")
        all_pages = fetch_notion_pages(today_only=False)
        # Фильтруем по дате в коде
        pages = []
        for page in all_pages:
            properties = page.get("properties", {})
            if "Published Date" in properties and properties["Published Date"].get("date"):
                date_str = properties["Published Date"]["date"]["start"]
                try:
                    if "T" in date_str:
                        page_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    else:
                        page_date = datetime.fromisoformat(date_str)
                    if page_date.tzinfo:
                        import time
                        from datetime import timezone
                        local_offset = time.timezone if (time.daylight == 0) else time.altzone
                        local_tz = timezone(timedelta(seconds=-local_offset))
                        page_date_local = page_date.astimezone(local_tz)
                    else:
                        page_date_local = page_date
                    page_date_only = page_date_local.date()
                    # Включаем новости за последние 30 дней
                    if days_ago <= page_date_only <= today:
                        pages.append(page)
                    # Всегда включаем новости за сегодня (дополнительная проверка для надежности)
                    elif page_date_only == today:
                        pages.append(page)
                    # Также включаем новости за вчера, если они созданы поздно вечером (могут быть за сегодня)
                    elif page_date_only == (today - timedelta(days=1)) and page_date_local.hour >= 20:
                        pages.append(page)
                    # Включаем новости за завтра, если часовой пояс делает их сегодняшними (раннее утро)
                    elif page_date_only == (today + timedelta(days=1)) and page_date_local.hour < 12:
                        pages.append(page)
                    # Дополнительно: если дата в пределах 1 дня от сегодня, включаем (на случай проблем с часовым поясом)
                    elif abs((page_date_only - today).days) <= 1:
                        print(f"📅 Включаем новость с датой {page_date_only} (близко к сегодня {today})")
                        pages.append(page)
                except Exception as e:
                    print(f"⚠️  Ошибка парсинга даты '{date_str}': {e}")
                    # Если не удалось распарсить дату, включаем страницу (на случай старых новостей без даты)
                    pages.append(page)
            else:
                # Если нет Published Date, проверяем created_time
                created_time = page.get("created_time")
                if created_time:
                    try:
                        created_date = datetime.fromisoformat(created_time.replace("Z", "+00:00"))
                        if created_date.tzinfo:
                            import time
                            from datetime import timezone
                            local_offset = time.timezone if (time.daylight == 0) else time.altzone
                            local_tz = timezone(timedelta(seconds=-local_offset))
                            created_date_local = created_date.astimezone(local_tz)
                        else:
                            created_date_local = created_date
                        created_date_only = created_date_local.date()
                        # Включаем новости за последние 30 дней
                        if days_ago <= created_date_only <= today:
                            pages.append(page)
                        # Всегда включаем новости за сегодня
                        elif created_date_only == today:
                            pages.append(page)
                        # Включаем новости за вчера, если они созданы поздно вечером
                        elif created_date_only == (today - timedelta(days=1)) and created_date_local.hour >= 20:
                            pages.append(page)
                        # Включаем новости за завтра, если часовой пояс делает их сегодняшними
                        elif created_date_only == (today + timedelta(days=1)) and created_date_local.hour < 12:
                            pages.append(page)
                    except Exception as e:
                        print(f"⚠️  Ошибка парсинга created_time: {e}")
                        # Если не удалось распарсить created_time, включаем страницу
                        pages.append(page)
                else:
                    # Если нет ни Published Date, ни created_time, проверяем created_time напрямую
                    created_time = page.get("created_time")
                    if created_time:
                        try:
                            created_date = datetime.fromisoformat(created_time.replace("Z", "+00:00"))
                            if created_date.tzinfo:
                                import time
                                from datetime import timezone
                                local_offset = time.timezone if (time.daylight == 0) else time.altzone
                                local_tz = timezone(timedelta(seconds=-local_offset))
                                created_date_local = created_date.astimezone(local_tz)
                            else:
                                created_date_local = created_date
                            created_date_only = created_date_local.date()
                            # Включаем если создана сегодня или вчера (может быть новая)
                            if created_date_only >= (today - timedelta(days=1)):
                                pages.append(page)
                        except Exception as e:
                            print(f"⚠️  Ошибка парсинга created_time для страницы без Published Date: {e}")
                            # Если не удалось распарсить, не включаем (старая страница без даты)
                    # Если вообще нет даты, не включаем
    
    if not pages:
        if full_sync:
            print("⚠️  Нет опубликованных статей в Notion")
        else:
            print(f"⚠️  Нет опубликованных статей в Notion за {today}")
        return
    
    if full_sync:
        print(f"✅ Найдено {len(pages)} новостей в Notion (полная синхронизация)")
    else:
        print(f"✅ Найдено {len(pages)} новостей за сегодня")
    
    repo_path = Path(GITHUB_REPO_PATH).expanduser().resolve()
    print(f"📁 Репозиторий: {repo_path}")
    print(f"📁 GITHUB_REPO_PATH: {GITHUB_REPO_PATH}")
    
    posts_dir = repo_path / "posts"
    posts_dir.mkdir(exist_ok=True)
    print(f"📁 Posts директория: {posts_dir}")
    
    # Импортируем функции из web_publisher для генерации HTML
    try:
        from web_publisher import create_html_article, create_schema_org_markup
        print("✅ Импорт web_publisher успешен")
    except ImportError as e:
        print(f"❌ Ошибка импорта web_publisher: {e}")
        raise
    
    articles_data = []
    
    for page in pages:
        try:
            article_data = extract_page_content(page)
            print(f"📄 Обработка: {article_data.get('title', 'Unknown')[:50]}...")
            
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
                None,  # image_url - можно добавить позже
                article_data["published_date"]  # Передаем дату публикации из Notion
            )
            
            # Сохраняем HTML файл
            html_file = posts_dir / f"{slug}.html"
            print(f"💾 Сохранение: {html_file}")
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
    print("🗺️  Обновление sitemap.xml...")
    update_sitemap_from_articles(articles_data, repo_path)
    
    # Обновляем index.html
    print("📄 Обновление index.html...")
    update_index_from_articles(articles_data, repo_path)
    
    # Обновляем RSS feed
    print("📡 Обновление RSS feed...")
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
    import sys
    from datetime import datetime
    
    print("=" * 80)
    print("🚀 ЗАПУСК СИНХРОНИЗАЦИИ NOTION → GITHUB PAGES")
    print("=" * 80)
    print(f"📅 Время запуска: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🐍 Python версия: {sys.version.split()[0]}")
    print(f"📁 Текущая директория: {os.getcwd()}")
    print(f"📁 GITHUB_REPO_PATH: {GITHUB_REPO_PATH}")
    print("=" * 80)
    print()
    
    try:
        sync_notion_to_github()
        print()
        print("=" * 80)
        print("✅ СИНХРОНИЗАЦИЯ УСПЕШНО ЗАВЕРШЕНА")
        print(f"📅 Время завершения: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
    except Exception as e:
        print()
        print("=" * 80)
        print(f"❌ КРИТИЧЕСКАЯ ОШИБКА: {e}")
        print("=" * 80)
        import traceback
        traceback.print_exc()
        print("=" * 80)
        exit(1)
