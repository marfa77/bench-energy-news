"""
Модуль для публикации постов в LinkedIn.
Использует LinkedIn API v2 (UGC Posts) для публикации текста и изображений.
"""
import os
import requests
import time
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# LinkedIn API credentials
LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
LINKEDIN_ORGANIZATION_ID = os.getenv("LINKEDIN_ORGANIZATION_ID")  # ID организации для публикации от имени компании

# LinkedIn API endpoints
LINKEDIN_API_BASE = "https://api.linkedin.com/v2"
USERINFO_ENDPOINT = "https://api.linkedin.com/v2/userinfo"
UGC_POSTS_ENDPOINT = f"{LINKEDIN_API_BASE}/ugcPosts"
ASSETS_ENDPOINT = f"{LINKEDIN_API_BASE}/assets"


def get_organization_urn() -> Optional[str]:
    """
    Получает organization URN для публикации от имени компании.
    
    Returns:
        URN в формате urn:li:organization:{id} или None при ошибке
    """
    if LINKEDIN_ORGANIZATION_ID:
        organization_urn = f"urn:li:organization:{LINKEDIN_ORGANIZATION_ID}"
        print(f"✅ LinkedIn organization URN: {organization_urn}")
        return organization_urn
    else:
        print("❌ LINKEDIN_ORGANIZATION_ID не установлен в .env")
        print("   Для публикации от имени компании требуется organization ID")
        return None


def get_person_id() -> Optional[str]:
    """
    Получает person_id (URN) текущего пользователя через userinfo endpoint.
    Используется только для fallback или проверки доступа.
    
    Returns:
        URN в формате urn:li:person:{sub} или None при ошибке
    """
    if not LINKEDIN_ACCESS_TOKEN:
        print("❌ LINKEDIN_ACCESS_TOKEN не установлен в .env")
        return None
    
    headers = {
        "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(USERINFO_ENDPOINT, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        sub = data.get("sub")
        if sub:
            person_urn = f"urn:li:person:{sub}"
            return person_urn
        else:
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Ошибка получения person_id: {e}")
        return None


def register_upload(image_url: str, owner_urn: str) -> Optional[dict]:
    """
    Регистрирует загрузку изображения в LinkedIn Assets API.
    
    Args:
        image_url: URL изображения для загрузки
        owner_urn: URN владельца (organization или person)
        
    Returns:
        Словарь с uploadUrl и asset, или None при ошибке
    """
    if not LINKEDIN_ACCESS_TOKEN:
        return None
    
    headers = {
        "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Регистрируем загрузку
    # Для организации owner должен быть organization URN
    register_payload = {
        "registerUploadRequest": {
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "owner": owner_urn,  # Может быть organization или person URN
            "serviceRelationships": [
                {
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }
            ]
        }
    }
    
    try:
        response = requests.post(
            f"{ASSETS_ENDPOINT}?action=registerUpload",
            headers=headers,
            json=register_payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        upload_url = data.get("value", {}).get("uploadMechanism", {}).get("com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest", {}).get("uploadUrl")
        asset = data.get("value", {}).get("asset")
        
        if upload_url and asset:
            print(f"✅ Загрузка изображения зарегистрирована")
            return {"uploadUrl": upload_url, "asset": asset}
        else:
            print("❌ Не удалось получить uploadUrl или asset")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка регистрации загрузки: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Статус: {e.response.status_code}")
            print(f"   Ответ: {e.response.text[:200]}")
        return None


def upload_image_to_linkedin(upload_url: str, image_url: str) -> bool:
    """
    Загружает изображение по URL в LinkedIn.
    
    Args:
        upload_url: URL для загрузки от LinkedIn
        image_url: URL изображения для скачивания и загрузки
        
    Returns:
        True если загрузка успешна, False иначе
    """
    try:
        # Скачиваем изображение
        print(f"📥 Скачиваю изображение: {image_url[:60]}...")
        img_response = requests.get(image_url, timeout=30)
        img_response.raise_for_status()
        
        # Загружаем в LinkedIn
        print(f"📤 Загружаю изображение в LinkedIn...")
        upload_headers = {
            "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
        }
        
        upload_response = requests.put(
            upload_url,
            headers=upload_headers,
            data=img_response.content,
            timeout=60
        )
        upload_response.raise_for_status()
        
        print(f"✅ Изображение загружено в LinkedIn")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка загрузки изображения: {e}")
        return False


def publish_to_linkedin(text: str, image_url: Optional[str] = None) -> Optional[str]:
    """
    Публикует пост в LinkedIn.
    
    Args:
        text: Текст поста (HTML не поддерживается, только plain text)
        image_url: URL изображения (опционально)
        
    Returns:
        URN опубликованного поста или None при ошибке
    """
    if not LINKEDIN_ACCESS_TOKEN:
        print("❌ LINKEDIN_ACCESS_TOKEN не установлен в .env")
        return None
    
    # Получаем organization URN для публикации от имени компании
    organization_urn = get_organization_urn()
    if not organization_urn:
        print("❌ Не удалось получить organization URN")
        print("   Убедитесь, что LINKEDIN_ORGANIZATION_ID установлен в .env")
        print("   Требуется scope: w_organization_social")
        return None
    
    # Проверяем, что используется правильный URN
    if not organization_urn.startswith("urn:li:organization:"):
        print(f"❌ Неверный формат organization URN: {organization_urn}")
        print("   Ожидается: urn:li:organization:{ID}")
        return None
    
    # Очищаем текст от HTML тегов для LinkedIn
    import re
    clean_text = re.sub(r'<[^>]+>', '', text)  # Убираем HTML теги
    clean_text = clean_text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    clean_text = clean_text.strip()
    
    # LinkedIn имеет лимит ~3000 символов
    if len(clean_text) > 3000:
        clean_text = clean_text[:2997] + "..."
        print(f"⚠️  Текст обрезан до 3000 символов для LinkedIn")
    
    headers = {
        "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }
    
    # Пробуем загрузить изображение если есть
    # ВАЖНО: Изображение должно быть загружено как медиа-ассет через registerUpload,
    # а не просто ссылка в тексте. Это обеспечивает правильное отображение превью.
    # Для организации owner должен быть organization URN
    asset_urn = None
    if image_url:
        print(f"🖼️  Регистрация изображения как медиа-ассета...")
        upload_info = register_upload(image_url, organization_urn)
        if upload_info:
            print(f"   ✅ Регистрация успешна, загружаю изображение...")
            upload_success = upload_image_to_linkedin(upload_info["uploadUrl"], image_url)
            if upload_success:
                asset_urn = upload_info["asset"]
                print(f"   ✅ Изображение загружено как медиа-ассет: {asset_urn}")
            else:
                print("⚠️  Загрузка изображения не удалась, публикуем только текст")
        else:
            print("⚠️  Регистрация загрузки не удалась, публикуем только текст")
    else:
        print("ℹ️  Изображение не предоставлено, публикуем только текст")
    
    # Формируем payload для UGC Post
    specific_content = {
        "com.linkedin.ugc.ShareContent": {
            "shareCommentary": {
                "text": clean_text
            },
            "shareMediaCategory": "NONE" if not asset_urn else "IMAGE"
        }
    }
    
    if asset_urn:
        specific_content["com.linkedin.ugc.ShareContent"]["media"] = [
            {
                "status": "READY",
                "media": asset_urn,
                "title": {
                    "text": "Coal Market News"
                }
            }
        ]
    
    # Формируем payload для публикации от имени организации
    payload = {
        "author": organization_urn,  # ВАЖНО: используем organization URN, а не person URN
        "lifecycleState": "PUBLISHED",
        "specificContent": specific_content,
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"  # Важно: PUBLIC, а не CONNECTIONS!
        }
    }
    
    # Проверка: убеждаемся, что используется organization URN
    if not payload["author"].startswith("urn:li:organization:"):
        print(f"⚠️  ВНИМАНИЕ: author не является organization URN: {payload['author']}")
        print("   Пост может быть опубликован в личной ленте вместо страницы компании!")
    
    # Проверка: убеждаемся, что visibility установлен правильно
    if payload["visibility"]["com.linkedin.ugc.MemberNetworkVisibility"] != "PUBLIC":
        print("⚠️  ВНИМАНИЕ: visibility не установлен в PUBLIC!")
    
    try:
        print(f"📤 Публикую в LinkedIn...")
        response = requests.post(UGC_POSTS_ENDPOINT, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        # LinkedIn возвращает URN в формате urn:li:share:{ID} в теле ответа
        response_data = response.json()
        post_urn = response_data.get("id") or response.headers.get("X-LinkedIn-Id")
        
        if post_urn:
            # Извлекаем ID из URN (urn:li:share:1234567890 -> 1234567890)
            if isinstance(post_urn, str) and ":" in post_urn:
                post_id = post_urn.split(":")[-1]
            else:
                post_id = str(post_urn)
            
            # Формируем прямую ссылку на пост
            post_url = f"https://www.linkedin.com/feed/update/urn:li:share:{post_id}"
            
            print(f"✅ Пост опубликован в LinkedIn")
            print(f"   📎 Ссылка: {post_url}")
            print(f"   🆔 URN: {post_urn}")
            
            return post_urn  # Возвращаем полный URN для совместимости
        else:
            print(f"⚠️  Пост опубликован, но ID не получен")
            print(f"   Ответ API: {response_data}")
            return "published"
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка публикации в LinkedIn: {e}")
        if hasattr(e, 'response') and e.response is not None:
            status_code = e.response.status_code
            print(f"   Статус: {status_code}")
            print(f"   Ответ: {e.response.text[:500]}")
            
            # Проверка на ошибку 403 (недостаточно прав)
            if status_code == 403:
                print()
                print("⚠️  ОШИБКА 403: Недостаточно прав для публикации от имени организации")
                print("   Требуется scope: w_organization_social")
                print("   Действия:")
                print("   1. Перейдите в LinkedIn Developer Portal")
                print("   2. Обновите разрешения приложения")
                print("   3. Добавьте scope: w_organization_social")
                print("   4. Перевыпустите токен доступа")
        return None

