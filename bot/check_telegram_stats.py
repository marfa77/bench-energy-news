#!/usr/bin/env python3
"""
Скрипт для проверки статистики публикаций в Telegram.
Подсчитывает количество успешных публикаций и упоминаний сайта.
"""
import sqlite3
import sys
from pathlib import Path
from datetime import datetime

# Путь к базе данных
DB_PATH = Path("output/published_news.db")

def check_database():
    """Проверяет базу данных и выводит статистику."""
    if not DB_PATH.exists():
        print("❌ База данных не найдена:", DB_PATH.absolute())
        print("   База данных создается автоматически при первой публикации.")
        print("   Если бот запущен на сервере, проверьте путь на сервере.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Общее количество записей
    cursor.execute('SELECT COUNT(*) as total FROM published_news')
    total = cursor.fetchone()['total']
    
    # Количество опубликованных в Telegram
    cursor.execute('SELECT COUNT(*) as count FROM published_news WHERE tg_message_id IS NOT NULL')
    tg_count = cursor.fetchone()['count']
    
    # Детали по Telegram публикациям
    cursor.execute('''
        SELECT news_url, category, tg_message_id, published_at 
        FROM published_news 
        WHERE tg_message_id IS NOT NULL 
        ORDER BY published_at DESC
    ''')
    tg_posts = cursor.fetchall()
    
    # Статистика по категориям
    cursor.execute('''
        SELECT category, COUNT(*) as count 
        FROM published_news 
        WHERE tg_message_id IS NOT NULL 
        GROUP BY category
        ORDER BY count DESC
    ''')
    by_category = cursor.fetchall()
    
    # Статистика по датам (последние 30 дней)
    cursor.execute('''
        SELECT DATE(published_at) as date, COUNT(*) as count 
        FROM published_news 
        WHERE tg_message_id IS NOT NULL 
        AND published_at >= datetime('now', '-30 days')
        GROUP BY DATE(published_at)
        ORDER BY date DESC
    ''')
    by_date = cursor.fetchall()
    
    print("=" * 70)
    print("📊 СТАТИСТИКА ПУБЛИКАЦИЙ В TELEGRAM")
    print("=" * 70)
    print()
    print(f"📈 Всего записей в БД: {total}")
    print(f"📱 Опубликовано в Telegram: {tg_count}")
    print()
    
    if by_category:
        print("=" * 70)
        print("📋 ПО КАТЕГОРИЯМ:")
        print("=" * 70)
        for row in by_category:
            print(f"  {row['category']:20} | {row['count']:3} публикаций")
        print()
    
    if by_date:
        print("=" * 70)
        print("📅 ПО ДАТАМ (последние 30 дней):")
        print("=" * 70)
        for row in by_date:
            print(f"  {row['date']} | {row['count']:3} публикаций")
        print()
    
    if tg_posts:
        print("=" * 70)
        print(f"📋 ПОСЛЕДНИЕ {min(10, len(tg_posts))} ПУБЛИКАЦИЙ В TELEGRAM:")
        print("=" * 70)
        for i, post in enumerate(tg_posts[:10], 1):
            print(f"{i:2}. [{post['category']:10}] {post['published_at']}")
            url = post['news_url']
            if len(url) > 70:
                url = url[:67] + "..."
            print(f"    URL: {url}")
            print(f"    TG ID: {post['tg_message_id']}")
            print()
    
    conn.close()
    
    print("=" * 70)
    print("💡 ПРИМЕЧАНИЕ:")
    print("=" * 70)
    print("Ссылки на bench.energy добавляются в посты через промпт генерации.")
    print("Проверьте фактические посты в Telegram канале @benchenergy")
    print("для подсчета точного количества упоминаний сайта.")
    print()

if __name__ == "__main__":
    try:
        check_database()
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
