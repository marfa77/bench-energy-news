"""
Модуль для сбора данных по угольному рынку через Gemini API с Google Search.
Собирает актуальные цены, индексы и показатели для ежедневной сводки.
Использует REST API напрямую (как в Dubai RE Soft Launch).
"""
import os
import json
import time
import requests
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()


def collect_coal_market_data(max_retries: int = 3) -> Dict:
    """
    Собирает актуальные данные по угольному рынку через Gemini с Google Search.
    
    Returns:
        Словарь с данными рынка:
        - benchmarks: список бенчмарков с ценами
        - spreads: региональные спреды
        - summary: краткое описание ситуации на рынке
        
    Raises:
        Exception: Если сбор данных не удался после всех попыток
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment")
    
    # Используем REST API напрямую (как в Dubai RE Soft Launch)
    # Это не требует настройки Vertex AI проекта
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")
    week_num = today.isocalendar()[1]
    
    system_instruction = """Ты — профессиональный аналитик угольного рынка с доступом к Google Search. Твоя задача — собирать МАКСИМУМ актуальных цен и индексов угольного рынка из проверенных источников.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. ОБЯЗАТЕЛЬНО используй инструмент google_search для поиска актуальных цен
2. Делай МАКСИМУМ разных поисковых запросов (минимум 15-20 запросов!):
   - Прямые поиски по индексам: "API2 coal price", "API4 coal price", "API5", "API6"
   - По регионам: "Newcastle coal price", "Richards Bay coal", "ARA coal price"
   - По источникам: "Argus coal prices", "Platts coal prices", "S&P Global coal"
   - Общие: "thermal coal benchmark", "coal spot prices", "coal price indices"
   - С датами: "[дата] coal prices", "coal market report [дата]"
3. Используй ТОЛЬКО данные из найденных источников (Reuters, Bloomberg, Argus, Platts, S&P Global, новости, отчеты)
4. НЕ выдумывай цены или данные
5. Если данных нет за сегодня - используй данные за вчера или позавчера (указав это)
6. Если данных нет вообще - используй null для значений
7. Ищи цены в разных форматах: "$96", "96 USD", "96/t", "96 per tonne"
8. Если есть только упоминание цены в тексте - извлеки её"""
    
    prompt = f"""Сегодня {today_str}. Собери МАКСИМУМ доступных данных по угольным бенчмаркам для ежедневной сводки Bench Energy.

КРИТИЧЕСКИ ВАЖНО - делай МАКСИМУМ поисковых запросов (минимум 15-20!):

1. Прямые поиски по индексам:
   - "API2 coal price {today_str}"
   - "API4 coal price {today_str}"
   - "API5 coal price {today_str}"
   - "API6 coal price {today_str}"
   - "API2 thermal coal {today_str}"
   - "API4 Richards Bay {today_str}"

2. По регионам и портам:
   - "Newcastle coal price {today_str}"
   - "Richards Bay coal price {today_str}"
   - "ARA coal price {today_str}"
   - "Europe CIF coal {today_str}"
   - "Australia FOB coal {today_str}"
   - "South Africa FOB coal {today_str}"

3. По источникам данных:
   - "Argus coal prices {today_str}"
   - "Platts coal prices {today_str}"
   - "S&P Global coal prices {today_str}"
   - "Reuters coal prices {today_str}"
   - "Bloomberg coal prices {today_str}"

4. Общие запросы:
   - "thermal coal benchmark {today_str}"
   - "coal spot prices {today_str}"
   - "coal price indices {today_str}"
   - "coal market report {today_str}"
   - "coal prices today"
   - "coal indices today"

ИСПОЛЬЗУЙ ВСЕ ВОЗМОЖНЫЕ ИСТОЧНИКИ:
- Новости (Reuters, Bloomberg, Financial Times)
- Отчеты (Argus, Platts, S&P Global Commodity Insights)
- Пресс-релизы компаний
- Торговые публикации
- Правительственные данные

ВАЖНО:
- Если точных данных нет за сегодня - используй данные за вчера или позавчера (это нормально)
- Если есть только упоминание цены в тексте - извлеки её
- Если есть диапазон цен - используй среднее значение
- Если данных нет вообще - оставь null (не выдумывай)

Собери данные для следующих бенчмарков (ищи под разными названиями):

1. API2 / Europe CIF ARA 6000:
   - Ищи: "API2", "ARA CIF", "Europe CIF", "Rotterdam CIF", "Northwest Europe CIF"
   - Название в JSON: "API2 (EU CIF ARA 6000)"

2. API4 / South Africa FOB Richards Bay 6000:
   - Ищи: "API4", "Richards Bay FOB", "RB FOB", "South Africa FOB"
   - Название в JSON: "API4 (ZA FOB RB 6000)"

3. Newcastle 6000 / Australia 6000 FOB:
   - Ищи: "Newcastle 6000", "Australia 6000 FOB", "Newcastle index", "API6"
   - Название в JSON: "Newcastle 6000 FOB"

4. Newcastle 5500 / Australia 5500 FOB:
   - Ищи: "Newcastle 5500", "Australia 5500 FOB", "API5"
   - Название в JSON: "Newcastle 5500 FOB"

5. Richards Bay 6000 (альтернативный):
   - Ищи: "Richards Bay 6000", "ZA 6000"
   - Название в JSON: "Richards Bay 6000 FOB"

6. Richards Bay 5500:
   - Ищи: "Richards Bay 5500", "ZA 5500", "API3"
   - Название в JSON: "Richards Bay 5500 FOB"

Верни ТОЛЬКО JSON:
{{
    "benchmarks": [
        {{"name": "API2 (EU CIF ARA 6000)", "value": 96.00, "change": 0.50, "change_pct": 0.5}},
        {{"name": "API4 (ZA FOB RB 6000)", "value": 104.50, "change": -1.20, "change_pct": -1.1}},
        {{"name": "Newcastle 6000 FOB", "value": 103.74, "change": 0.59, "change_pct": 0.6}},
        {{"name": "Newcastle 5500 FOB", "value": 90.78, "change": 0.30, "change_pct": 0.3}},
        {{"name": "Richards Bay 6000 FOB", "value": null, "change": null, "change_pct": null}},
        {{"name": "Richards Bay 5500 FOB", "value": null, "change": null, "change_pct": null}}
    ],
    "spreads": [
        {{"name": "EU-CIF vs ZA-6000", "value": -8.50, "change": -1.70}},
        {{"name": "AU-6000 vs EU-CIF", "value": 7.74, "change": 0.09}},
        {{"name": "AU-6000 vs ZA-6000", "value": -0.76, "change": -1.61}}
    ],
    "summary": "Краткое описание ситуации на рынке на основе найденных данных..."
}}

КРИТИЧЕСКИ ВАЖНО:
- Делай МАКСИМУМ поисковых запросов (15-20 минимум!)
- Используй альтернативные названия для каждого бенчмарка
- Если данных нет - используй null (не выдумывай!)
- Если есть данные за вчера/позавчера - используй их (лучше чем null)
- Извлекай цены из текста, если они упомянуты"""
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,  # Низкая температура для точности данных
            "topK": 1,
            "topP": 0.1
        },
        "tools": [{
            "googleSearch": {}
        }]
    }
    
    for attempt in range(max_retries):
        try:
            print(f"   Отправляю запрос к Gemini API (попытка {attempt + 1}/{max_retries})...")
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()
            
            # Проверяем, что поиск сработал
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                if 'groundingMetadata' in candidate and candidate['groundingMetadata']:
                    print("✅ Google Search выполнен успешно!")
            
            # Получаем текст ответа
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    parts = candidate['content']['parts']
                    response_text = ""
                    for part in parts:
                        if 'text' in part:
                            response_text += part['text']
                else:
                    response_text = str(data)
            else:
                response_text = str(data)
            
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
            
            data = json.loads(json_text)
            
            # Валидация структуры
            benchmarks = data.get("benchmarks", [])
            spreads = data.get("spreads", [])
            summary = data.get("summary", "")
            
            if benchmarks or spreads:
                print(f"✅ Собрано данных: {len(benchmarks)} бенчмарков, {len(spreads)} спредов")
            else:
                print(f"⚠️  Данные не найдены в источниках")
            
            return {
                "benchmarks": benchmarks,
                "spreads": spreads,
                "summary": summary,
                "date": today_str,
                "week": week_num
            }
            
        except json.JSONDecodeError as e:
            print(f"⚠️  Ошибка парсинга JSON (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                print(f"⚠️  Не удалось распарсить JSON. Ответ: {response_text[:200] if 'response_text' in locals() else 'N/A'}")
                return {"benchmarks": [], "spreads": [], "summary": "", "date": today_str, "week": week_num}
        except Exception as e:
            error_str = str(e).lower()
            
            if attempt == 0:
                print(f"🔍 Диагностика ошибки: {str(e)[:300]}")
            
            if "search tool" in error_str or "google_search" in error_str or "not supported" in error_str:
                print(f"⚠️  Google Search не доступен!")
                print(f"📋 Включите API 'Vertex AI Search and Conversation' в Google Cloud Console")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    return {"benchmarks": [], "spreads": [], "summary": "", "date": today_str, "week": week_num}
            
            print(f"❌ Ошибка сбора данных (попытка {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise Exception(f"Не удалось собрать данные после {max_retries} попыток: {e}") from e
    
    return {"benchmarks": [], "spreads": [], "summary": "", "date": today_str, "week": week_num}

