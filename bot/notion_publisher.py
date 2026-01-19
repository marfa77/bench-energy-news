"""
Модуль для публикации новостей в Notion.
Notion используется как единый источник правды (single source of truth).
"""
import os
import json
from typing import Dict, Optional
from datetime import datetime
from dotenv import load_dotenv
import requests

load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")  # ID базы данных для новостей
NOTION_API_URL = "https://api.notion.com/v1"

def create_notion_page(news_data: Dict, telegram_version: str, web_version: str, 
                       image_url: Optional[str] = None) -> Optional[str]:
    """
    Создает страницу в Notion с новостью.
    
    Args:
        news_data: Словарь с данными новости
        telegram_version: Версия для Telegram
        web_version: HTML версия для веба
        image_url: URL изображения (опционально)
        
    Returns:
        ID созданной страницы в Notion или None при ошибке
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ NOTION_API_KEY или NOTION_DATABASE_ID не установлены")
        return None
    
    title = news_data.get("title", "")
    summary = news_data.get("summary", "")
    source_url = news_data.get("source_url", "")
    source_name = news_data.get("source_name", "Unknown")
    category = news_data.get("category", "Coal")
    
    # Создаем slug для URL
    import re
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')[:80]
    
    # Формируем контент страницы в формате Notion Blocks
    blocks = []
    
    # Заголовок (H1)
    blocks.append({
        "object": "block",
        "type": "heading_1",
        "heading_1": {
            "rich_text": [{"type": "text", "text": {"content": title}}]
        }
    })
    
    # AI Summary
    if summary:
        blocks.append({
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [{"type": "text", "text": {"content": f"AI Summary: {summary[:500]}"}}],
                "icon": {"emoji": "🤖"}
            }
        })
    
    # Изображение (если есть)
    if image_url:
        blocks.append({
            "object": "block",
            "type": "image",
            "image": {
                "type": "external",
                "external": {"url": image_url}
            }
        })
    
    # Web версия (HTML контент)
    blocks.append({
        "object": "block",
        "type": "divider",
        "divider": {}
    })
    
    blocks.append({
        "object": "block",
        "type": "heading_2",
        "heading_2": {
            "rich_text": [{"type": "text", "text": {"content": "Web Version"}}]
        }
    })
    
    # Парсим HTML и конвертируем в Notion blocks
    # Извлекаем структурированный контент, включая экспертное мнение
    import re
    from html import unescape
    
    # Убираем HTML теги, но сохраняем структуру
    # Разбиваем на параграфы и заголовки
    html_clean = web_version
    
    # Извлекаем заголовки h2, h3
    h2_matches = list(re.finditer(r'<h2[^>]*>(.*?)</h2>', html_clean, re.DOTALL | re.IGNORECASE))
    h3_matches = list(re.finditer(r'<h3[^>]*>(.*?)</h3>', html_clean, re.DOTALL | re.IGNORECASE))
    
    # Извлекаем параграфы
    p_matches = list(re.finditer(r'<p[^>]*>(.*?)</p>', html_clean, re.DOTALL | re.IGNORECASE))
    
    # Извлекаем списки
    ul_matches = list(re.finditer(r'<ul[^>]*>(.*?)</ul>', html_clean, re.DOTALL | re.IGNORECASE))
    
    # Собираем все элементы в порядке появления
    all_elements = []
    for m in h2_matches:
        all_elements.append(('h2', m.start(), m.group(1)))
    for m in h3_matches:
        all_elements.append(('h3', m.start(), m.group(1)))
    for m in p_matches:
        all_elements.append(('p', m.start(), m.group(1)))
    for m in ul_matches:
        all_elements.append(('ul', m.start(), m.group(1)))
    
    # Сортируем по позиции в тексте
    all_elements.sort(key=lambda x: x[1])
    
    # Создаем блоки в правильном порядке
    for elem_type, pos, content in all_elements[:30]:  # Ограничиваем количество блоков
        content_clean = re.sub(r'<[^>]+>', '', unescape(content)).strip()
        if not content_clean or len(content_clean) < 3:
            continue
        
        if elem_type == 'h2':
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": content_clean[:2000]}}]
                }
            })
        elif elem_type == 'h3':
            blocks.append({
                "object": "block",
                "type": "heading_3",
                "heading_3": {
                    "rich_text": [{"type": "text", "text": {"content": content_clean[:2000]}}]
                }
            })
        elif elem_type == 'p':
            # Разбиваем длинные параграфы
            if len(content_clean) > 2000:
                for chunk in [content_clean[i:i+2000] for i in range(0, len(content_clean), 2000)]:
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
                        "rich_text": [{"type": "text", "text": {"content": content_clean}}]
                    }
                })
        elif elem_type == 'ul':
            # Извлекаем элементы списка
            li_matches = re.finditer(r'<li[^>]*>(.*?)</li>', content, re.DOTALL | re.IGNORECASE)
            for li in li_matches:
                li_content = re.sub(r'<[^>]+>', '', unescape(li.group(1))).strip()
                if li_content:
                    blocks.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"type": "text", "text": {"content": li_content[:2000]}}]
                        }
                    })
    
    # Telegram версия
    blocks.append({
        "object": "block",
        "type": "divider",
        "divider": {}
    })
    
    blocks.append({
        "object": "block",
        "type": "heading_2",
        "heading_2": {
            "rich_text": [{"type": "text", "text": {"content": "Telegram Version"}}]
        }
    })
    
    blocks.append({
        "object": "block",
        "type": "code",
        "code": {
            "rich_text": [{"type": "text", "text": {"content": telegram_version}}],
            "language": "plain text"
        }
    })
    
    # Источник
    if source_url:
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
    
    # Создаем страницу в базе данных
    # Адаптировано под реальную структуру базы данных
    payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Name": {  # Основное поле типа title
                "title": [{"type": "text", "text": {"content": title}}]
            },
            "Title": {  # Дополнительное поле типа rich_text
                "rich_text": [{"type": "text", "text": {"content": title}}]
            },
            "Slug": {
                "rich_text": [{"type": "text", "text": {"content": slug}}]
            },
            "Category": {  # Тип rich_text, а не select
                "rich_text": [{"type": "text", "text": {"content": category}}]
            },
            "Source": {
                "rich_text": [{"type": "text", "text": {"content": source_name}}]
            },
            "Source URL": {
                "url": source_url
            },
            "Published": {
                "checkbox": True
            },
            "SEO Title": {
                "rich_text": [{"type": "text", "text": {"content": f"{title} | Bench Energy"}}]
            },
            "SEO Description": {
                "rich_text": [{"type": "text", "text": {"content": summary[:160]}}]
            }
        },
        "children": blocks
    }
    
    # Добавляем дату публикации, если поле существует в базе
    # Проверяем наличие поля "Published Date" и добавляем его
    try:
        # Пытаемся добавить дату публикации
        payload["properties"]["Published Date"] = {
            "date": {"start": datetime.now().isoformat()}
        }
    except:
        pass  # Если поле не существует, просто пропускаем
    
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
        response.raise_for_status()
        page_data = response.json()
        page_id = page_data.get("id")
        
        print(f"✅ Новость опубликована в Notion: {page_id}")
        return page_id
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка публикации в Notion: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return None
