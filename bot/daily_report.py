"""
Скрипт для ежедневной публикации сводки по угольному рынку.
Собирает актуальные показатели и публикует отчет в стиле Weekly Coal Market Update.
"""
import os
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from telegram import Bot
from telegram.error import TelegramError

from market_data_collector import collect_coal_market_data
from daily_report_generator import create_daily_market_report
from typing import Optional


# Загрузка переменных окружения
load_dotenv()

# Конфигурация
TG_TARGET_CHANNEL = os.getenv("TG_TARGET_CHANNEL", "@benchenergy")
TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")


def split_message(text: str, max_length: int = 3900) -> list[str]:
    """
    Разбивает длинное сообщение на части для Telegram.
    
    Args:
        text: Текст сообщения
        max_length: Максимальная длина одной части
        
    Returns:
        Список частей сообщения
    """
    if len(text) <= max_length:
        return [text]
    
    parts = []
    current_part = ""
    
    # Разбиваем по параграфам (двойной перенос строки)
    paragraphs = text.split("\n\n")
    
    for para in paragraphs:
        if len(para) > max_length:
            if current_part:
                parts.append(current_part.strip())
                current_part = ""
            
            sentences = para.split(". ")
            for sentence in sentences:
                if len(current_part) + len(sentence) + 2 > max_length:
                    if current_part:
                        parts.append(current_part.strip())
                    current_part = sentence
                else:
                    current_part += (". " if current_part else "") + sentence
        else:
            if len(current_part) + len(para) + 2 > max_length:
                if current_part:
                    parts.append(current_part.strip())
                current_part = para
            else:
                current_part += ("\n\n" if current_part else "") + para
    
    if current_part:
        parts.append(current_part.strip())
    
    return parts


async def send_message_via_bot_api(text: str, chat_id: str, media_path: Optional[Path] = None) -> bool:
    """
    Отправляет сообщение в Telegram канал через Bot API.
    
    Args:
        text: Текст сообщения
        chat_id: ID канала или username
        
    Returns:
        True если сообщение отправлено успешно, False иначе
    """
    if not TG_BOT_TOKEN:
        print("❌ TG_BOT_TOKEN не установлен")
        return False
    
    bot = Bot(token=TG_BOT_TOKEN)
    
    try:
        # Если есть изображение, отправляем с ним
        if media_path and media_path.exists():
            # ВАЖНО: Telegram caption максимум 1024 символа!
            # Обрезаем текст до 1020 символов, чтобы точно поместилось
            if len(text) > 1020:
                print(f"   ⚠️  Текст слишком длинный ({len(text)} символов), обрезаю до 1020...")
                # Обрезаем по последнему полному предложению или параграфу
                text_to_send = text[:1020]
                # Пытаемся обрезать по последней точке или переносу строки
                last_period = text_to_send.rfind('.')
                last_newline = text_to_send.rfind('\n')
                cut_point = max(last_period, last_newline)
                if cut_point > 800:  # Если нашли хорошую точку обрезки
                    text_to_send = text[:cut_point + 1]
                else:
                    text_to_send = text[:1020] + "..."
            else:
                text_to_send = text
            
            with open(media_path, 'rb') as photo:
                await bot.send_photo(
                    chat_id=chat_id,
                    photo=photo,
                    caption=text_to_send,
                    parse_mode='HTML'
                )
        else:
            # Если сообщение длинное, разбиваем на части
            if len(text) > 3900:
                parts = split_message(text)
                for i, part in enumerate(parts):
                    await bot.send_message(
                        chat_id=chat_id,
                        text=part,
                        parse_mode='HTML'
                    )
                    if i < len(parts) - 1:
                        await asyncio.sleep(0.5)
            else:
                await bot.send_message(
                    chat_id=chat_id,
                    text=text,
                    parse_mode='HTML'
                )
        
        return True
        
    except TelegramError as e:
        print(f"❌ Ошибка Telegram API: {e}")
        return False
    except Exception as e:
        print(f"❌ Неожиданная ошибка при отправке: {e}")
        return False


async def publish_daily_report():
    """
    Собирает данные по угольному рынку и публикует ежедневную сводку.
    """
    # Проверка конфигурации
    if not TG_BOT_TOKEN:
        print("❌ Ошибка: TG_BOT_TOKEN должен быть задан в .env")
        return False
    
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Ошибка: GEMINI_API_KEY должен быть задан в .env")
        return False
    
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("❌ Ошибка: ANTHROPIC_API_KEY должен быть задан в .env")
        return False
    
    # Проверка подключения к Bot API
    try:
        bot = Bot(token=TG_BOT_TOKEN)
        bot_info = await bot.get_me()
        print(f"✅ Bot API подключен: @{bot_info.username}")
    except Exception as e:
        print(f"❌ Ошибка: Не удалось подключиться к Bot API. Проверьте TG_BOT_TOKEN: {e}")
        return False
    
    print("=" * 60)
    print("📊 Bench Energy Daily Market Report")
    print("=" * 60)
    print(f"📅 Дата: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📢 Канал: {TG_TARGET_CHANNEL}")
    print("=" * 60)
    print()
    
    try:
        # Собираем данные по рынку
        print("🔍 Собираю данные по угольному рынку...")
        market_data = collect_coal_market_data()
        
        if not market_data.get("benchmarks") and not market_data.get("spreads"):
            print("⚠️  Данные по рынку не найдены")
            return False
        
        print(f"✅ Собрано данных: {len(market_data.get('benchmarks', []))} бенчмарков, "
              f"{len(market_data.get('spreads', []))} спредов")
        
        # Генерируем отчет
        print("📝 Генерирую ежедневную сводку...")
        report_text = create_daily_market_report(market_data)
        print(f"✅ Отчет создан ({len(report_text)} символов)")
        
        # Публикуем в Telegram БЕЗ изображения (бенчмарки публикуются без картинок)
        print(f"📤 Публикую в Telegram канал {TG_TARGET_CHANNEL} без изображения...")
        success = await send_message_via_bot_api(report_text, TG_TARGET_CHANNEL, None)
        
        if success:
            print(f"✅ Ежедневная сводка успешно опубликована!")
            return True
        else:
            print(f"❌ Не удалось опубликовать сводку")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка при создании и публикации сводки: {e}")
        import traceback
        print(traceback.format_exc())
        return False


if __name__ == "__main__":
    import sys
    
    # Проверяем флаг --once
    if "--once" in sys.argv:
        print("🚀 Запуск публикации ежедневной сводки")
        asyncio.run(publish_daily_report())
    else:
        # По умолчанию запускаем один раз
        asyncio.run(publish_daily_report())

