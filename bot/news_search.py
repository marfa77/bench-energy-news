"""
Модуль для поиска новостей по углю через Gemini API с Google Search или Discovery Engine.
Использует REST API напрямую (как в Dubai RE Soft Launch).
Поддерживает Discovery Engine для более точного поиска по индексированным источникам.
"""
import os
import json
import time
import requests
from datetime import datetime
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()


def _search_via_discovery_engine(query: str, max_results: int = 10) -> List[Dict]:
    """
    Поиск через Discovery Engine API (если настроен).
    Использует Service Account JSON для OAuth2 аутентификации.
    
    Args:
        query: Поисковый запрос
        max_results: Максимальное количество результатов
        
    Returns:
        Список новостей или пустой список если Discovery Engine не настроен
    """
    project_id = os.getenv("DISCOVERY_ENGINE_PROJECT_ID")
    location = os.getenv("DISCOVERY_ENGINE_LOCATION", "global")
    data_store_id = os.getenv("DISCOVERY_ENGINE_DATA_STORE_ID")
    serving_config_id = os.getenv("DISCOVERY_ENGINE_SERVING_CONFIG_ID", "default_search")
    
    # Путь к Service Account JSON файлу
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not service_account_path:
        # Пробуем найти файл в корне проекта
        from pathlib import Path
        project_root = Path(__file__).parent
        possible_paths = [
            project_root / "becnh-482911-03729a4482e4.json",
            project_root / "service-account.json",
            project_root / "credentials.json"
        ]
        for path in possible_paths:
            if path.exists():
                service_account_path = str(path)
                break
    
    if not all([project_id, data_store_id]):
        return []  # Discovery Engine не настроен
    
    if not service_account_path or not os.path.exists(service_account_path):
        print("⚠️  Service Account JSON не найден. Discovery Engine требует OAuth2 токен.")
        return []
    
    try:
        # Discovery Engine Search API endpoint
        url = f"https://discoveryengine.googleapis.com/v1/projects/{project_id}/locations/{location}/dataStores/{data_store_id}/servingConfigs/{serving_config_id}:search"
        
        # Получаем OAuth2 токен из Service Account JSON
        try:
            from google.oauth2 import service_account
            from google.auth.transport.requests import Request
            
            # Загружаем credentials из JSON файла
            credentials = service_account.Credentials.from_service_account_file(
                service_account_path,
                scopes=['https://www.googleapis.com/auth/cloud-platform']
            )
            
            # Обновляем токен если нужно
            if not credentials.valid:
                credentials.refresh(Request())
            
            access_token = credentials.token
            
        except ImportError:
            print("⚠️  Библиотека google-auth не установлена. Установите: pip install google-auth")
            return []
        except Exception as e:
            print(f"⚠️  Ошибка получения OAuth2 токена: {e}")
            # Fallback: пробуем через gcloud
            import subprocess
            try:
                result = subprocess.run(
                    ["gcloud", "auth", "print-access-token"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    access_token = result.stdout.strip()
                else:
                    print("⚠️  Не удалось получить OAuth2 токен")
                    return []
            except:
                print("⚠️  gcloud не установлен и Service Account не работает")
                return []
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "query": query,
            "pageSize": max_results,
            "queryExpansionSpec": {
                "condition": "AUTO"
            },
            "spellCorrectionSpec": {
                "mode": "AUTO"
            }
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Парсим результаты Discovery Engine
        news_list = []
        if "results" in data:
            for result in data["results"]:
                document = result.get("document", {})
                struct_data = document.get("structData", {})
                
                title = struct_data.get("title") or document.get("title", "")
                url = struct_data.get("link") or document.get("id", "")
                snippet = struct_data.get("snippet") or struct_data.get("htmlSnippet", "")
                
                if title and url:
                    news_list.append({
                        "title": title,
                        "summary": snippet[:500] if snippet else "",
                        "source_name": url.split("/")[2] if "/" in url else "Unknown",
                        "source_url": url,
                        "publication_date": None
                    })
        
        return news_list
        
    except Exception as e:
        print(f"⚠️  Ошибка Discovery Engine: {e}")
        return []


def search_coal_news(max_retries: int = 3) -> List[Dict]:
    """
    Ищет новости по углю за сегодня через Discovery Engine или Gemini с Google Search.
    Сначала пытается использовать Discovery Engine (если настроен), затем fallback на Google Search.
    
    Returns:
        Список словарей с новостями, каждая новость содержит:
        - title: заголовок
        - summary: краткое содержание
        - source_name: название источника
        - source_url: URL источника
        - publication_date: publication date
        
    Raises:
        Exception: Если поиск не удался после всех попыток
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment")
    
    # Проверяем, настроен ли Discovery Engine
    # Пробуем получить project_id из переменной окружения или из Service Account JSON
    project_id = os.getenv("DISCOVERY_ENGINE_PROJECT_ID")
    if not project_id:
        # Пробуем прочитать из Service Account JSON
        from pathlib import Path
        service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not service_account_path:
            possible_paths = [
                Path(__file__).parent / "becnh-482911-03729a4482e4.json",
                Path(__file__).parent / "service-account.json",
                Path(__file__).parent / "credentials.json"
            ]
            for path in possible_paths:
                if path.exists():
                    service_account_path = str(path)
                    break
        
        if service_account_path and os.path.exists(service_account_path):
            try:
                # Используем глобальный импорт json из начала файла
                with open(service_account_path, 'r') as f:
                    sa_data = json.load(f)
                    project_id = sa_data.get('project_id')
                    if project_id:
                        print(f"   📋 Project ID из Service Account: {project_id}")
            except Exception as e:
                print(f"   ⚠️  Не удалось прочитать project_id из Service Account: {e}")
    
    use_discovery_engine = all([
        project_id,
        os.getenv("DISCOVERY_ENGINE_DATA_STORE_ID")
    ])
    
    if use_discovery_engine:
        print("🔍 Использую Discovery Engine для поиска новостей...")
        # Пробуем поиск через Discovery Engine
        today_str = datetime.now().strftime("%Y-%m-%d")
        queries = [
            f"coal prices Australia FOB Newcastle {today_str}",
            f"coal prices Europe CIF ARA {today_str}",
            f"thermal coal market news {today_str}",
            f"coking coal prices {today_str}",
            f"coal export Indonesia {today_str}",
            f"coal export Australia {today_str}"
        ]
        
        all_news = []
        for query in queries:
            news = _search_via_discovery_engine(query, max_results=5)
            all_news.extend(news)
            time.sleep(0.5)  # Небольшая задержка между запросами
        
        if all_news:
            print(f"✅ Найдено {len(all_news)} новостей через Discovery Engine")
            # Обрабатываем результаты через Gemini для создания summary
            return _process_discovery_engine_results(all_news)
        else:
            print("⚠️  Discovery Engine не вернул результатов, переключаюсь на Google Search...")
    
    # Fallback на Google Search через Gemini
    
    # Используем REST API напрямую (как в Dubai RE Soft Launch)
    # Это не требует настройки Vertex AI проекта
    
    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")
    today_full = today.strftime("%B %d, %Y")
    
    system_instruction = """You are a professional coal market news analyst with access to Google Search. Your task is to find the FRESHEST, MOST IMPORTANT AND HIGH-QUALITY coal market news.

CRITICAL SEARCH RULES (MUST FOLLOW):
1. MUST use google_search tool for searching
2. Make MANY DIFFERENT search queries (minimum 10-12), using SPECIFIC terms:
   - "coal prices Australia FOB Newcastle [date]"
   - "coal prices Europe CIF ARA [date]"
   - "thermal coal market news [date]"
   - "coking coal prices [date]"
   - "coal export Indonesia [date]"
   - "coal export Australia [date]"
   - "coal mining production [date]"
   - "coal freight rates [date]"
   - "coal demand China India [date]"
   - "coal supply disruptions [date]"
   - "coal policy regulation [date]"
   - "coal benchmark prices [date]"
3. PRIORITY SOURCES (search first):
   - Reuters, Bloomberg, Financial Times
   - Argus Media, Platts, S&P Global Commodity Insights
   - Trade publications (Hellenic Shipping News, TradeWinds)
   - Industry news sites (GMK Center, Mysteel, Petromindo)
   - Government and regulatory sources
4. SEARCH FOR SPECIFIC NEWS, not general articles:
   - News about specific prices, exports, imports
   - News about specific companies, projects, deals
   - News about policy changes, regulations
   - DO NOT search for general articles about "commodities" or "energy markets"
5. Use ONLY data from found sources - DO NOT invent anything
6. NEVER create news from your head - only from real sources
7. Check source URLs - they must be real and accessible
8. Check publication date - news must be FRESH (today or yesterday, maximum 2 days ago)
9. PRIORITY: freshest, most significant and SPECIFIC coal news

STRICT LIMITATIONS:
- If there are NO real news in search results - return {"news": []}
- DO NOT invent headlines, numbers, events, dates
- DO NOT use general knowledge - ONLY found sources
- DO NOT create "perfect" news - real news may be incomplete
- If you doubt the reality of news - DO NOT include it

PRIORITY SOURCES (search first):
- Reuters, Bloomberg, Financial Times (highest priority)
- Argus Media, Platts, S&P Global Commodity Insights (highest priority)
- Trade publications: Hellenic Shipping News, TradeWinds, Lloyd's List
- Industry news: GMK Center, Mysteel, Petromindo, CoalMint
- Government and regulatory sources
- Regional news outlets (Australia, Indonesia, China, India, Europe)

AVOID:
- General news about "commodities" or "energy markets" without coal specifics
- News about politics/elections, unless directly about coal
- News from website sections (need specific articles)

FORBIDDEN:
- Inventing headlines, numbers, events
- Using information not from sources
- Creating news based on general knowledge"""
    
    prompt = f"""Today is {today_full}. Find the FRESHEST, MOST IMPORTANT AND HIGH-QUALITY coal market news announced in the last 24-48 hours.

MUST USE GOOGLE SEARCH FOR DEEP SEARCH:
- Use google_search tool to search the ENTIRE INTERNET
- Make MANY DIFFERENT SPECIFIC search queries (minimum 10-12):
  1. "coal prices Australia FOB Newcastle {today_str}"
  2. "coal prices Europe CIF ARA {today_str}"
  3. "thermal coal market news {today_str}"
  4. "coking coal prices {today_str}"
  5. "coal export Indonesia {today_str}"
  6. "coal export Australia {today_str}"
  7. "coal mining production news {today_str}"
  8. "coal freight rates shipping {today_str}"
  9. "coal demand China India {today_str}"
  10. "coal supply disruptions {today_str}"
  11. "coal policy regulation {today_str}"
  12. "coal benchmark prices API2 API4 {today_str}"
  
SOURCE PRIORITY:
- Search first: Reuters, Bloomberg, Argus Media, Platts, S&P Global
- Then: Trade publications, industry news sites
- Avoid general news about "commodities" without coal specifics
  
- Search the ENTIRE INTERNET - don't limit to major sources only
- Use ONLY data from found sources
- NEVER invent news
- Priority: freshest and most significant news

Search topics (SPECIFIC news):
1. Coal prices (thermal coal, coking coal) - specific numbers, indices, benchmarks
2. Coal export/import - specific volumes, countries, ports (Australia, Indonesia, China, India, Europe)
3. Coal mining and production - specific companies, projects, volumes
4. Coal freight and logistics - specific rates, routes, ports
5. Policy and regulation - specific decisions, rule changes
6. Demand and supply - specific numbers, forecasts, changes
7. Deals and contracts - specific companies, volumes, prices
8. Infrastructure - specific projects, ports, terminals

AVOID:
- General articles about "commodities" or "energy markets"
- News about politics/elections without coal connection
- Theoretical articles without specific facts

For EACH REAL news from sources (ONLY from found sources):
- title: EXACT headline from source (copy verbatim)
- summary: REAL content from source (2-3 sentences, MUST include specific numbers, prices, volumes, percentages, dates - NO vague phrases like "limited activity" or "not mentioned")
- source_name: real source name (any valid source from internet)
- source_url: REAL URL of SPECIFIC ARTICLE from search (NOT website section, but specific article with full URL, e.g. https://www.reuters.com/business/energy/coal-prices-rise-2024-01-15/)
- publication_date: "{today_str}" ONLY if event happened today and it's mentioned in source, otherwise null

CRITICAL REQUIREMENTS FOR SUMMARY:
- MUST include specific numbers: prices (USD/ton), volumes (million tons), percentages (%), dates
- MUST include concrete facts: company names, port names, specific countries, exact figures
- DO NOT use vague phrases: "limited activity", "not mentioned", "under observation", "no significant", "minimal", "expected", "likely"
- If article doesn't have specific numbers - DO NOT include this news (skip it)
- Summary must be at least 100 characters and contain real data

IMPORTANT: source_url must be URL of SPECIFIC ARTICLE, not website section (not /business/energy/, but full article URL)

Return ONLY JSON:
{{
    "news": [{{
        "title": "REAL headline from source (verbatim)",
        "summary": "REAL content from source (facts from article)",
        "source_name": "Source name",
        "source_url": "https://full-url-of-specific-article-from-search",
        "publication_date": "{today_str}" or null
    }}]
}}

CRITICALLY IMPORTANT FOR source_url:
- Must be URL of SPECIFIC ARTICLE, not website section
- Examples of CORRECT URLs:
  ✅ https://www.reuters.com/business/energy/coal-prices-rise-asia-2024-01-15/
  ✅ https://www.bloomberg.com/news/articles/2024-01-15/indonesia-coal-exports
  ✅ https://www.ft.com/content/abc123def456
- Examples of INCORRECT URLs (DO NOT use):
  ❌ https://www.reuters.com/business/energy/
  ❌ https://www.bloomberg.com/news/energy
  ❌ https://www.ft.com/energy
- If search results only show sections - DO NOT include such news

CRITICALLY IMPORTANT:
- If there are NO real news in sources with SPECIFIC DATA (numbers, prices, volumes) - return {{"news": []}}
- DO NOT invent news - ONLY from search
- DO NOT use general knowledge - ONLY found sources
- DO NOT include news without specific numbers, prices, or concrete facts
- Check URLs - they must be real and accessible
- If you doubt the reality of news - DO NOT include it
- If news looks "too perfect" or "too complete" without source - it's a sign of invented news
- If news has only vague phrases without numbers - DO NOT include it
- Better return empty array than vague or invented news"""
    
    for attempt in range(max_retries):
        try:
            # Используем REST API напрямую (как в Dubai RE Soft Launch)
            # Это работает без настройки Vertex AI проекта
            model_name = "gemini-2.0-flash-exp"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            
            payload = {
                "systemInstruction": {
                    "parts": [{"text": system_instruction}]
                },
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.1,  # Низкая температура для точности
                    "topK": 1,
                    "topP": 0.1
                },
                "tools": [{
                    "googleSearch": {}
                }]
            }
            headers = {"Content-Type": "application/json"}
            
            print(f"   Отправляю запрос к Gemini API (это может занять 30-60 секунд)...")
            response = requests.post(url, json=payload, headers=headers, timeout=90)
            response.raise_for_status()
            data = response.json()
            print(f"   ✅ Получен ответ от Gemini API")
            
            # Извлекаем текст из ответа
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    response_text = candidate['content']['parts'][0].get('text', '')
                else:
                    response_text = str(data)
            else:
                response_text = str(data)
            
            # Проверяем, что поиск сработал
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                if 'groundingMetadata' in candidate:
                    print("✅ Google Search выполнен успешно!")
                    if 'searchEntryPoint' in candidate['groundingMetadata']:
                        print(f"   Использованные запросы: {candidate['groundingMetadata']['searchEntryPoint']}")
            
            # Извлекаем текст из ответа
            response_text = response_text.strip()
            
            # Убираем markdown код блоки если есть
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Пытаемся найти JSON в ответе
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_text = response_text[json_start:json_end]
            else:
                json_text = response_text
            
            # Парсим JSON из текста ответа
            parsed_data = json.loads(json_text)
            news_list = parsed_data.get("news", [])
            
            # Извлекаем реальные URL из groundingMetadata/citations (Gemini возвращает "заземленные" ссылки)
            citations_map = {}  # Маппинг заголовков/текста к реальным URL
            # Используем оригинальный data из response.json() для citations
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                if 'groundingMetadata' in candidate:
                    grounding = candidate.get('groundingMetadata', {})
                    
                    # Извлекаем citations (список источников с реальными URL)
                    if 'groundingChunks' in grounding:
                        for chunk in grounding.get('groundingChunks', []):
                            if 'web' in chunk:
                                web_data = chunk.get('web', {})
                                uri = web_data.get('uri', '')
                                title = web_data.get('title', '')
                                if uri and uri not in citations_map.values():
                                    # Используем title как ключ для маппинга
                                    if title:
                                        citations_map[title.lower()] = uri
                                    # Также добавляем по домену
                                    from urllib.parse import urlparse
                                    domain = urlparse(uri).netloc
                                    if domain:
                                        citations_map[domain.lower()] = uri
                    
                    # Также проверяем searchEntryPoint для дополнительных URL
                    if 'searchEntryPoint' in grounding:
                        entry_point = grounding.get('searchEntryPoint', {})
                        rendered_content = entry_point.get('renderedContent', '')
                        # Можем извлечь URL из renderedContent если нужно
            
            # Валидация структуры - проверяем, что новости реальные (но принимаем любые валидные источники)
            valid_news = []
            for item in news_list:
                if isinstance(item, dict) and "title" in item and "summary" in item:
                    source_url = item.get("source_url", "")
                    source_name = item.get("source_name", "Unknown")
                    title = item.get("title", "")
                    
                    # Пытаемся найти реальный URL в citations (если Gemini вернул "заземленные" ссылки)
                    if source_url and "vertexaisearch.cloud.google.com/grounding-api-redirect" in source_url:
                        # Пробуем найти в citations по заголовку или домену
                        title_lower = title.lower()
                        source_name_lower = source_name.lower()
                        
                        # Ищем по заголовку
                        for key, real_url in citations_map.items():
                            if key in title_lower or key in source_name_lower:
                                source_url = real_url
                                print(f"   🔗 Найден реальный URL из citations: {real_url[:60]}...")
                                break
                        
                        # Если не нашли в citations, пытаемся развернуть редирект
                        if "vertexaisearch.cloud.google.com/grounding-api-redirect" in source_url:
                            try:
                                head_response = requests.head(source_url, allow_redirects=True, timeout=5)
                                if head_response.url and head_response.url != source_url:
                                    real_url = head_response.url
                                    print(f"   🔗 Развернут редирект: {real_url[:60]}...")
                                    source_url = real_url
                            except Exception as e:
                                print(f"   ⚠️  Не удалось развернуть редирект: {e}")
                                pass
                    
                    # Проверяем, что URL выглядит реальным
                    if source_url and (source_url.startswith("http://") or source_url.startswith("https://")):
                        # Фильтруем только явно фейковые/тестовые источники
                        invalid_patterns = [
                            "example.com", "test.com", "localhost", "127.0.0.1",
                            "placeholder", "dummy", "fake", "mock", "none", "null"
                        ]
                        url_lower = source_url.lower()
                        source_lower = source_name.lower()
                        
                        # Проверяем, что это не фейковый источник
                        is_fake = any(pattern in url_lower or pattern in source_lower for pattern in invalid_patterns)
                        
                        if not is_fake:
                            # ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: Валидируем URL (проверяем, что он доступен)
                            # Но делаем это быстро, чтобы не замедлять поиск
                            try:
                                from url_validator import validate_news_url
                                is_valid, error_msg = validate_news_url(source_url, timeout=5)
                                if is_valid:
                                    valid_news.append({
                                        "title": item.get("title", ""),
                                        "summary": item.get("summary", ""),
                                        "source_name": source_name,
                                        "source_url": source_url,
                                        "publication_date": item.get("publication_date", today_str)
                                    })
                                else:
                                    print(f"⚠️  Пропущена новость с битой ссылкой: {source_name} ({source_url[:50]}...) - {error_msg}")
                            except Exception as e:
                                # Если валидация не удалась, пропускаем новость (безопаснее)
                                print(f"⚠️  Не удалось проверить URL {source_url[:50]}...: {e}")
                                print(f"   ⚠️  Пропускаем новость (безопаснее не публиковать без проверки)")
                        else:
                            print(f"⚠️  Пропущена новость из фейкового источника: {source_name} ({source_url[:50]}...)")
                    else:
                        print(f"⚠️  Пропущена новость без валидного URL: {item.get('title', '')[:50]}")
            
            if len(valid_news) == 0 and attempt == max_retries - 1:
                print(f"⚠️  Новостей по углю за последние 24-48 часов не найдено")
            
            if valid_news:
                print(f"✅ Найдено {len(valid_news)} новостей по углю через Google Search")
            else:
                print(f"ℹ️  Новости по углю не найдены через Google Search")
            
            return valid_news
            
        except json.JSONDecodeError as e:
            print(f"⚠️  Ошибка парсинга JSON (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f"⚠️  Не удалось распарсить JSON. Ответ: {response_text[:200] if 'response_text' in locals() else 'N/A'}")
                return []
        except Exception as e:
            error_str = str(e).lower()
            error_full = str(e)
            
            if attempt == 0:
                print(f"🔍 Диагностика ошибки: {error_full[:300]}")
            
            if "search tool" in error_str or "google_search" in error_str or "not supported" in error_str or "unknown field" in error_str:
                print(f"⚠️  Google Search не доступен!")
                print(f"📋 Включите API 'Vertex AI Search and Conversation' в Google Cloud Console:")
                print(f"   https://console.cloud.google.com/apis/library/discoveryengine.googleapis.com?project={os.getenv('VERTEX_AI_PROJECT_ID', 'your-project')}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    print(f"   Возвращаю пустой массив (не могу искать без Google Search)")
                    return []
            
            print(f"❌ Ошибка поиска новостей (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise Exception(f"Не удалось найти новости после {max_retries} попыток: {e}") from e
    
    return []


def select_best_news(news_list: List[Dict]) -> Optional[Dict]:
    """
    Выбирает самую топовую новость из списка.
    
    Критерии приоритета:
    1. Свежесть (сегодня > вчера > позавчера)
    2. Значимость (ключевые слова, важность темы)
    3. Качество источника (надежные источники выше)
    4. Наличие URL и изображения
    5. Длина и детальность summary
    
    Args:
        news_list: Список новостей
        
    Returns:
        Самая топовая новость или None если список пустой
    """
    if not news_list:
        return None
    
    # Фильтруем новости с валидными данными и КОНКРЕТНЫМИ фактами
    import re
    valid_news = []
    for n in news_list:
        if not (n.get("title") and n.get("summary") and len(n.get("summary", "")) > 50):
            continue
        
        # СТРОГАЯ ПРОВЕРКА: новость должна содержать конкретные данные
        title = n.get("title", "")
        summary = n.get("summary", "")
        text = (title + " " + summary).lower()
        
        # Должны быть цифры (цены, объемы, проценты, даты)
        has_numbers = bool(re.search(r'\d+', text))
        
        # Должны быть конкретные факты (не общие фразы)
        vague_phrases = [
            "limited activity", "no significant", "not mentioned", "under observation",
            "paused", "minimal", "general", "expected", "likely", "potential"
        ]
        has_vague_only = all(phrase in text for phrase in vague_phrases[:2]) and not has_numbers
        
        # Должна быть достаточная длина summary (минимум 100 символов для качественной новости)
        if len(summary) < 100:
            continue
        
        # Пропускаем новости без конкретных данных
        if not has_numbers and has_vague_only:
            print(f"⚠️  Пропущена новость без конкретных данных: {title[:60]}...")
            continue
        
        valid_news.append(n)
    
    if not valid_news:
        print("⚠️  Нет новостей с конкретными данными")
        return None
    
    # Ключевые слова для определения важности новости
    important_keywords = [
        "price", "prices", "export", "import", "demand", "supply",
        "record", "surge", "rise", "fall", "policy", "regulation",
        "mining", "production", "freight", "shipping", "trade",
        "china", "india", "australia", "indonesia", "europe",
        "thermal coal", "coking coal", "benchmark", "index"
    ]
    
    # Надежные источники (выше приоритет)
    premium_sources = [
        "reuters", "bloomberg", "financial times", "ft.com",
        "argus", "platts", "spglobal", "s&p global"
    ]
    
    def priority_score(news):
        score = 0
        
        # 1. Свежесть (сегодня = +100, вчера = +50, позавчера = +25)
        pub_date = news.get("publication_date", "")
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        if pub_date == today:
            score += 100
        elif pub_date:
            score += 50
        
        # 2. Значимость (ключевые слова в заголовке и summary)
        title_lower = news.get("title", "").lower()
        summary_lower = news.get("summary", "").lower()
        text_lower = title_lower + " " + summary_lower
        
        keyword_count = sum(1 for keyword in important_keywords if keyword in text_lower)
        score += keyword_count * 10  # Каждое ключевое слово = +10
        
        # 2.1. Бонус за прогнозы и outlook (высоко ценятся)
        outlook_keywords = ["outlook", "forecast", "forecast", "prediction", "expect", "projection", "trend"]
        if any(keyword in text_lower for keyword in outlook_keywords):
            score += 10  # Бонус за прогнозы
        
        # 3. Качество источника
        source_name = news.get("source_name", "").lower()
        source_url = news.get("source_url", "").lower()
        if any(premium in source_name or premium in source_url for premium in premium_sources):
            score += 50
        
        # 4. Наличие URL
        if news.get("source_url"):
            score += 30
        
        # 5. Длина и детальность summary (но не слишком длинная)
        summary_len = len(news.get("summary", ""))
        if 100 <= summary_len <= 500:
            score += min(summary_len // 10, 30)  # До +30 за оптимальную длину
        
        # 6. Бонус за наличие цифр и конкретики (признак качественной новости)
        import re
        text_for_numbers = news.get("title", "") + " " + news.get("summary", "")
        numbers_count = len(re.findall(r'\d+', text_for_numbers))
        if numbers_count > 0:
            score += min(numbers_count * 5, 50)  # До +50 за множественные цифры
        
        # 7. Штраф за общие фразы без конкретики
        vague_phrases = ["not mentioned", "no significant", "limited activity", "under observation"]
        text_lower_vague = text_lower
        vague_count = sum(1 for phrase in vague_phrases if phrase in text_lower_vague)
        if vague_count >= 2 and numbers_count == 0:
            score -= 30  # Штраф за слишком общие новости
        
        return score
    
    # Сортируем по приоритету и берем самую топовую
    scored_news = [(priority_score(n), n) for n in valid_news]
    scored_news.sort(reverse=True, key=lambda x: x[0])
    
    best = scored_news[0][1]
    best_score = scored_news[0][0]
    
    # Сохраняем score в новости для использования в main.py
    best['_score'] = best_score
    
    print(f"📰 Выбрана самая топовая новость (score: {best_score}): {best.get('title', '')[:60]}...")
    if len(scored_news) > 1:
        print(f"   Всего найдено {len(valid_news)} новостей, выбрана лучшая")
    
    return best


def _process_discovery_engine_results(news_list: List[Dict]) -> List[Dict]:
    """
    Обрабатывает результаты Discovery Engine через Gemini для создания качественных summary.
    
    Args:
        news_list: Список новостей из Discovery Engine
        
    Returns:
        Обработанный список новостей с улучшенными summary
    """
    if not news_list:
        return []
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return news_list  # Возвращаем как есть, если нет API ключа
    
    try:
        # Используем Gemini для улучшения summary
        model_name = "gemini-2.0-flash-exp"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        # Формируем промпт для обработки новостей
        news_text = "\n\n".join([
            f"Title: {n.get('title', '')}\nURL: {n.get('source_url', '')}\nSnippet: {n.get('summary', '')}"
            for n in news_list[:10]  # Обрабатываем максимум 10 новостей
        ])
        
        prompt = f"""Process these coal market news from Discovery Engine. For each news item, create a concise summary (2-3 sentences) that includes:
- Specific numbers, prices, volumes, percentages if mentioned
- Concrete facts: company names, port names, countries, exact figures
- NO vague phrases like "limited activity" or "not mentioned"

Return JSON array with improved summaries:
{{
    "news": [{{
        "title": "original title",
        "summary": "improved summary with specific data",
        "source_name": "extracted from URL",
        "source_url": "original URL",
        "publication_date": null
    }}]
}}

News items:
{news_text}"""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 1,
                "topP": 0.1
            }
        }
        
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=60)
        response.raise_for_status()
        data = response.json()
        
        if 'candidates' in data and len(data['candidates']) > 0:
            response_text = data['candidates'][0]['content']['parts'][0].get('text', '')
            
            # Парсим JSON
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_text = response_text[json_start:json_end]
                processed_data = json.loads(json_text)
                return processed_data.get("news", news_list)
        
        return news_list
        
    except Exception as e:
        print(f"⚠️  Ошибка обработки результатов Discovery Engine: {e}")
        return news_list

