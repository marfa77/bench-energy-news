"""
Модуль для сохранения и загрузки состояния (опубликованные новости).
Поддерживает категоризацию для масштабирования на другие товары.
"""
import json
import os
from pathlib import Path
from typing import Set
from datetime import datetime


STATE_FILE = Path("output/state.json")


def ensure_output_dir():
    """Создает директорию output если её нет."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)


def get_state() -> dict:
    """
    Загружает все данные из файла состояния.
    
    Returns:
        Словарь с данными состояния
    """
    ensure_output_dir()
    
    if not STATE_FILE.exists():
        return {"published_urls": [], "published_news": []}
    
    try:
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Инициализируем структуру если её нет
            if "published_urls" not in data:
                data["published_urls"] = []
            if "published_news" not in data:
                data["published_news"] = []
            return data
    except (json.JSONDecodeError, KeyError, IOError) as e:
        print(f"Ошибка при чтении state.json: {e}. Используются значения по умолчанию")
        return {"published_urls": [], "published_news": []}


def get_published_urls() -> Set[str]:
    """
    Возвращает множество URL уже опубликованных новостей.
    
    Returns:
        Множество URL строк
    """
    state = get_state()
    return set(state.get("published_urls", []))


def is_published(url: str) -> bool:
    """
    Проверяет, была ли новость уже опубликована.
    
    Args:
        url: URL новости
        
    Returns:
        True если новость уже опубликована, False иначе
    """
    if not url:
        return False
    published = get_published_urls()
    return url in published


def mark_as_published(url: str):
    """
    Помечает новость как опубликованную (legacy метод для обратной совместимости).
    
    Args:
        url: URL новости
    """
    mark_as_published_with_category(url, "Unknown")


def mark_as_published_with_category(url: str, category: str = "Unknown"):
    """
    Помечает новость как опубликованную с категорией.
    
    Args:
        url: URL новости
        category: Категория новости (Coal, Energy, Logistics, Steel, Markets)
    """
    if not url:
        return
    
    ensure_output_dir()
    state = get_state()
    
    # Обновляем список URL (для обратной совместимости)
    published_urls = state.get("published_urls", [])
    if url not in published_urls:
        published_urls.append(url)
        state["published_urls"] = published_urls
    
    # Добавляем в структурированный список с категорией
    published_news = state.get("published_news", [])
    
    # Проверяем, не добавлена ли уже эта новость
    existing = next((item for item in published_news if item.get("url") == url), None)
    if not existing:
        published_news.append({
            "url": url,
            "category": category,
            "published_at": datetime.now().isoformat()
        })
        state["published_news"] = published_news
        
        try:
            with open(STATE_FILE, 'w', encoding='utf-8') as f:
                json.dump(state, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Ошибка при сохранении state.json: {e}")


def get_category_stats() -> dict:
    """
    Возвращает статистику по категориям опубликованных новостей.
    
    Returns:
        Словарь с количеством новостей по каждой категории
    """
    state = get_state()
    published_news = state.get("published_news", [])
    
    stats = {}
    for item in published_news:
        category = item.get("category", "Unknown")
        stats[category] = stats.get(category, 0) + 1
    
    return stats

