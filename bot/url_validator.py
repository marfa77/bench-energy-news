"""
Модуль для валидации URL новостей.
Проверяет доступность и валидность URL.
"""
import requests
from typing import Tuple
from urllib.parse import urlparse


def validate_news_url(url: str, timeout: int = 10) -> Tuple[bool, str]:
    """
    Проверяет, что URL новости валиден и доступен.
    
    Args:
        url: URL для проверки
        timeout: Таймаут запроса в секундах
        
    Returns:
        Кортеж (is_valid, error_message)
    """
    if not url:
        return False, "URL пустой"
    
    # Проверяем формат URL
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return False, "Неверный формат URL"
    
    # Проверяем доступность
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.head(url, headers=headers, timeout=timeout, allow_redirects=True)
        
        # Проверяем статус код
        if response.status_code == 403:
            return False, "Доступ запрещен (403)"
        elif response.status_code == 404:
            return False, "Страница не найдена (404)"
        elif response.status_code >= 400:
            return False, f"HTTP ошибка {response.status_code}"
        elif response.status_code == 200:
            return True, "OK"
        else:
            # Другие успешные коды (301, 302) тоже OK
            return True, "OK"
            
    except requests.exceptions.Timeout:
        return False, "Таймаут запроса"
    except requests.exceptions.ConnectionError:
        return False, "Ошибка подключения"
    except requests.exceptions.RequestException as e:
        return False, f"Ошибка запроса: {str(e)[:100]}"
    except Exception as e:
        return False, f"Неожиданная ошибка: {str(e)[:100]}"

