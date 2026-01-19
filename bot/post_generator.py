"""
Модуль для создания аналитических постов по углю через OpenRouter API (Claude 3.5 Haiku).
Использует промпт из Coal daily.json для создания Telegram-форматированных анализов.
"""
import os
import time
import requests
from typing import Dict


def create_coal_analysis(news: Dict, max_retries: int = 3) -> str:
    """
    Создает аналитический пост по углю в формате Telegram HTML.
    Использует промпт из Coal daily.json.
    
    Args:
        news: Словарь с данными новости (title, summary, source_name, source_url)
        max_retries: Максимальное количество попыток при ошибке
        
    Returns:
        Текст поста в формате Telegram HTML
        
    Raises:
        Exception: Если создание поста не удалось после всех попыток
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set in environment")
    
    # Используем OpenRouter API для доступа к Claude
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Промпт из Coal daily.json (улучшенный для строгого контроля длины и специфики угольного рынка)
    system_prompt = """You are Bench Energy — a leading global coal market expert with 15+ years of experience in commodities trading, supply chain analysis, and market forecasting. You provide expert market intelligence that explains deeper implications of coal market news.

Produce high-density analytical updates for a Telegram channel with comprehensive expert opinion. MAXIMUM 800 characters (before adding category header and hashtags) to fit Telegram's 1024-character caption limit with HTML tags. The expanded Bench Energy Expert View section should be ~200-250 characters.

CATEGORY CLASSIFICATION:
First, determine the PRIMARY category of the news:
• ⛏ COAL: thermal coal, coking coal, steam coal, anthracite, bituminous (use #Coal)
• ⚡️ ENERGY: general energy, power, electricity, renewables (use #Energy)
• 🚢 LOGISTICS: freight, shipping, ports, vessels (use #Logistics)
• 🔩 STEEL: steel production, metallurgical coal, iron ore (use #Steel)
• 📊 MARKETS: general market analysis, commodities overview (use #Markets)

If news is multi-category, choose the PRIMARY category based on most frequent mentions. For coal-related news, prioritize #Coal.

FORMAT RULES:
• Output must be valid Telegram HTML.
• DO NOT use <br>. Only blank lines between sections.
• Allowed tags: <b>, <i>, <u>, <s>, <a>, <code>, <pre>, <blockquote>.
• LENGTH: STRICT LIMIT - 800 characters for main content (before category header and source link). Count characters carefully! The expanded Bench Energy Expert View is part of this limit.
• English only.
• Use emojis in section headers.
• Every word must add value - remove filler words.

OUTPUT STRUCTURE (FOLLOW EXACTLY - MAX CHARACTERS PER SECTION):

<b>EMOJI [CATEGORY] | Headline</b>
Format: EMOJI [CATEGORY] | Short title (max 6 words, ~50 chars)
Examples:
⛏ [COAL] | Australian coal prices hit record high
⚡️ [ENERGY] | Power demand surges in Europe
🚢 [LOGISTICS] | Freight rates spike on tight capacity

<b>📌 Key facts</b>
• 2 bullets max, 15-20 words each (~100 chars total)
• Focus: prices (USD/t), volumes (mt), percentages, specific ports/regions

<b>🌍 Market impact</b>
• 2 bullets max, 12-15 words each (~80 chars total)
• Regions: AU (Newcastle/Gladstone), Indo (Kalimantan), China (Qinhuangdao), India (Mundra), EU (ARA)

<b>💲 Price implications</b>
• Format: "AU: up/down/stable (reason in 8 words)" - one line per mentioned market (~120 chars)
• Only include markets mentioned in source. If not mentioned: "Not in source"

<b>🚢 Freight impact</b>
• 1 bullet, 10-12 words (~50 chars)
• If not mentioned: "• No freight data in source"

<b>🧭 Bench Energy Expert View</b>
EXPANDED SECTION - Provide comprehensive expert opinion (~200-250 chars total):
• What this means (1-2 sentences): Explain the deeper significance and implications
• Market impact (1-2 bullets): Price, supply chain, regional effects with specific timelines
• Risks & opportunities (1 bullet): What could go wrong and what opportunities exist
• Focus on: 1-3 week outlook, specific markets/regions mentioned, real market implications

HASHTAGS SECTION (at the end, ~80 chars):
Generate 4-6 thematic hashtags based on content:
• Primary category tag: #Coal, #Energy, #Logistics, #Steel, or #Markets (REQUIRED)
• Commodity-specific: #ThermalCoal, #CokingCoal, #Steel, etc.
• Regional: #Australia, #China, #Europe, #India, etc.
• Market: #Markets, #Commodities, #Freight, etc.
• Brand: #BenchEnergy (always include)

ALLOWED TAGS (use only these - DO NOT invent):
#Coal #Energy #Logistics #Steel #Markets #ThermalCoal #CokingCoal #Commodities #Freight #BenchEnergy
#Australia #China #India #Europe #Indonesia #SouthAfrica #USA
#FOB #CIF #Newcastle #Gladstone #RichardsBay #ARA #Qinhuangdao

Format: #Coal #ThermalCoal #Australia #Markets #BenchEnergy

Source link:
<a href="SOURCE_URL">Source: SOURCE_NAME</a>

COAL MARKET SPECIFICITY:
• Thermal coal: AU-6000, Indo-4200, ZA-6000, EU-CIF ARA, API2, API4
• Coking coal: Premium HCC, PCI, semi-soft
• Freight: Panamax (75k dwt), Supramax (58k dwt), Capesize (180k dwt)
• Ports: Newcastle, Gladstone, Kalimantan, Qinhuangdao, Mundra, ARA
• Use specific price levels, volumes, and percentages when available

STYLE:
• Professional, analytical, ultra-concise.
• Focus on mechanisms and market drivers.
• No rewriting - only analysis.
• No disclaimers, greetings, or source names in text.

CRITICAL RULES - STRICTLY FOLLOW:
• Use ONLY information from the news article - NO external knowledge
• If data not in source: write "Not in source" or "No data provided"
• DO NOT invent prices, volumes, dates, or forecasts
• DO NOT add geopolitical analysis unless in source
• For Price implications: Only markets mentioned. Format: "Market: direction (8-word reason)"
• For Freight: Only if mentioned. Format: "• Vessel type: impact (10 words)"
• For Bench Energy Expert View: Provide detailed expert analysis - explain what this means, market impacts, risks/opportunities. Use your expertise to interpret the news significance, but base insights on article facts
• If news is limited, keep analysis limited - DO NOT expand
• COUNT CHARACTERS: Category header ~50 + Facts ~100 + Impact ~80 + Price ~120 + Freight ~50 + Expert View ~250 + Hashtags ~80 = ~730 chars base
• Leave ~70 chars for variations and source link (~30 chars) = TOTAL ~800 chars max (still under 1024 limit)
• Category header and hashtags are ADDITIONAL to the 700 chars limit, but total must stay under 1024
• BE RUTHLESSLY CONCISE - every character counts!
• Remove articles (a/an/the) when possible, use abbreviations (AU, EU, mt, USD/t)
• Focus on NUMBERS and SPECIFIC FACTS only - skip general statements"""
    
    # Формируем текст новости для анализа
    news_title = news.get('title', '')
    news_summary = news.get('summary', '')
    source_name = news.get('source_name', 'Unknown')
    source_url = news.get('source_url', '')
    
    news_text = f"""Title: {news_title}

Summary: {news_summary}

Source: {source_name}
URL: {source_url}"""
    
    user_prompt = f"""Here is the news article. Using the system rules, create a Telegram-ready HTML analysis:

{news_text}

CRITICAL INSTRUCTIONS:
1. First, determine the PRIMARY category (Coal, Energy, Logistics, Steel, or Markets)
2. Start with: <b>EMOJI [CATEGORY] | Headline</b> (e.g., ⛏ [COAL] | Australian prices surge)
3. Use ONLY allowed hashtags from the list - DO NOT invent new tags
4. At the end, after hashtags, add the source link:
<a href="{source_url}">Source: {source_name}</a>
5. Total length must be under 1024 characters including category header, content, hashtags, and source link"""
    
    backoff = 1
    last_error = None
    
    payload = {
        "model": "anthropic/claude-3.5-haiku",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 1600,
        "temperature": 1
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            result = data['choices'][0]['message']['content'].strip()
            
            # КРИТИЧНО: Обрезаем пост ДО добавления ссылки, чтобы поместился в caption (1024 символа)
            # Учитываем: категория в заголовке (~50), хештеги (~80), ссылка (~30) = ~160 символов
            # Расширенное экспертное мнение теперь ~250 символов вместо ~80
            MAX_LENGTH = 950  # Оставляем ~74 символа для категории, хештегов и ссылки (расширенное экспертное мнение учтено)
            if len(result) > MAX_LENGTH:
                print(f"   ⚠️  Пост слишком длинный ({len(result)} символов), обрезаю до {MAX_LENGTH}...")
                # Пытаемся обрезать по последнему полному предложению или параграфу
                text_to_trim = result[:MAX_LENGTH]
                last_period = text_to_trim.rfind('.')
                last_newline = text_to_trim.rfind('\n')
                last_tag_close = text_to_trim.rfind('>')
                cut_point = max(last_period, last_newline, last_tag_close)
                if cut_point > 600:  # Если нашли хорошую точку обрезки
                    result = result[:cut_point + 1]
                else:
                    result = result[:MAX_LENGTH] + "..."
                print(f"   ✅ Пост обрезан до {len(result)} символов")
            
            # ВСЕГДА добавляем ссылку на источник (если есть URL и название)
            if source_url and source_name:
                source_link = f'<a href="{source_url}">Source: {source_name}</a>'
                # Проверяем, есть ли уже ссылка
                if source_link not in result and f"Source: {source_name}" not in result:
                    # Добавляем ссылку в конец, после хэштегов
                    result = result.rstrip() + f"\n\n{source_link}"
                    # Проверяем финальную длину
                    if len(result) > 1024:
                        print(f"   ⚠️  Финальный пост слишком длинный ({len(result)} символов), обрезаю ссылку...")
                        # Обрезаем сам пост еще больше, чтобы поместилась ссылка
                        available_length = 1024 - len(source_link) - 10  # 10 символов запас
                        if len(result) - len(source_link) - 2 > available_length:
                            result = result[:available_length].rstrip() + f"\n\n{source_link}"
            else:
                print(f"⚠️  Нет URL или названия источника, ссылка не добавлена")
            
            # Финальная проверка длины
            if len(result) > 1024:
                print(f"   ⚠️  ФИНАЛЬНАЯ проверка: пост все еще слишком длинный ({len(result)} символов), обрезаю до 1020...")
                result = result[:1020] + "..."
            
            return result
            
        except Exception as e:
            last_error = e
            if attempt < max_retries - 1:
                wait_time = backoff * (2 ** attempt)
                print(f"Ошибка создания поста (попытка {attempt + 1}/{max_retries}): {e}. Ожидание {wait_time} секунд...")
                time.sleep(wait_time)
            else:
                raise Exception(f"Не удалось создать пост после {max_retries} попыток: {last_error}") from last_error
    
    raise Exception(f"Не удалось создать пост: {last_error}")


def _is_valid_source(source_url: str, source_name: str) -> bool:
    """
    Проверяет, что источник валидный и не является фейковым/тестовым.
    
    Args:
        source_url: URL источника
        source_name: Название источника
        
    Returns:
        True если источник валидный, False иначе
    """
    if not source_url or not source_name:
        return False
    
    # Проверяем, что URL валидный
    if not (source_url.startswith("http://") or source_url.startswith("https://")):
        return False
    
    # Проверяем, что это не тестовый/фейковый URL
    invalid_patterns = [
        "example.com",
        "test.com",
        "localhost",
        "127.0.0.1",
        "placeholder",
        "dummy",
        "fake",
        "mock"
    ]
    
    source_url_lower = source_url.lower()
    for pattern in invalid_patterns:
        if pattern in source_url_lower:
            return False
    
    # Проверяем, что источник из разрешенного списка
    allowed_domains = [
        "reuters.com",
        "bloomberg.com",
        "ft.com",
        "argusmedia.com",
        "spglobal.com",
        "platts.com",
        "s&p global",
        "financial times",
        "mysteel.net",
        "mysteel.com",
        "hellenicshippingnews.com",
        "tradewinds.com",
        "lloydslist.com",
        "gmk.center",
        "petromindo.com",
        "coalint.com",
        "chinadaily.com",
        "jakartaglobe.id",
        "zawya.com"
    ]
    
    source_name_lower = source_name.lower()
    url_lower = source_url_lower
    
    # Проверяем, что домен или название источника в разрешенном списке
    is_valid = any(domain in url_lower or domain in source_name_lower for domain in allowed_domains)
    
    return is_valid

