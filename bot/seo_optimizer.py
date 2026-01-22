"""
Модуль для улучшенной SEO и LLM оптимизации статей.
Генерирует оптимизированный контент для поисковых систем и LLM.
"""
import os
import json
import requests
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

def generate_enhanced_schema_org(news_data: Dict, article_url: str, html_content: str) -> str:
    """
    Генерирует расширенную Schema.org разметку для SEO и LLM (2025-2026).
    Оптимизировано для Generative Engine Optimisation (GEO/AEO).
    
    Args:
        news_data: Словарь с данными новости
        article_url: URL статьи
        html_content: HTML контент статьи
        
    Returns:
        JSON-LD строка с расширенной разметкой
    """
    from datetime import datetime
    import os
    
    SITE_URL = os.getenv("SITE_URL", "https://www.bench.energy")
    
    # Извлекаем ключевые слова из контента
    keywords = extract_keywords(news_data, html_content)
    
    # Извлекаем Answer Capsule из контента (для LLM)
    answer_capsule = extract_answer_capsule(html_content)
    
    # Создаем расширенную Schema.org разметку для LLM
    schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": news_data.get("title", ""),
        "description": news_data.get("summary", "")[:200],
        "datePublished": datetime.now().isoformat(),
        "dateModified": datetime.now().isoformat(),
        "author": {
            "@type": "Organization",
            "name": "Bench Energy",
            "url": "https://t.me/benchenergy",
            "sameAs": [
                "https://t.me/benchenergy",
                article_url,
                f"{SITE_URL}"
            ],
            "description": "Bench Energy provides expert analysis on coal markets, freight, and energy industry. Follow @benchenergy on Telegram for daily market insights."
        },
        "publisher": {
            "@type": "Organization",
            "name": "Bench Energy",
            "url": f"{SITE_URL}",
            "logo": {
                "@type": "ImageObject",
                "url": f"{SITE_URL}/logo.png"
            },
            "sameAs": [
                "https://t.me/benchenergy",
                f"{SITE_URL}"
            ]
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": article_url
        },
        "articleSection": news_data.get("category", "Coal"),
        "keywords": ", ".join(keywords),
        "about": {
            "@type": "Thing",
            "name": "Coal Market",
            "description": "Global coal market news and analysis"
        },
        # FAQ для LLM оптимизации (критично для извлечения ответов)
        "mainEntity": {
            "@type": "FAQPage",
            "mainEntity": generate_faq_items(news_data, html_content)
        },
        # Answer Capsule для быстрого извлечения LLM
        "abstract": answer_capsule if answer_capsule else news_data.get("summary", "")[:200],
        # Breadcrumb для навигации
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": f"{SITE_URL}/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "News",
                    "item": f"{SITE_URL}/news"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": news_data.get("title", "")[:50],
                    "item": article_url
                }
            ]
        },
        # E-E-A-T signals для доверия LLM
        "credential": {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": "Expert Analysis",
            "recognizedBy": {
                "@type": "Organization",
                "name": "Bench Energy"
            }
        }
    }
    
    # Добавляем источник
    if news_data.get("source_url"):
        schema["sameAs"] = [news_data["source_url"]]
    
    return json.dumps(schema, indent=2, ensure_ascii=False)

def extract_answer_capsule(html_content: str) -> Optional[str]:
    """
    Извлекает Answer Capsule (40-80 слов) из HTML контента.
    Answer Capsule - это прямой ответ, который LLM может извлечь без контекста.
    
    Args:
        html_content: HTML контент статьи
        
    Returns:
        Answer Capsule текст или None
    """
    import re
    
    # Ищем div с классом answer-capsule
    pattern = r'<div[^>]*class="answer-capsule"[^>]*>(.*?)</div>'
    match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
    
    if match:
        capsule_html = match.group(1)
        # Убираем HTML теги
        capsule_text = re.sub(r'<[^>]+>', '', capsule_html).strip()
        # Ограничиваем до 80 слов
        words = capsule_text.split()
        if len(words) > 80:
            capsule_text = ' '.join(words[:80])
        return capsule_text
    
    # Fallback: ищем первый параграф после h1
    pattern = r'<h1[^>]*>.*?</h1>\s*<p[^>]*>(.*?)</p>'
    match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
    
    if match:
        first_para = re.sub(r'<[^>]+>', '', match.group(1)).strip()
        words = first_para.split()
        if 40 <= len(words) <= 80:
            return first_para
        elif len(words) > 80:
            return ' '.join(words[:80])
    
    return None

def extract_keywords(news_data: Dict, html_content: str) -> list:
    """
    Извлекает ключевые слова из новости для SEO.
    
    Args:
        news_data: Данные новости
        html_content: HTML контент
        
    Returns:
        Список ключевых слов
    """
    keywords = [
        "coal market",
        "energy news",
        "thermal coal",
        "coking coal",
        "freight",
        "shipping",
        "Bench Energy",
        "@benchenergy"
    ]
    
    # Добавляем категорию
    category = news_data.get("category", "Coal").lower()
    if category not in keywords:
        keywords.append(category)
    
    # Извлекаем географические упоминания
    geo_keywords = ["australia", "china", "india", "indonesia", "russia", "south africa"]
    content_lower = html_content.lower()
    for geo in geo_keywords:
        if geo in content_lower and geo not in keywords:
            keywords.append(geo)
    
    return keywords[:15]  # Ограничиваем до 15 ключевых слов

def generate_faq_items(news_data: Dict, html_content: str) -> list:
    """
    Генерирует FAQ элементы для LLM оптимизации (GEO/AEO).
    FAQPage schema критичен для извлечения ответов LLM.
    
    Args:
        news_data: Данные новости
        html_content: HTML контент
        
    Returns:
        Список FAQ элементов в формате Schema.org
    """
    faq_items = []
    
    title = news_data.get("title", "")
    summary = news_data.get("summary", "")
    
    # Основной вопрос: Что это за новость? (Query Fan-Out)
    faq_items.append({
        "@type": "Question",
        "name": f"What is this news about: {title}?",
        "acceptedAnswer": {
            "@type": "Answer",
            "text": summary[:500] if len(summary) > 100 else f"{summary}. This news affects global coal markets, including thermal and coking coal prices, supply chains, and regional dynamics in China, India, Australia, and Indonesia."
        }
    })
    
    # Вопрос о влиянии на рынок (с конкретными числами)
    market_impact = extract_market_impact(html_content)
    faq_items.append({
        "@type": "Question",
        "name": f"What is the market impact of {title}?",
        "acceptedAnswer": {
            "@type": "Answer",
            "text": market_impact
        }
    })
    
    # Вопрос о ценах (если упоминаются)
    price_info = extract_price_info(html_content)
    if price_info:
        faq_items.append({
            "@type": "Question",
            "name": f"What are the price implications of {title}?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": price_info
            }
        })
    
    # Вопрос о регионах (Query Fan-Out)
    regional_info = extract_regional_info(html_content, news_data)
    if regional_info:
        faq_items.append({
            "@type": "Question",
            "name": f"Which regions are affected by {title}?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": regional_info
            }
        })
    
    return faq_items

def extract_price_info(html_content: str) -> Optional[str]:
    """Извлекает информацию о ценах из контента."""
    import re
    
    # Ищем упоминания цен
    price_patterns = [
        r'\$(\d+(?:\.\d+)?)\s*(?:per\s+)?(?:tonne|ton|t|metric\s+ton)',
        r'(\d+(?:\.\d+)?)\s*USD\s*(?:per\s+)?(?:tonne|ton|t)',
        r'price[s]?\s+(?:of|at|reached|surged\s+to)\s+\$?(\d+(?:\.\d+)?)'
    ]
    
    prices = []
    for pattern in price_patterns:
        matches = re.findall(pattern, html_content, re.IGNORECASE)
        prices.extend(matches)
    
    if prices:
        return f"Coal prices mentioned in this news range from ${prices[0]} to ${prices[-1]} per tonne. Price movements affect global markets including China, India, Australia, and Indonesia."
    
    return None

def extract_regional_info(html_content: str, news_data: Dict) -> Optional[str]:
    """Извлекает региональную информацию."""
    import re
    
    regions = ["China", "India", "Australia", "Indonesia", "Russia", "South Africa", "Colombia"]
    mentioned_regions = []
    
    content_lower = html_content.lower()
    for region in regions:
        if region.lower() in content_lower:
            mentioned_regions.append(region)
    
    if mentioned_regions:
        return f"This news affects {', '.join(mentioned_regions[:3])} and other major coal-producing and consuming regions. Regional dynamics impact global supply chains and pricing."
    
    return None

def extract_market_impact(html_content: str) -> str:
    """
    Извлекает информацию о влиянии на рынок из контента.
    
    Args:
        html_content: HTML контент
        
    Returns:
        Текст о влиянии на рынок
    """
    # Ищем секцию "Bench Energy Expert View" или "Market impact"
    import re
    
    # Паттерны для поиска информации о влиянии
    patterns = [
        r'<strong>Market impact:</strong>(.*?)</p>',
        r'<h3>Bench Energy Expert View</h3>(.*?)</div>',
        r'Price implications:(.*?)</li>'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
        if match:
            impact_text = re.sub(r'<[^>]+>', '', match.group(1))
            return impact_text.strip()[:500]
    
    return "This news may impact global coal markets, affecting prices, supply chains, and regional dynamics."

def generate_llm_optimized_meta(news_data: Dict) -> Dict[str, str]:
    """
    Генерирует мета-теги, оптимизированные для LLM поиска.
    
    Args:
        news_data: Данные новости
        
    Returns:
        Словарь с мета-тегами
    """
    title = news_data.get("title", "")
    summary = news_data.get("summary", "")
    
    # Генерируем оптимизированные мета-теги
    meta = {
        "title": f"{title} | Bench Energy - Coal Market News",
        "description": summary[:160],
        "keywords": ", ".join(extract_keywords(news_data, "")),
        "og:title": title,
        "og:description": summary[:200],
        "og:type": "article",
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": summary[:200],
        # LLM-специфичные мета-теги
        "article:author": "Bench Energy",
        "article:section": news_data.get("category", "Coal"),
        "article:tag": ", ".join(extract_keywords(news_data, "")[:5])
    }
    
    return meta

def enhance_html_for_llm(html_content: str, news_data: Dict) -> str:
    """
    Улучшает HTML контент для лучшей индексации LLM.
    
    Args:
        html_content: Исходный HTML
        news_data: Данные новости
        
    Returns:
        Улучшенный HTML
    """
    # Добавляем структурированные данные в контент
    enhanced = html_content
    
    # Добавляем микроразметку для ключевых фактов
    import re
    
    # Находим числа и цены, оборачиваем в <data> теги
    price_pattern = r'\$(\d+(?:\.\d+)?)\s*(?:/t|per ton|tonne)'
    enhanced = re.sub(
        price_pattern,
        r'<data value="\1" itemprop="price">$\1/t</data>',
        enhanced,
        flags=re.IGNORECASE
    )
    
    # Добавляем <time> теги для дат
    date_pattern = r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})'
    enhanced = re.sub(
        date_pattern,
        r'<time datetime="\1">\1</time>',
        enhanced,
        flags=re.IGNORECASE
    )
    
    return enhanced
