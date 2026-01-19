"""
Модуль для генерации ежедневной сводки по угольному рынку в формате Telegram HTML.
Создает отчет в стиле Weekly Coal Market Update.
Использует OpenRouter API для доступа к Claude (как в post_generator.py).
"""
import os
import time
import requests
from datetime import datetime
from typing import Dict
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()


def create_daily_market_report(market_data: Dict, max_retries: int = 3) -> str:
    """
    Создает ежедневную сводку по угольному рынку в формате Telegram HTML.
    
    Args:
        market_data: Словарь с данными рынка (benchmarks, spreads, summary)
        max_retries: Максимальное количество попыток при ошибке
        
    Returns:
        Текст отчета в формате Telegram HTML
        
    Raises:
        Exception: Если создание отчета не удалось после всех попыток
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set in environment")
    
    # Используем OpenRouter API для доступа к Claude (как в post_generator.py)
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Используем правильное имя модели для OpenRouter
    model = os.getenv("ANTHROPIC_MODEL", "anthropic/claude-3.5-haiku")
    if not model.startswith("anthropic/"):
        model = f"anthropic/{model}"
    
    today = datetime.now()
    date_str = today.strftime("%B %d, %Y")
    week_num = market_data.get("week", today.isocalendar()[1])
    
    # Формируем данные для промпта
    benchmarks = market_data.get("benchmarks", [])
    spreads = market_data.get("spreads", [])
    summary = market_data.get("summary", "")
    
    # Форматируем бенчмарки в более читаемом виде с выравниванием
    benchmarks_text = "\n".join([
        f"{b.get('name', ''):<15} {b.get('value') or 'N/A':>7} USD/t "
        f"({'+' if (b.get('change') or 0) >= 0 else ''}{b.get('change') or 0:.2f}, "
        f"{'+' if (b.get('change_pct') or 0) >= 0 else ''}{b.get('change_pct') or 0:.1f}%)"
        for b in benchmarks
    ])
    
    # Форматируем спреды
    spreads_text = "\n".join([
        f"{s.get('name', ''):<30} {s.get('value') or 'N/A':>7} USD/t"
        for s in spreads
    ])
    
    system_prompt = """You are Bench Energy — a senior global coal-market analyst.

Create daily market summary updates for a Telegram channel in the style of Weekly Coal Market Update.

FORMAT RULES:
• Output must be valid Telegram HTML.
• DO NOT use <br>. Use blank lines between sections.
• Allowed tags: <b>, <i>, <u>, <s>, <a>, <code>, <pre>, <blockquote>.
• LENGTH: 1,200–1,800 characters (strict) - более краткий формат.
• English only.
• Use emojis in section headers.

OUTPUT STRUCTURE (FOLLOW EXACTLY):

<b>📊 Daily Coal Market Update</b>
[Date and Week number]

<b>💰 Key Benchmarks</b>
[Форматируй как таблицу с выравниванием, используя пробелы]
AU-6000:    [цена] USD/t ([изменение], [%])
EU-CIF:     [цена] USD/t ([изменение], [%])
ZA-6000:    [цена] USD/t ([изменение], [%])
[Другие бенчмарки если есть]

<b>📊 Regional Spreads</b>
EU-CIF – ZA-6000: [значение] USD/t
AU-6000 – EU-CIF: [значение] USD/t
AU-6000 – ZA-6000: [значение] USD/t

<b>📌 Market Summary</b>
[2-3 КРАТКИХ предложения с ключевыми фактами:
- Основной тренд рынка
- Ключевые региональные факторы
- Важные события/изменения]

<b>🔮 Outlook</b>
[1-2 предложения с кратким прогнозом на 1-2 дня]

STYLE:
• Professional, analytical, EXTREMELY CONCISE.
• Focus on KEY facts and numbers.
• Use data from provided benchmarks and spreads.
• NO fluff, NO general statements - only specific facts.
• If change is 0.0%, write "stable" or "unchanged".
• No disclaimers, no greetings."""
    
    user_prompt = f"""Create a daily coal market update for {date_str} (Week {week_num}).

MARKET DATA:

Benchmarks:
{benchmarks_text if benchmarks_text else "No benchmark data available"}

Spreads:
{spreads_text if spreads_text else "No spread data available"}

Market Summary Context:
{summary if summary else "No summary provided"}

IMPORTANT:
- Be EXTREMELY CONCISE - every word counts
- Focus on KEY numbers and facts
- If change is 0.0%, write "stable" or "unchanged" instead of showing 0.0%
- Market Summary: 2-3 SHORT sentences with specific facts
- Outlook: 1-2 sentences maximum
- NO general statements like "markets remain stable" without specific context
- Use specific numbers and facts from the data

Create a professional daily update following the structure above."""
    
    backoff = 1
    last_error = None
    
    for attempt in range(max_retries):
        try:
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.7
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            
            if response.status_code != 200:
                error_text = response.text[:500] if response.text else "No error details"
                print(f"   ⚠️  Ошибка API: {response.status_code} - {error_text}")
            
            response.raise_for_status()
            data = response.json()
            
            if 'choices' in data and len(data['choices']) > 0:
                result = data['choices'][0]['message']['content'].strip()
            else:
                result = str(data)
            
            return result
            
        except requests.exceptions.HTTPError as e:
            last_error = e
            if attempt == 0:
                try:
                    error_data = e.response.json() if e.response else {}
                    print(f"   ⚠️  Детали ошибки: {error_data}")
                except:
                    print(f"   ⚠️  Ответ сервера: {e.response.text[:300] if e.response else 'N/A'}")
            if attempt < max_retries - 1:
                wait_time = backoff * (2 ** attempt)
                print(f"Ошибка создания отчета (попытка {attempt + 1}/{max_retries}): {e}. Ожидание {wait_time} секунд...")
                time.sleep(wait_time)
            else:
                raise Exception(f"Не удалось создать отчет после {max_retries} попыток: {last_error}") from last_error
        except Exception as e:
            last_error = e
            if attempt < max_retries - 1:
                wait_time = backoff * (2 ** attempt)
                print(f"Ошибка создания отчета (попытка {attempt + 1}/{max_retries}): {e}. Ожидание {wait_time} секунд...")
                time.sleep(wait_time)
            else:
                raise Exception(f"Не удалось создать отчет после {max_retries} попыток: {last_error}") from last_error
    
    raise Exception(f"Не удалось создать отчет: {last_error}")

