"""
Модуль для генерации двух версий поста (Telegram, Web) через Claude 3.5.
LinkedIn версия отключена.
"""
import os
import requests
import time
from typing import Dict
from dotenv import load_dotenv

load_dotenv()


def generate_post_versions(news: Dict, max_retries: int = 3) -> Dict[str, str]:
    """
    Генерирует две версии поста через Claude 3.5 (Telegram и Web).
    LinkedIn версия отключена.
    
    Args:
        news: Словарь с данными новости
        max_retries: Максимальное количество попыток
        
    Returns:
        Словарь с ключами: tg_version, web_version
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set in environment")
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    news_title = news.get('title', '')
    news_summary = news.get('summary', '')
    source_name = news.get('source_name', 'Unknown')
    source_url = news.get('source_url', '')
    
    system_prompt = """You are Bench Energy — a senior global commodities analyst.

Generate TWO versions of the same news analysis for different platforms. Return ONLY valid JSON.

OUTPUT FORMAT (strict JSON, no markdown):
{
    "tg_version": "Telegram version: short, emojis, HTML tags, max 1024 chars with source link",
    "web_version": "Web version: full HTML with headings, paragraphs, structured content"
}

TELEGRAM VERSION (tg_version):
- Format: <b>⛏ [COAL] | Headline</b> + content + Bench Energy Expert View + hashtags + source link
- Max 1024 characters total (including HTML tags and source link)
- Use HTML: <b>, <i>, <a>
- Include category emoji and tag: ⛏ [COAL], ⚡️ [ENERGY], etc.
- MUST include Bench Energy Expert View section before hashtags:
  <b>🧭 Bench Energy Expert View</b>
  • What this means: 1-2 sentences explaining deeper significance and implications
  • Market impact: Price, supply chain, regional effects with specific timelines (1-2 bullets)
  • Risks & opportunities: What could go wrong and what opportunities exist (1 bullet)
  Keep expert section concise (~200-250 characters total) to fit within 1024 char limit
- End with: #Coal #ThermalCoal #Australia #Markets #BenchEnergy
- Source: <a href="URL">Source: Name</a>

WEB VERSION (web_version):
- Full HTML article structure
- Use: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, <strong>, <em>
- Include structured headings
- Rich formatting for readability
- MUST include Bench Energy Expert View section at the end:
  <h3>Bench Energy Expert View</h3>
  <p><strong>What this means:</strong> 2-3 sentences explaining deeper significance and implications</p>
  <p><strong>Market impact:</strong> Price, supply chain, regional effects with specific timelines</p>
  <ul>
    <li>Price implications: Which markets/regions will see movements?</li>
    <li>Supply chain effects: Logistics, ports, shipping impacts</li>
    <li>Regional dynamics: China, India, Australia, Indonesia effects</li>
  </ul>
  <p><strong>Risks & Opportunities:</strong> What could go wrong and what opportunities exist</p>
- Be comprehensive but concise (800-1200 characters for expert section)"""

    user_prompt = f"""Generate two platform-specific versions of this coal market news:

Title: {news_title}

Summary: {news_summary}

Source: {source_name}
URL: {source_url}

Return ONLY the JSON object with tg_version and web_version."""
    
    payload = {
        "model": "anthropic/claude-3.5-haiku",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.7
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=90)
            response.raise_for_status()
            data = response.json()
            
            result = data['choices'][0]['message']['content'].strip()
            
            # Парсим JSON из ответа
            import json
            # Убираем markdown код блоки если есть
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            result = result.strip()
            
            # Извлекаем JSON
            json_start = result.find("{")
            json_end = result.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_text = result[json_start:json_end]
                versions = json.loads(json_text)
                
                # Проверяем наличие всех версий
                if "tg_version" in versions and "web_version" in versions:
                    print(f"✅ Две версии поста сгенерированы (Telegram, Web)")
                    return versions
                else:
                    print(f"⚠️  Не все версии найдены в ответе")
                    # Пробуем создать недостающие версии
                    if "tg_version" not in versions:
                        # Извлекаем текст из web_version для Telegram версии
                        import re
                        web_text = versions.get("web_version", "")
                        # Убираем HTML теги для Telegram версии
                        clean_text = re.sub(r'<[^>]+>', '', web_text)
                        versions["tg_version"] = f"<b>⛏ [COAL] | {news_title}</b>\n\n{clean_text[:800]}...\n\n#Coal #Markets #BenchEnergy\n<a href=\"{source_url}\">Source: {source_name}</a>"
                    if "web_version" not in versions:
                        versions["web_version"] = f"<h1>{news_title}</h1><p>{news_summary}</p>"
                    return versions
            else:
                raise ValueError("JSON не найден в ответе")
                
        except json.JSONDecodeError as e:
            print(f"⚠️  Ошибка парсинга JSON (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                # Fallback: создаем версии вручную
                print(f"⚠️  Использую fallback версии")
                # Для Telegram версии добавляем экспертное мнение
                expert_view = "\n\n<b>🧭 Bench Energy Expert View</b>\n• Market analysis based on current trends\n• Regional impact assessment\n• Key risks and opportunities"
                tg_content = f"<b>⛏ [COAL] | {news_title}</b>\n\n{news_summary[:600]}{expert_view}\n\n#Coal #Markets #BenchEnergy\n<a href=\"{source_url}\">Source: {source_name}</a>"
                # Обрезаем если превышает 1024 символа
                if len(tg_content) > 1024:
                    tg_content = f"<b>⛏ [COAL] | {news_title}</b>\n\n{news_summary[:500]}{expert_view}\n\n#Coal #Markets #BenchEnergy\n<a href=\"{source_url}\">Source: {source_name}</a>"
                    if len(tg_content) > 1024:
                        # Еще больше обрезаем
                        tg_content = f"<b>⛏ [COAL] | {news_title}</b>\n\n{news_summary[:400]}{expert_view}\n\n#Coal #Markets #BenchEnergy\n<a href=\"{source_url}\">Source: {source_name}</a>"
                return {
                    "tg_version": tg_content[:1024],
                    "web_version": f"<h1>{news_title}</h1><p>{news_summary}</p><h3>Bench Energy Expert View</h3><p><strong>What this means:</strong> Analysis of market implications.</p><p><strong>Market impact:</strong> Regional and price effects.</p><p><strong>Risks & Opportunities:</strong> Key factors to watch.</p>"
                }
        except Exception as e:
            print(f"❌ Ошибка генерации версий (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise Exception(f"Не удалось сгенерировать версии после {max_retries} попыток: {e}") from e
    
    raise Exception("Не удалось сгенерировать версии поста")


def generate_freight_post(max_retries: int = 3) -> Dict[str, str]:
    """
    Генерирует специальный пост о проблемах фрахта для bulk трейдинг компаний через Claude 3.5.
    Создает контент самостоятельно, без примеров, в стиле канала.
    Избегает дублей, генерируя новые темы каждый раз.
    
    Args:
        max_retries: Максимальное количество попыток
        
    Returns:
        Словарь с ключами: tg_version, web_version, topic
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set in environment")
    
    # Получаем список уже опубликованных тем
    from storage import get_published_freight_topics
    published_topics = get_published_freight_topics()
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Список возможных тем для вариативности
    freight_topics = [
        "freight rate volatility and market unpredictability",
        "vessel availability shortages during peak seasons",
        "port congestion and queuing delays",
        "route optimization challenges and longer transit times",
        "seasonal disruptions (monsoons, ice, storms)",
        "geopolitical risks affecting shipping lanes",
        "fuel cost fluctuations impacting freight rates",
        "charter market tightness and vessel scarcity",
        "demurrage and detention cost escalation",
        "multi-port discharge complexity and delays",
        "weather-related port closures",
        "infrastructure bottlenecks at key terminals",
        "crew shortage and vessel operational issues",
        "regulatory compliance delays at ports",
        "cargo handling equipment failures"
    ]
    
    # Формируем список уже использованных тем для промпта
    topics_context = ""
    if published_topics:
        topics_context = f"\n\nALREADY PUBLISHED TOPICS (DO NOT REPEAT THESE):\n" + "\n".join([f"- {topic}" for topic in published_topics[-10:]])  # Последние 10 тем
    
    system_prompt = """You are Bench Energy — a senior global commodities analyst specializing in bulk trading and freight logistics.

Generate TWO versions of an analytical post about freight challenges for coal and bulk trading companies. Write about REAL problems and trends WITHOUT inventing specific numbers or fake news.

OUTPUT FORMAT (strict JSON, no markdown):
{
    "tg_version": "Telegram version: short, emojis, HTML tags, max 1024 chars",
    "web_version": "Web version: full HTML with headings, paragraphs, structured content"
}

CRITICAL RULES - NO FAKE DATA:
- DO NOT invent specific numbers (rates, percentages, dates, delays)
- DO NOT create fake news or events
- DO NOT mention specific ports having problems unless it's a general known issue
- DO describe REAL problems and challenges that bulk traders face
- DO use general terms: "significant increases", "extended delays", "premium rates", "market volatility"
- DO mention real vessel types (Panamax, Supramax, Capesize) and routes (Australia-China, etc.)
- DO write about actual industry challenges and trends
- DO mention that Bench Energy's solution - closed freight tender for traders - solves these problems

TELEGRAM VERSION (tg_version):
- Format: <b>🚢 [FREIGHT] | Problem Title</b> + problem description + solution mention + hashtags
- Max 1024 characters total (including HTML tags)
- Use HTML: <b>, <i>, <a>
- Include category emoji: 🚢 [FREIGHT]
- MUST mention Bench Energy's closed freight tender solution naturally in the text
- End with: #Freight #BulkTrading #Logistics #Coal #BenchEnergy
- Style: Match Bench Energy channel tone - analytical, concise
- NO specific numbers - use general terms like "significant", "extended", "premium rates"

WEB VERSION (web_version):
- Full HTML article structure
- Use: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, <strong>, <em>
- Include:
  - Problem overview
  - Detailed analysis with specific examples
  - Market implications
  - Solution section mentioning Bench Energy's closed freight tender
  - Conclusion
- Comprehensive but readable (1000-1500 words equivalent)

IMPORTANT:
- Write about REAL freight challenges and industry trends
- Mention vessel types (Panamax, Supramax, Capesize) and routes (Australia-China, Indonesia-India, etc.)
- Use GENERAL terms: "volatility", "delays", "premium rates", "market tightness" - NO specific numbers
- Write in Bench Energy's analytical style: expert insights about industry problems
- Naturally integrate mention of Bench Energy's closed freight tender solution
- DO NOT invent specific rates, percentages, delays, or events"""

    # Выбираем случайную тему из списка, избегая уже использованных
    import random
    available_topics = [t for t in freight_topics if t not in published_topics]
    if not available_topics:
        # Если все темы использованы, начинаем заново, но выбираем случайную
        available_topics = freight_topics
        print("⚠️  Все темы использованы, выбираем случайную из общего списка")
    
    selected_topic = random.choice(available_topics)
    
    user_prompt = f"""Generate an analytical post about freight challenges for bulk trading companies (coal, iron ore, grain, etc.).

FOCUS ON THIS SPECIFIC TOPIC (create a unique angle):
{selected_topic}

Create original content describing real problems these companies face. Choose a DIFFERENT angle or scenario than previously published topics.

Write in Bench Energy's analytical style about REAL freight challenges:
- Mention vessel types (Panamax, Supramax, Capesize) and routes (Australia-China, Indonesia-India, etc.)
- Describe problems in GENERAL terms: "volatility", "extended delays", "premium rates", "market tightness"
- DO NOT include specific numbers, rates, percentages, or dates
- Focus on industry trends and challenges that bulk traders actually face

MUST mention that Bench Energy's closed freight tender for traders solves these problems.

IMPORTANT: Make this post UNIQUE and DIFFERENT from previous freight posts. Use a fresh perspective, different examples, and new scenarios."""
    
    # Добавляем контекст уже опубликованных тем, если они есть
    if published_topics:
        topics_context = f"\n\nALREADY PUBLISHED TOPICS (DO NOT REPEAT THESE - use different angles/scenarios):\n" + "\n".join([f"- {topic}" for topic in published_topics[-10:]])  # Последние 10 тем
        user_prompt += topics_context
    
    user_prompt += "\n\nReturn ONLY the JSON object with tg_version and web_version."
    
    payload = {
        "model": "anthropic/claude-3.5-sonnet",  # Используем Sonnet для более качественного контента
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.8  # Немного выше для креативности
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()
            
            result = data['choices'][0]['message']['content'].strip()
            
            # Парсим JSON из ответа
            import json
            # Убираем markdown код блоки если есть
            if result.startswith("```json"):
                result = result[7:]
            if result.startswith("```"):
                result = result[3:]
            if result.endswith("```"):
                result = result[:-3]
            result = result.strip()
            
            # Извлекаем JSON
            json_start = result.find("{")
            json_end = result.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                json_text = result[json_start:json_end]
                versions = json.loads(json_text)
                
                # Проверяем наличие всех версий
                if "tg_version" in versions and "web_version" in versions:
                    # Добавляем тему в результат для сохранения
                    versions["topic"] = selected_topic
                    print(f"✅ Специальный пост о фрахте сгенерирован (тема: {selected_topic[:50]}...)")
                    return versions
                else:
                    print(f"⚠️  Не все версии найдены в ответе")
                    # Пробуем создать недостающие версии
                    if "tg_version" not in versions:
                        # Извлекаем текст из web_version для Telegram
                        import re
                        web_text = versions.get("web_version", "")
                        # Убираем HTML теги для Telegram версии
                        clean_text = re.sub(r'<[^>]+>', '', web_text)
                        versions["tg_version"] = f"<b>🚢 [FREIGHT] | Freight Challenges</b>\n\n{clean_text[:800]}...\n\n#Freight #BulkTrading #Logistics #Coal #BenchEnergy"
                    if "web_version" not in versions:
                        versions["web_version"] = f"<h1>Freight Challenges for Bulk Trading</h1><p>Analysis of freight logistics problems.</p>"
                    versions["topic"] = selected_topic
                    return versions
            else:
                raise ValueError("JSON не найден в ответе")
                
        except json.JSONDecodeError as e:
            print(f"⚠️  Ошибка парсинга JSON (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                # Fallback: создаем версии вручную
                print(f"⚠️  Использую fallback версии для поста о фрахте")
                tg_content = """<b>🚢 [FREIGHT] | Freight Rate Volatility Challenges Bulk Traders</b>

Bulk trading companies face increasing freight rate volatility, making cost planning difficult. Port congestion and vessel availability issues compound the problem.

Bench Energy's closed freight tender for traders helps solve these challenges by providing predictable rates and reliable vessel allocation.

#Freight #BulkTrading #Logistics #Coal #BenchEnergy"""
                return {
                    "tg_version": tg_content[:1024],
                    "web_version": "<h1>Freight Challenges for Bulk Trading Companies</h1><p>Analysis of freight logistics problems and solutions.</p><p>Bench Energy's closed freight tender for traders helps address these challenges.</p>",
                    "topic": selected_topic
                }
        except Exception as e:
            print(f"❌ Ошибка генерации поста о фрахте (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise Exception(f"Не удалось сгенерировать пост о фрахте после {max_retries} попыток: {e}") from e
    
    raise Exception("Не удалось сгенерировать пост о фрахте")

