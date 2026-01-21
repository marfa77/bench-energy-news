"""
Модуль для генерации трех версий поста (Telegram, LinkedIn, Web) через Claude 3.5.
"""
import os
import requests
import time
from typing import Dict
from dotenv import load_dotenv

load_dotenv()


def generate_post_versions(news: Dict, max_retries: int = 3) -> Dict[str, str]:
    """
    Генерирует три версии поста через Claude 3.5.
    
    Args:
        news: Словарь с данными новости
        max_retries: Максимальное количество попыток
        
    Returns:
        Словарь с ключами: tg_version, li_version, web_version
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

Generate THREE versions of the same news analysis for different platforms. Return ONLY valid JSON.

OUTPUT FORMAT (strict JSON, no markdown):
{
    "tg_version": "Telegram version: short, emojis, HTML tags, max 1024 chars with source link",
    "li_version": "LinkedIn version: expert tone, English, professional, max 3000 chars, 5 hashtags at end",
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

LINKEDIN VERSION (li_version):
You are a top-tier global commodities analyst writing an expert column. This is NOT a news report—it's your analytical take.

STRUCTURE (follow exactly):

1. THE HOOK (first line, ALL CAPS):
   Start with a powerful statement in CAPS. Examples:
   - "BREAKING: COAL PRICES SURGE IN ASIA"
   - "CRITICAL SHIFT: AUSTRALIAN EXPORTS HIT 6-MONTH HIGH"
   - "MARKET ALERT: SUPPLY CHAIN DISRUPTION IN NEWCASTLE"

2. CONTEXT (2-3 sentences):
   Explain WHY this happened. Mention:
   - Supply chain dynamics
   - Geopolitical factors
   - Weather/climate impact
   - Infrastructure/logistics
   - Demand shifts

3. THE "SO WHAT?" (analytical insight):
   Your expert analysis: How will this change the market tomorrow?
   - Price impact forecast
   - Regional implications
   - Trading opportunities
   - Risk factors

4. KEY METRICS (3-4 bullet points with emojis):
   Format: "📈 Price: $145/t (+$2.5)"
   Use: 📈 (up), 📉 (down), 🏗 (infrastructure), ⚡ (energy), 🌍 (global), 📊 (data)

5. CALL TO ACTION (CTA):
   "For real-time data and granular coal market analysis, follow our Telegram: https://t.me/benchenergy"

6. PROFESSIONAL HASHTAGS (5-7 tags):
   End with: #EnergyMarkets #CoalTrading #Commodities #NetZero #SupplyChain #BenchEnergy #MarketAnalysis

TONE:
- Authoritative, expert voice
- Professional but engaging
- Data-driven insights
- No fluff, straight to the point

TECHNICAL:
- English only
- No HTML tags (plain text)
- Max 3000 characters
- Use line breaks for readability

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

    user_prompt = f"""Generate three platform-specific versions of this coal market news:

Title: {news_title}

Summary: {news_summary}

Source: {source_name}
URL: {source_url}

Return ONLY the JSON object with tg_version, li_version, and web_version."""
    
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
                if "tg_version" in versions and "li_version" in versions and "web_version" in versions:
                    print(f"✅ Три версии поста сгенерированы")
                    return versions
                else:
                    print(f"⚠️  Не все версии найдены в ответе")
                    # Пробуем создать недостающие версии
                    if "tg_version" not in versions:
                        versions["tg_version"] = versions.get("li_version", "")[:1000]
                    if "li_version" not in versions:
                        versions["li_version"] = versions.get("tg_version", "")
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
                    "li_version": f"{news_title}\n\n{news_summary}\n\n#Coal #Energy #Markets #Commodities #BenchEnergy",
                    "web_version": f"<h1>{news_title}</h1><p>{news_summary}</p><h3>Bench Energy Expert View</h3><p><strong>What this means:</strong> Analysis of market implications.</p><p><strong>Market impact:</strong> Regional and price effects.</p><p><strong>Risks & Opportunities:</strong> Key factors to watch.</p>"
                }
        except Exception as e:
            print(f"❌ Ошибка генерации версий (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise Exception(f"Не удалось сгенерировать версии после {max_retries} попыток: {e}") from e
    
    raise Exception("Не удалось сгенерировать версии поста")

