"""
Главный модуль бота для поиска новостей по углю и публикации в Telegram канал @benchenergy.
Ищет новости через Gemini с Google Search, создает аналитические посты и публикует их.
"""
import os
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from telegram import Bot
from telegram.error import TelegramError

from news_search import search_coal_news, select_best_news
from post_generator import create_coal_analysis
from post_versions_generator import generate_post_versions, generate_freight_post
from storage import is_published, mark_as_published, mark_as_published_with_category, should_generate_freight_post, increment_post_count, get_post_count, add_freight_topic
from published_news_db import init_database, is_news_published, save_publication, update_publication_platform
from image_extractor import extract_image_from_url
# from linkedin_publisher import publish_to_linkedin  # Отключено
from web_publisher import publish_to_web, submit_to_google_indexing


# Загрузка переменных окружения
# Сначала загружаем из корня проекта, потом из bot/
load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env')
load_dotenv()  # Перезагружаем из bot/.env (приоритет выше)

# Конфигурация
TG_TARGET_CHANNEL = os.getenv("TG_TARGET_CHANNEL", "@benchenergy")
TG_BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "")  # Chat ID для отправки статуса (можно username или ID)
POLL_SECONDS = int(os.getenv("POLL_SECONDS", "3600"))  # По умолчанию 1 час


def get_tags(text: str) -> list[str]:
    """
    Извлекает технические хештеги из текста на основе ключевых слов.
    
    Args:
        text: Текст новости или поста
        
    Returns:
        Список технических хештегов
    """
    text_lower = text.lower()
    tags = []
    
    # Регионы и страны
    regions = {
        'australia': '#Australia', 'newcastle': '#Newcastle', 'gladstone': '#Gladstone',
        'china': '#China', 'qinhuangdao': '#Qinhuangdao',
        'india': '#India', 'mundra': '#Mundra',
        'indonesia': '#Indonesia', 'kalimantan': '#Kalimantan',
        'south africa': '#SouthAfrica', 'richards bay': '#RichardsBay',
        'europe': '#Europe', 'ara': '#ARA',
        'usa': '#USA', 'united states': '#USA'
    }
    
    # Типы угля и товаров
    commodities = {
        'thermal coal': '#ThermalCoal', 'coking coal': '#CokingCoal',
        'steam coal': '#ThermalCoal', 'anthracite': '#Coal',
        'bituminous': '#Coal', 'metallurgical coal': '#CokingCoal'
    }
    
    # Термины рынка
    market_terms = {
        'fob': '#FOB', 'cif': '#CIF', 'freight': '#Freight',
        'shipping': '#Freight', 'panamax': '#Freight',
        'supramax': '#Freight', 'capesize': '#Freight'
    }
    
    # Проверяем регионы
    for keyword, tag in regions.items():
        if keyword in text_lower and tag not in tags:
            tags.append(tag)
    
    # Проверяем товары
    for keyword, tag in commodities.items():
        if keyword in text_lower and tag not in tags:
            tags.append(tag)
    
    # Проверяем термины рынка
    for keyword, tag in market_terms.items():
        if keyword in text_lower and tag not in tags:
            tags.append(tag)
    
    return tags


def extract_category_from_post(post_text: str) -> str:
    """
    Извлекает категорию из поста (Coal, Energy, Logistics, Steel, Markets).
    
    Args:
        post_text: Текст поста с категорией в заголовке
        
    Returns:
        Категория или 'Unknown'
    """
    # Ищем паттерн: EMOJI [CATEGORY] | или [CATEGORY]
    import re
    patterns = [
        r'\[(COAL|Energy|Logistics|Steel|Markets)\]',
        r'#(Coal|Energy|Logistics|Steel|Markets)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, post_text, re.IGNORECASE)
        if match:
            category = match.group(1).upper()
            # Нормализуем
            if category == 'COAL':
                return 'Coal'
            elif category in ['ENERGY', 'LOGISTICS', 'STEEL', 'MARKETS']:
                return category.capitalize()
    
    # Fallback: определяем по ключевым словам
    text_lower = post_text.lower()
    if any(word in text_lower for word in ['coal', 'thermal', 'coking', 'steam']):
        return 'Coal'
    elif any(word in text_lower for word in ['energy', 'power', 'electricity']):
        return 'Energy'
    elif any(word in text_lower for word in ['freight', 'shipping', 'vessel', 'port']):
        return 'Logistics'
    elif any(word in text_lower for word in ['steel', 'metallurgical']):
        return 'Steel'
    
    return 'Markets'  # По умолчанию


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
        # Если параграф сам по себе слишком длинный, разбиваем его
        if len(para) > max_length:
            if current_part:
                parts.append(current_part.strip())
                current_part = ""
            
            # Разбиваем длинный параграф по предложениям
            sentences = para.split(". ")
            for sentence in sentences:
                if len(current_part) + len(sentence) + 2 > max_length:
                    if current_part:
                        parts.append(current_part.strip())
                    current_part = sentence
                else:
                    current_part += (". " if current_part else "") + sentence
        else:
            # Проверяем, поместится ли параграф в текущую часть
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
        media_path: Путь к изображению (опционально)
        
    Returns:
        True если сообщение отправлено успешно, False иначе
    """
    if not TG_BOT_TOKEN:
        print("❌ TG_BOT_TOKEN не установлен")
        return False
    
    bot = Bot(token=TG_BOT_TOKEN)
    await bot.initialize()
    
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
    finally:
        await bot.shutdown()


async def send_status_to_admin(news_title: str, telegram_status: bool, web_status: bool, news_url: str = ""):
    """
    Отправляет статус публикации администратору в личный чат.
    
    Args:
        news_title: Заголовок новости
        telegram_status: True если опубликовано в Telegram
        web_status: True если опубликовано на сайте
        news_url: URL новости (опционально)
    """
    if not ADMIN_CHAT_ID:
        return  # Не отправляем, если chat_id не указан
    
    if not TG_BOT_TOKEN:
        return  # Не отправляем, если токен не установлен
    
    bot = Bot(token=TG_BOT_TOKEN)
    await bot.initialize()
    
    try:
        # Формируем сообщение со статусом
        status_emoji_tg = "✅" if telegram_status else "❌"
        status_emoji_web = "✅" if web_status else "❌"
        
        status_text = f"""📊 <b>Статус публикации</b>

📰 <b>Новость:</b>
{news_title[:200]}{'...' if len(news_title) > 200 else ''}

📱 <b>Telegram:</b> {status_emoji_tg} {'Опубликовано' if telegram_status else 'Не опубликовано'}
🌐 <b>Сайт:</b> {status_emoji_web} {'Опубликовано' if web_status else 'Не опубликовано'}

⏰ <i>{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</i>"""
        
        if news_url:
            status_text += f"\n\n🔗 <a href=\"{news_url}\">Источник</a>"
        
        await bot.send_message(
            chat_id=ADMIN_CHAT_ID,
            text=status_text,
            parse_mode='HTML',
            disable_web_page_preview=True
        )
        print(f"📤 Статус отправлен администратору")
    except Exception as e:
        print(f"⚠️  Не удалось отправить статус администратору: {e}")
    finally:
        await bot.shutdown()


async def process_news(news: dict):
    """
    Обрабатывает одну новость: создает аналитический пост и публикует.
    
    Args:
        news: Словарь с данными новости
        
    Returns:
        Tuple (success: bool, status: dict) где status содержит:
            - news_title: заголовок новости
            - telegram_status: True если опубликовано в Telegram
            - web_status: True если опубликовано на сайте
            - news_url: URL новости
    """
    try:
        news_url = news.get("source_url", "")
        news_title = news.get("title", "")
        
        # Проверка на дубликаты уже выполнена в run_once(), но оставляем для безопасности
        if news_url:
            if is_published(news_url) or is_news_published(news_url):
                print(f"⚠️  Новость уже опубликована (дополнительная проверка): {news_title[:50]}...")
                return False, {
                    "news_title": news_title,
                    "telegram_status": False,
                    "web_status": False,
                    "news_url": news_url
                }
        
        print(f"📰 Обрабатываем новость: {news_title[:60]}...")
        print(f"   URL: {news_url[:80] if news_url else 'N/A'}...")
        
        # ВАЛИДАЦИЯ: Проверяем, что URL реальный и доступен
        if news_url:
            from url_validator import validate_news_url
            is_valid, error_msg = validate_news_url(news_url)
            if not is_valid:
                print(f"❌ URL новости невалидный или недоступен: {error_msg}")
                print(f"   URL: {news_url[:80]}...")
                print(f"   ⚠️  Пропускаем эту новость (возможно, она выдумана или ссылка битая)")
                return False, {
                    "news_title": news_title,
                    "telegram_status": False,
                    "web_status": False,
                    "news_url": news_url
                }
            else:
                print(f"✅ URL новости валиден и доступен")
        
        # ПРОВЕРКА КАЧЕСТВА НОВОСТИ: Проверяем релевантность
        news_title_lower = news_title.lower()
        news_summary_lower = news.get("summary", "").lower()
        
        # Ключевые слова, которые должны быть в новости про уголь
        coal_keywords = ['coal', 'уголь', 'thermal', 'coking', 'steam', 'anthracite', 'bituminous']
        
        # Слова, которые указывают на общие/нерелевантные новости
        irrelevant_keywords = ['trump', 'election', 'president', 'commodities', 'general market', 'all commodities']
        
        # Проверяем релевантность
        has_coal_keyword = any(keyword in news_title_lower or keyword in news_summary_lower for keyword in coal_keywords)
        has_irrelevant = any(keyword in news_title_lower or keyword in news_summary_lower for keyword in irrelevant_keywords)
        
        if has_irrelevant and not has_coal_keyword:
            print(f"❌ Новость не релевантна угольному рынку (общая новость про товарные рынки)")
            print(f"   Заголовок: {news_title[:60]}...")
            print(f"   ⚠️  Пропускаем эту новость")
            return False, {
                "news_title": news_title,
                "telegram_status": False,
                "web_status": False,
                "news_url": news_url
            }
        
        if not has_coal_keyword:
            print(f"⚠️  В новости нет ключевых слов про уголь")
            print(f"   Заголовок: {news_title[:60]}...")
            print(f"   ⚠️  Пропускаем эту новость")
            return False, {
                "news_title": news_title,
                "telegram_status": False,
                "web_status": False,
                "news_url": news_url
            }
        
        # СТРОГАЯ ПРОВЕРКА: новость должна содержать конкретные данные (цифры, факты)
        import re
        news_text = news_title + " " + news_summary_lower
        has_numbers = bool(re.search(r'\d+', news_text))
        vague_phrases = ["not mentioned", "no significant", "limited activity", "under observation", "minimal", "expected", "likely"]
        vague_count = sum(1 for phrase in vague_phrases if phrase in news_text)
        
        if not has_numbers and vague_count >= 2:
            print(f"❌ Новость без конкретных данных (нет цифр, только общие фразы)")
            print(f"   Заголовок: {news_title[:60]}...")
            print(f"   ⚠️  Пропускаем эту новость")
            return False, {
                "news_title": news_title,
                "telegram_status": False,
                "web_status": False,
                "news_url": news_url
            }
        
        if len(news_summary_lower) < 100:
            print(f"❌ Новость слишком короткая (summary менее 100 символов)")
            print(f"   Заголовок: {news_title[:60]}...")
            print(f"   ⚠️  Пропускаем эту новость")
            return False, {
                "news_title": news_title,
                "telegram_status": False,
                "web_status": False,
                "news_url": news_url
            }
        
        # Извлекаем изображение из новости
        media_path = None
        if news_url:
            print(f"🖼️  Извлекаю изображение из новости: {news_url[:60]}...")
            try:
                # Убеждаемся, что используем правильный URL новости
                image_url = extract_image_from_url(news_url)
                if image_url:
                    # ПРОВЕРКА: Пропускаем иконки и маленькие изображения
                    if any(skip in image_url.lower() for skip in ['pinterest', 'pin', 'bookmark', 'favicon', 'icon', 'logo']):
                        print(f"⚠️  Найдено изображение-иконка, пропускаем: {image_url[:80]}...")
                        image_url = None
                    else:
                        print(f"✅ Найдено изображение: {image_url[:100]}...")
                    
                    if image_url:
                        # Скачиваем изображение
                        MEDIA_DIR = Path("output/media")
                        MEDIA_DIR.mkdir(parents=True, exist_ok=True)
                        
                        # Скачиваем изображение асинхронно
                        import aiohttp
                        print(f"📥 Скачиваю изображение...")
                        async with aiohttp.ClientSession() as session:
                            async with session.get(image_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                                if response.status == 200:
                                    content_type = response.headers.get('Content-Type', '')
                                    print(f"   Content-Type: {content_type}")
                                    
                                    # Определяем расширение файла (один раз создаем timestamp)
                                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                                    if 'jpeg' in content_type or 'jpg' in content_type:
                                        image_path = MEDIA_DIR / f"news_{timestamp}.jpg"
                                    elif 'png' in content_type:
                                        image_path = MEDIA_DIR / f"news_{timestamp}.png"
                                    elif 'webp' in content_type:
                                        image_path = MEDIA_DIR / f"news_{timestamp}.webp"
                                    else:
                                        # По умолчанию jpg
                                        image_path = MEDIA_DIR / f"news_{timestamp}.jpg"
                                    
                                    with open(image_path, 'wb') as f:
                                        async for chunk in response.content.iter_chunked(8192):
                                            f.write(chunk)
                                    
                                    if image_path.exists():
                                        file_size = image_path.stat().st_size
                                        print(f"   Размер файла: {file_size / 1024:.1f} KB")
                                        # Минимум 5KB для качественных изображений (было 10KB, снижено для лучшего покрытия)
                                        if file_size > 5120:  # Минимум 5KB
                                            media_path = image_path
                                            print(f"✅ Изображение скачано: {image_path}")
                                        else:
                                            print(f"⚠️  Изображение слишком маленькое ({file_size} байт, минимум 5KB)")
                                            try:
                                                image_path.unlink()
                                            except (OSError, FileNotFoundError) as e:
                                                print(f"   ⚠️  Не удалось удалить файл: {e}")
                                    else:
                                        print(f"⚠️  Файл не был создан")
                                else:
                                    print(f"⚠️  Не удалось скачать изображение: HTTP {response.status}")
                else:
                    print(f"ℹ️  Изображение не найдено в новости")
            except Exception as e:
                print(f"⚠️  Ошибка при извлечении изображения: {e}")
                import traceback
                print(traceback.format_exc())
                print(f"   Публикуем без изображения")
        
        # Генерируем версии поста (Telegram, Web) - LinkedIn версия не генерируется
        try:
            print(f"🤖 Генерирую версии поста для всех платформ...")
            versions = generate_post_versions(news)
            
            tg_version = versions.get("tg_version", "")
            web_version = versions.get("web_version", "")
            
            print(f"✅ Версии поста сгенерированы")
            
            # Извлекаем категорию из Telegram версии
            category = extract_category_from_post(tg_version)
            print(f"   📂 Категория: {category}")
            
            # Добавляем технические хештеги в Telegram версию если их нет
            news_text = news_title + " " + news.get("summary", "")
            technical_tags = get_tags(news_text)
            
            # Проверяем, какие теги уже есть в Telegram версии
            existing_tags = []
            import re
            hashtag_pattern = r'#\w+'
            existing_hashtags = re.findall(hashtag_pattern, tg_version)
            existing_tags = [tag.lower() for tag in existing_hashtags]
            
            # Фильтруем технические теги - добавляем только те, которых нет
            new_tags = []
            for tag in technical_tags:
                if tag.lower() not in existing_tags:
                    new_tags.append(tag)
            
            # Добавляем новые технические теги в Telegram версию
            if new_tags:
                tags_str = " " + " ".join(new_tags)
                if '<a href' in tg_version:
                    source_link_pos = tg_version.rfind('<a href')
                    tg_version = tg_version[:source_link_pos].rstrip() + tags_str + "\n\n" + tg_version[source_link_pos:]
                else:
                    tg_version = tg_version.rstrip() + tags_str
                print(f"   🏷️  Добавлены технические теги в Telegram: {', '.join(new_tags)}")
            
            # Используем tg_version для Telegram публикации
            analysis_text = tg_version
            
        except Exception as e:
            print(f"❌ Ошибка генерации версий поста: {e}")
            # Fallback: используем старый метод
            print(f"   ⚠️  Использую fallback: создаю одну версию для Telegram")
            try:
                analysis_text = create_coal_analysis(news)
                category = extract_category_from_post(analysis_text)
                web_version = f"<h1>{news_title}</h1><p>{news.get('summary', '')}</p>"
            except Exception as e2:
                print(f"❌ Ошибка fallback создания поста: {e2}")
                return False, {
                    "news_title": news_title,
                    "telegram_status": False,
                    "web_status": False,
                    "news_url": news_url
                }
        
        # Инициализируем переменные для версий (на случай fallback)
        if 'web_version' not in locals():
            web_version = f"<h1>{news_title}</h1><p>{news.get('summary', '')}</p>"
        
        # Инициализируем БД для метаданных
        init_database()
        
        # Публикуем на всех платформах последовательно
        tg_message_id = None
        linkedin_post_id = None
        web_article_url = None
        
        # 1. Telegram
        try:
            print(f"\n📱 Публикация в Telegram...")
            if media_path and media_path.exists():
                print(f"   Изображение: {media_path} ({media_path.stat().st_size / 1024:.1f} KB)")
            
            telegram_success = await send_message_via_bot_api(analysis_text, TG_TARGET_CHANNEL, media_path)
            
            if telegram_success:
                tg_message_id = "published"
                print(f"✅ Опубликовано в Telegram канал {TG_TARGET_CHANNEL}")
            else:
                print(f"❌ Не удалось опубликовать в Telegram (продолжаем с другими платформами)")
        except Exception as e:
            print(f"❌ Ошибка публикации в Telegram: {e}")
            import traceback
            print(traceback.format_exc())
        
        # 2. LinkedIn (отключено)
        linkedin_post_id = None
        print(f"\n💼 Публикация в LinkedIn отключена")
        
        # 3. Notion (единый источник правды)
        web_status = False
        web_article_url = None
        notion_page_id = None
        try:
            print(f"\n📝 Публикация в Notion...")
            from notion_publisher import create_notion_page
            
            # Получаем URL изображения для Notion
            image_url_for_notion = None
            if media_path and media_path.exists():
                # Для Notion нужен публичный URL, поэтому сначала публикуем изображение
                # Временно используем прямой путь или загружаем в публичное хранилище
                # Пока используем None, можно добавить загрузку в S3/CDN позже
                pass
            
            notion_page_id = create_notion_page(news, tg_version, web_version, image_url_for_notion)
            if notion_page_id:
                print(f"✅ Опубликовано в Notion: {notion_page_id}")
                # Формируем URL для Notion страницы (будет доступен после синхронизации)
                # Временный URL, реальный будет после синхронизации через GitHub Actions
                web_article_url = f"notion:{notion_page_id}"
                web_status = True  # Notion публикация считается успешной публикацией на веб
            else:
                print(f"❌ Не удалось опубликовать в Notion")
                web_status = False
        except Exception as e:
            print(f"❌ Ошибка публикации в Notion: {e}")
            import traceback
            print(traceback.format_exc())
            web_status = False
        
        # 4. Синхронизация Notion → GitHub Pages (опционально, можно запускать отдельно)
        # Это можно делать по расписанию или через webhook
        # Для автоматизации создан отдельный скрипт notion_sync.py
        # GitHub Actions workflow автоматически синхронизирует каждый час
        # После синхронизации web_article_url будет обновлен на реальный URL GitHub Pages
        
        # Удаляем изображение после публикации на всех платформах
        if media_path and media_path.exists():
            try:
                media_path.unlink()
                print(f"\n🗑️  Изображение удалено после публикации")
            except (OSError, FileNotFoundError) as e:
                print(f"   ⚠️  Не удалось удалить изображение: {e}")
        
        # Сохраняем метаданные в БД
        if news_url:
            save_publication(
                news_url=news_url,
                category=category,
                tg_message_id=tg_message_id,
                linkedin_post_id=linkedin_post_id,
                web_article_url=web_article_url
            )
            
            # Также сохраняем в старый storage для обратной совместимости
            mark_as_published_with_category(news_url, category)
            
            print(f"\n💾 Метаданные сохранены:")
            print(f"   URL: {news_url[:60]}...")
            print(f"   Категория: {category}")
            if tg_message_id:
                print(f"   Telegram: ✅")
            if linkedin_post_id:
                print(f"   LinkedIn: ✅ ({linkedin_post_id})")
            if web_article_url:
                print(f"   Web: ✅ ({web_article_url})")
        
        # Формируем статус для возврата
        telegram_status = bool(tg_message_id)
        web_status = bool(web_article_url)
        
        status_info = {
            "news_title": news_title,
            "telegram_status": telegram_status,
            "web_status": web_status,
            "news_url": news_url
        }
        
        # Проверяем успешность хотя бы одной публикации
        if tg_message_id or linkedin_post_id or web_article_url:
            print(f"\n✅ Новость обработана и опубликована на платформах")
        else:
            print(f"\n❌ Не удалось опубликовать ни на одной платформе")
        
        # Очистка старых изображений (старше 7 дней)
        try:
            MEDIA_DIR = Path("output/media")
            if MEDIA_DIR.exists():
                cutoff_time = datetime.now() - timedelta(days=7)
                for img_file in MEDIA_DIR.glob("news_*.*"):
                    try:
                        if img_file.stat().st_mtime < cutoff_time.timestamp():
                            img_file.unlink()
                            print(f"   🗑️  Удалено старое изображение: {img_file.name}")
                    except (OSError, FileNotFoundError):
                        pass
        except Exception as e:
            print(f"   ⚠️  Ошибка при очистке старых изображений: {e}")
        
        # Возвращаем результат
        success = bool(tg_message_id or linkedin_post_id or web_article_url)
        return success, status_info
        
    except Exception as e:
        print(f"❌ Критическая ошибка при обработке новости: {e}")
        import traceback
        print(traceback.format_exc())
        return False, {
            "news_title": news.get("title", "Unknown"),
            "telegram_status": False,
            "web_status": False,
            "news_url": news.get("source_url", "")
        }


async def run_once():
    """
    Запускает одну проверку новостей и публикацию.
    Используется для запуска по расписанию (2 раза в день).
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
    bot = None
    try:
        bot = Bot(token=TG_BOT_TOKEN)
        await bot.initialize()
        bot_info = await bot.get_me()
        print(f"✅ Bot API подключен: @{bot_info.username}")
    except Exception as e:
        print(f"❌ Ошибка: Не удалось подключиться к Bot API. Проверьте TG_BOT_TOKEN: {e}")
        return False
    finally:
        if bot:
            await bot.shutdown()
    
    # Проверяем, нужно ли генерировать специальный пост о фрахте
    post_count = get_post_count()
    
    if should_generate_freight_post():
        print(f"🚢 Генерация специального поста о фрахте (счетчик постов: {post_count})...")
        try:
            # Генерируем специальный пост о фрахте
            versions = generate_freight_post()
            
            tg_version = versions.get("tg_version", "")
            web_version = versions.get("web_version", "")
            
            if not tg_version:
                print("❌ Не удалось сгенерировать специальный пост о фрахте")
                return False
            
            print(f"✅ Специальный пост о фрахте сгенерирован")
            
            # Публикуем в Telegram
            bot = None
            try:
                bot = Bot(token=TG_BOT_TOKEN)
                await bot.initialize()
                
                telegram_success = await send_message_via_bot_api(tg_version, TG_TARGET_CHANNEL, None)
                
                if telegram_success:
                    print(f"✅ Специальный пост о фрахте опубликован в Telegram")
                else:
                    print(f"❌ Не удалось опубликовать специальный пост в Telegram")
                    return False
            except Exception as e:
                print(f"❌ Ошибка публикации специального поста в Telegram: {e}")
                import traceback
                print(traceback.format_exc())
                return False
            finally:
                if bot:
                    await bot.shutdown()
            
            # Публикуем в Notion
            try:
                from notion_publisher import create_notion_page
                
                # Создаем структуру новости для Notion
                freight_news = {
                    "title": "Freight Challenges for Bulk Trading Companies",
                    "summary": "Analytical post about freight logistics challenges and solutions",
                    "source_url": "",
                    "source_name": "Bench Energy Analysis",
                    "category": "Freight"
                }
                
                # LinkedIn версия не нужна, передаем пустую строку
                notion_page_id = create_notion_page(freight_news, tg_version, web_version, None)
                if notion_page_id:
                    print(f"✅ Специальный пост о фрахте опубликован в Notion: {notion_page_id}")
                else:
                    print(f"⚠️  Не удалось опубликовать специальный пост в Notion")
            except Exception as e:
                print(f"❌ Ошибка публикации специального поста в Notion: {e}")
                import traceback
                print(traceback.format_exc())
            
            # Отправляем статус администратору
            await send_status_to_admin(
                news_title="Специальный пост о фрахте",
                telegram_status=telegram_success,
                web_status=notion_page_id is not None,
                news_url=""
            )
            
            # Сохраняем тему поста, чтобы избежать дублей
            topic = versions.get("topic", "freight challenges")
            add_freight_topic(topic)
            print(f"💾 Тема поста сохранена: {topic[:50]}...")
            
            # НЕ увеличиваем счетчик для специальных постов
            print(f"ℹ️  Счетчик постов остался: {get_post_count()} (специальные посты не учитываются)")
            
            return True
            
        except Exception as e:
            print(f"❌ Ошибка генерации специального поста о фрахте: {e}")
            import traceback
            print(traceback.format_exc())
            return False
    
    print(f"🔍 Поиск новостей по углю за сегодня ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})...")
    print(f"📊 Счетчик постов: {post_count}")
    
    try:
        # Ищем новости
        news_list = search_coal_news()
        
        if not news_list:
            print("⚠️  Новости не найдены")
            # Отправляем статус о том, что новости не найдены
            await send_status_to_admin(
                news_title="Новости не найдены",
                telegram_status=False,
                web_status=False,
                news_url=""
            )
            return False
        
        print(f"📰 Найдено {len(news_list)} новостей")
        
        # Сначала фильтруем опубликованные новости
        init_database()  # Убеждаемся, что БД инициализирована
        unpublished_news = []
        for news in news_list:
            news_url = news.get("source_url", "")
            if news_url:
                # Проверяем в обеих системах хранения
                if not is_published(news_url) and not is_news_published(news_url):
                    unpublished_news.append(news)
                else:
                    print(f"   ⏭️  Пропущена уже опубликованная: {news.get('title', '')[:50]}...")
            else:
                # Если нет URL, все равно добавляем (но это редко)
                unpublished_news.append(news)
        
        if not unpublished_news:
            print("⚠️  Все найденные новости уже опубликованы")
            # Отправляем статус о том, что все новости уже опубликованы
            await send_status_to_admin(
                news_title="Все найденные новости уже опубликованы",
                telegram_status=False,
                web_status=False,
                news_url=""
            )
            return False
        
        print(f"📰 Неопубликованных новостей: {len(unpublished_news)} из {len(news_list)}")
        
        # Выбираем лучшую новость среди неопубликованных
        best_news = select_best_news(unpublished_news)
        
        if not best_news:
            print("⚠️  Не удалось выбрать новость для публикации")
            # Отправляем статус о том, что не удалось выбрать новость
            await send_status_to_admin(
                news_title="Не удалось выбрать новость для публикации",
                telegram_status=False,
                web_status=False,
                news_url=""
            )
            return False
        
        # Обрабатываем новость
        success, status_info = await process_news(best_news)
        
        # Отправляем статус администратору
        if status_info:
            await send_status_to_admin(
                news_title=status_info.get("news_title", "Unknown"),
                telegram_status=status_info.get("telegram_status", False),
                web_status=status_info.get("web_status", False),
                news_url=status_info.get("news_url", "")
            )
        
        if success:
            print(f"✅ Новость успешно обработана и опубликована")
            # Увеличиваем счетчик постов после успешной публикации
            new_count = increment_post_count()
            print(f"📊 Счетчик постов обновлен: {new_count} (следующий специальный пост через {6 - (new_count % 6)} постов)")
            return True
        else:
            print(f"⚠️  Не удалось обработать новость")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка при обработке: {e}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        return False


async def main_loop():
    """
    Основной цикл бота (режим polling).
    Используется если запущен без --once флага.
    """
    # Проверка конфигурации
    if not TG_BOT_TOKEN:
        print("❌ Ошибка: TG_BOT_TOKEN должен быть задан в .env")
        return
    
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Ошибка: GEMINI_API_KEY должен быть задан в .env")
        return
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Ошибка: OPENAI_API_KEY должен быть задан в .env")
        return
    
    # Проверка подключения к Bot API
    bot = None
    try:
        bot = Bot(token=TG_BOT_TOKEN)
        await bot.initialize()
        bot_info = await bot.get_me()
        print(f"✅ Bot API подключен: @{bot_info.username}")
    except Exception as e:
        print(f"❌ Ошибка: Не удалось подключиться к Bot API. Проверьте TG_BOT_TOKEN: {e}")
        return
    finally:
        if bot:
            await bot.shutdown()
    
    print("=" * 60)
    print("🔥 Bench Energy Coal News Bot")
    print("=" * 60)
    print(f"📢 Канал: {TG_TARGET_CHANNEL}")
    print(f"⏱️  Интервал проверки: {POLL_SECONDS} секунд ({POLL_SECONDS // 60} минут)")
    print("=" * 60)
    print()
    
    while True:
        try:
            success = await run_once()
            
            if success:
                print(f"✅ Проверка завершена успешно")
            else:
                print(f"⚠️  Проверка завершена с предупреждениями")
            
            # Ждем перед следующей проверкой
            print(f"⏳ Ожидание {POLL_SECONDS} секунд до следующей проверки...\n")
            await asyncio.sleep(POLL_SECONDS)
                
        except KeyboardInterrupt:
            print("\n⏹️  Остановка бота...")
            break
        except Exception as e:
            print(f"❌ Ошибка в главном цикле: {e}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            await asyncio.sleep(POLL_SECONDS)


if __name__ == "__main__":
    import sys
    
    # Проверяем флаг --once
    if "--once" in sys.argv:
        print("🚀 Запуск в режиме одного запуска (для systemd timer)")
        asyncio.run(run_once())
    else:
        print("🚀 Запуск в режиме polling")
        asyncio.run(main_loop())

