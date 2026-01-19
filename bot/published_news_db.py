"""
Модуль для работы с SQLite базой данных опубликованных новостей.
Хранит метаданные для всех платформ (Telegram, LinkedIn, Web).
"""
import sqlite3
import os
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime

DB_PATH = Path("output/published_news.db")


def ensure_db_dir():
    """Создает директорию для БД если её нет."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_connection():
    """Возвращает соединение с БД."""
    ensure_db_dir()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Инициализирует структуру БД."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS published_news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            news_url TEXT UNIQUE NOT NULL,
            category TEXT,
            tg_message_id TEXT,
            linkedin_post_id TEXT,
            web_article_url TEXT,
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Индексы для быстрого поиска
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_news_url ON published_news(news_url)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_category ON published_news(category)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_published_at ON published_news(published_at)
    """)
    
    conn.commit()
    conn.close()


def is_news_published(news_url: str) -> bool:
    """
    Проверяет, была ли новость уже опубликована.
    
    Args:
        news_url: URL новости
        
    Returns:
        True если опубликована, False иначе
    """
    if not news_url:
        return False
    
    init_database()  # Убеждаемся, что БД инициализирована
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM published_news WHERE news_url = ?", (news_url,))
    result = cursor.fetchone()
    
    conn.close()
    return result is not None


def save_publication(news_url: str, category: str = "Unknown", 
                     tg_message_id: Optional[str] = None,
                     linkedin_post_id: Optional[str] = None,
                     web_article_url: Optional[str] = None) -> bool:
    """
    Сохраняет информацию о публикации новости.
    
    Args:
        news_url: URL новости
        category: Категория новости
        tg_message_id: ID сообщения в Telegram
        linkedin_post_id: ID поста в LinkedIn
        web_article_url: URL статьи на веб-сайте
        
    Returns:
        True если успешно сохранено
    """
    if not news_url:
        return False
    
    init_database()
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO published_news 
            (news_url, category, tg_message_id, linkedin_post_id, web_article_url, published_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (news_url, category, tg_message_id, linkedin_post_id, web_article_url, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"❌ Ошибка сохранения в БД: {e}")
        conn.close()
        return False


def update_publication_platform(news_url: str, platform: str, platform_id: str) -> bool:
    """
    Обновляет информацию о публикации на конкретной платформе.
    
    Args:
        news_url: URL новости
        platform: Платформа ('telegram', 'linkedin', 'web')
        platform_id: ID поста/сообщения на платформе
        
    Returns:
        True если успешно обновлено
    """
    if not news_url or not platform or not platform_id:
        return False
    
    init_database()
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if platform == 'telegram':
            cursor.execute("UPDATE published_news SET tg_message_id = ? WHERE news_url = ?", 
                         (platform_id, news_url))
        elif platform == 'linkedin':
            cursor.execute("UPDATE published_news SET linkedin_post_id = ? WHERE news_url = ?", 
                         (platform_id, news_url))
        elif platform == 'web':
            cursor.execute("UPDATE published_news SET web_article_url = ? WHERE news_url = ?", 
                         (platform_id, news_url))
        else:
            conn.close()
            return False
        
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"❌ Ошибка обновления БД: {e}")
        conn.close()
        return False


def get_publication_stats() -> Dict:
    """
    Возвращает статистику публикаций.
    
    Returns:
        Словарь со статистикой
    """
    init_database()  # Убеждаемся, что БД инициализирована
    conn = get_connection()
    cursor = conn.cursor()
    
    stats = {}
    
    # Общее количество
    cursor.execute("SELECT COUNT(*) as total FROM published_news")
    stats['total'] = cursor.fetchone()['total']
    
    # По категориям
    cursor.execute("SELECT category, COUNT(*) as count FROM published_news GROUP BY category")
    stats['by_category'] = {row['category']: row['count'] for row in cursor.fetchall()}
    
    # По платформам
    cursor.execute("SELECT COUNT(*) as count FROM published_news WHERE tg_message_id IS NOT NULL")
    stats['telegram'] = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM published_news WHERE linkedin_post_id IS NOT NULL")
    stats['linkedin'] = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM published_news WHERE web_article_url IS NOT NULL")
    stats['web'] = cursor.fetchone()['count']
    
    conn.close()
    return stats

