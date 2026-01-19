"""
Модуль для извлечения изображений из новостных статей.
Использует Open Graph и Twitter Card мета-теги, а также парсинг HTML.
"""
import re
import requests
from typing import Optional
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup


def extract_image_from_url(url: str, timeout: int = 15) -> Optional[str]:
    """
    Извлекает URL изображения из новостной статьи.
    Убеждается, что изображение действительно из этой статьи.
    
    Приоритет:
    1. Open Graph image (og:image) - самое надежное
    2. Twitter Card image (twitter:image)
    3. Первое большое изображение из статьи (в основном контенте)
    4. НЕ используем favicon (слишком общий)
    
    Args:
        url: URL новостной статьи
        timeout: Таймаут запроса в секундах
        
    Returns:
        URL изображения или None если не найдено
    """
    if not url:
        return None
    
    try:
        # Заголовки для имитации современного браузера (обход блокировок премиум-источников)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
        
        # Если это редирект Google Search, пытаемся развернуть его
        if "vertexaisearch.cloud.google.com/grounding-api-redirect" in url:
            print(f"   🔗 Обнаружен редирект Google Search, разворачиваю...")
            try:
                # Делаем HEAD запрос для получения финального URL
                head_response = requests.head(url, headers=headers, timeout=timeout, allow_redirects=True)
                if head_response.url and head_response.url != url:
                    final_url = head_response.url
                    print(f"   ✅ Реальный URL: {final_url[:80]}...")
                    url = final_url
            except Exception as e:
                print(f"   ⚠️  Не удалось развернуть редирект: {e}")
                # Продолжаем с оригинальным URL
        
        response = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        response.raise_for_status()
        
        # Проверяем финальный URL (после редиректов)
        final_url = response.url
        if final_url != url:
            print(f"   URL изменился после редиректа: {final_url[:80]}...")
        
        # Парсим HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # 0. Проверяем JSON-LD (структурированные данные) - часто содержит качественные изображения
        json_ld_image = None
        try:
            import json
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                try:
                    data = json.loads(script.string)
                    # Может быть объект или массив
                    if isinstance(data, list):
                        data = data[0] if data else {}
                    
                    # Ищем image или thumbnailUrl
                    image_url = data.get('image') or data.get('thumbnailUrl')
                    if isinstance(image_url, dict):
                        image_url = image_url.get('url') or image_url.get('@id')
                    if isinstance(image_url, list) and image_url:
                        image_url = image_url[0]
                        if isinstance(image_url, dict):
                            image_url = image_url.get('url') or image_url.get('@id')
                    
                    if image_url and isinstance(image_url, str) and image_url.startswith('http'):
                        json_ld_image = image_url
                        print(f"   ✅ Найдено изображение в JSON-LD")
                        break
                except (json.JSONDecodeError, AttributeError, KeyError):
                    continue
        except Exception as e:
            print(f"   ⚠️  Ошибка при парсинге JSON-LD: {e}")
        
        # 1. Проверяем Open Graph image
        # ВАЖНО: og:image может быть общим для всего сайта, поэтому проверяем его только если
        # нет более специфичных изображений в статье
        og_image = soup.find('meta', property='og:image')
        og_image_url = None
        if og_image and og_image.get('content'):
            og_image_url = og_image.get('content')
            # Делаем абсолютный URL если нужно
            if og_image_url.startswith('//'):
                og_image_url = 'https:' + og_image_url
            elif og_image_url.startswith('/'):
                og_image_url = urljoin(final_url, og_image_url)
            elif not og_image_url.startswith('http'):
                og_image_url = urljoin(final_url, og_image_url)
            
            if not _is_valid_image_url(og_image_url):
                og_image_url = None
        
        # 2. Проверяем Twitter Card image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        twitter_image_url = None
        if twitter_image and twitter_image.get('content'):
            twitter_image_url = twitter_image.get('content')
            if twitter_image_url.startswith('//'):
                twitter_image_url = 'https:' + twitter_image_url
            elif twitter_image_url.startswith('/'):
                twitter_image_url = urljoin(final_url, twitter_image_url)
            elif not twitter_image_url.startswith('http'):
                twitter_image_url = urljoin(final_url, twitter_image_url)
            
            if not _is_valid_image_url(twitter_image_url):
                twitter_image_url = None
        
        # 3. Ищем изображения в основном контенте статьи (не в header/footer/sidebar)
        # Ищем основные контейнеры статьи
        article_selectors = [
            'article', '[role="article"]', '.article', '.post', '.content',
            '.story', '.news-content', '.article-body', 'main', '.main-content'
        ]
        
        article_container = None
        for selector in article_selectors:
            article_container = soup.select_one(selector)
            if article_container:
                break
        
        # Если нашли контейнер статьи, ищем изображения только в нем
        # Если не нашли, ищем во всем документе, но с более строгими фильтрами
        search_area = article_container if article_container else soup
        
        images = search_area.find_all('img') if article_container else soup.find_all('img')
        
        # Сортируем по приоритету: сначала большие изображения из статьи
        scored_images = []
        for img in images:
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src') or img.get('data-original')
            if not src:
                # Проверяем data-srcset
                srcset = img.get('data-srcset') or img.get('srcset')
                if srcset:
                    # Берем первое изображение из srcset (обычно самое большое)
                    src = srcset.split()[0] if srcset else None
            
            if not src:
                continue
            
            # Если data-srcset, берем первое изображение
            if ' ' in src and not src.startswith('http'):
                src = src.split()[0]
            
            # Пропускаем маленькие изображения (иконки, аватары)
            width = img.get('width')
            height = img.get('height')
            score = 0
            
            # Бонус за изображение в контейнере статьи
            if article_container:
                if article_container.find('img') == img or img in article_container.find_all('img'):
                    score += 100
            
            if width and height:
                try:
                    w = int(width)
                    h = int(height)
                    if w < 300 or h < 300:  # Увеличили минимум до 300x300
                        continue
                    score += w * h  # Больше = лучше
                except (ValueError, TypeError):
                    pass
            
            # Делаем абсолютный URL
            if src.startswith('//'):
                src = 'https:' + src
            elif src.startswith('/'):
                src = urljoin(final_url, src)
            elif not src.startswith('http'):
                src = urljoin(final_url, src)
            
            # Проверяем, что это не иконка/логотип/реклама
            if _is_valid_article_image(src, img):
                scored_images.append((score, src))
        
        # Приоритет: JSON-LD > изображения из статьи > Twitter Card > Open Graph
        
        # Если есть JSON-LD изображение, используем его (высокий приоритет)
        if json_ld_image and _is_valid_image_url(json_ld_image):
            print(f"   ✅ Используем изображение из JSON-LD (высокое качество)")
            return json_ld_image
        
        # Сортируем по размеру (больше = лучше) и возвращаем первое
        if scored_images:
            scored_images.sort(reverse=True, key=lambda x: x[0])
            best_image = scored_images[0][1]
            best_score = scored_images[0][0]
            print(f"   Найдено {len(scored_images)} изображений в статье, выбрано лучшее (score: {best_score})")
            
            # Если нашли хорошее изображение в статье (score > 100), используем его
            # Это значит, что изображение точно из контента статьи
            if best_score > 100:
                print(f"   ✅ Используем изображение из контента статьи")
                return best_image
            
            # Если score <= 100, но есть og:image или twitter:image, проверяем их
            # Но только если они не выглядят как общие для сайта
            if twitter_image_url and twitter_image_url != og_image_url:
                # Twitter Card обычно более специфичен для статьи
                print(f"   ✅ Используем Twitter Card изображение")
                return twitter_image_url
            
            if og_image_url:
                # Проверяем, что og:image не слишком общий (не favicon/logo)
                if not any(skip in og_image_url.lower() for skip in ['logo', 'icon', 'favicon', 'default']):
                    print(f"   ✅ Используем Open Graph изображение")
                    return og_image_url
            
            # Если og:image выглядит общим, но есть изображение из статьи, используем его
            print(f"   ✅ Используем изображение из контента статьи (fallback)")
            return best_image
        
        # Если не нашли изображения в статье, пробуем Twitter Card, затем Open Graph
        if twitter_image_url:
            print(f"   ⚠️  Используем Twitter Card изображение (изображений в статье не найдено)")
            return twitter_image_url
        
        if og_image_url:
            print(f"   ⚠️  Используем Open Graph изображение (изображений в статье не найдено)")
            return og_image_url
        
        return None
        
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Ошибка при запросе {url}: {e}")
        return None
    except Exception as e:
        print(f"⚠️  Ошибка при извлечении изображения из {url}: {e}")
        return None


def _is_valid_image_url(url: str) -> bool:
    """
    Проверяет, что URL выглядит как валидное изображение.
    
    Args:
        url: URL для проверки
        
    Returns:
        True если URL валидный
    """
    if not url or not url.startswith('http'):
        return False
    
    # Проверяем расширение файла
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    parsed = urlparse(url)
    path_lower = parsed.path.lower()
    
    # Если есть расширение, проверяем его
    if any(path_lower.endswith(ext) for ext in valid_extensions):
        return True
    
    # Если нет расширения, но есть параметры (например, CDN URL)
    # Проверяем, что это не явно не изображение
    invalid_patterns = ['logo', 'icon', 'avatar', 'favicon']
    url_lower = url.lower()
    if any(pattern in url_lower for pattern in invalid_patterns):
        return False
    
    # Если это CDN или известный хостинг изображений, считаем валидным
    cdn_domains = ['cdn', 'img', 'image', 'media', 'assets', 'static']
    domain = parsed.netloc.lower()
    if any(cdn in domain for cdn in cdn_domains):
        return True
    
    # Если есть параметры типа image или img, считаем валидным
    if 'image' in url_lower or 'img' in url_lower:
        return True
    
    return False


def _is_valid_article_image(url: str, img_tag) -> bool:
    """
    Проверяет, что изображение подходит для статьи (не иконка/логотип/реклама).
    
    Args:
        url: URL изображения
        img_tag: BeautifulSoup тег img
        
    Returns:
        True если изображение подходит для статьи
    """
    url_lower = url.lower()
    
    # Пропускаем явные иконки, логотипы, рекламу
    skip_patterns = [
        'logo', 'icon', 'avatar', 'favicon', 'sprite',
        'button', 'badge', 'ad', 'banner', 'sponsor',
        'advertisement', 'promo', 'thumbnail', 'thumb',
        'social', 'share', 'widget', 'sidebar',
        'pinterest', 'pin', 'bookmark', 'bookmarklet'
    ]
    
    if any(pattern in url_lower for pattern in skip_patterns):
        return False
    
    # Проверяем классы и ID
    classes = img_tag.get('class', [])
    img_id = img_tag.get('id', '')
    class_str = ' '.join(classes).lower() if classes else ''
    
    skip_classes = ['logo', 'icon', 'avatar', 'ad', 'banner', 'sponsor', 'widget', 'sidebar', 'thumbnail']
    if any(skip in class_str or skip in str(img_id).lower() for skip in skip_classes):
        return False
    
    # Проверяем родительские элементы (не должно быть в рекламных блоках)
    parent = img_tag.parent
    if parent:
        parent_class = ' '.join(parent.get('class', [])).lower() if parent.get('class') else ''
        parent_id = str(parent.get('id', '')).lower()
        if any(skip in parent_class or skip in parent_id for skip in ['ad', 'advertisement', 'sponsor', 'promo']):
            return False
    
    # Проверяем alt текст - если есть и содержит skip-слова, пропускаем
    alt_text = img_tag.get('alt', '').lower()
    if alt_text and any(skip in alt_text for skip in ['logo', 'icon', 'ad', 'sponsor']):
        return False
    
    return True

