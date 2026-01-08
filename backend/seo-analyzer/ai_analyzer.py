import os
import json
from typing import Dict, Optional

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

def analyze_product_with_ai(html_content: str, basic_data: Dict) -> Optional[Dict]:
    if not OPENAI_AVAILABLE:
        return None
    
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return None
    
    try:
        client = OpenAI(api_key=api_key)
        
        html_snippet = html_content[:15000]
        
        prompt = f"""Проанализируй HTML-код страницы товара и извлеки МАКСИМУМ информации для создания лидерского SEO-контента.

Базовые данные (уже извлечены):
- Название: {basic_data.get('product_name', 'Не найдено')}
- Бренд: {basic_data.get('brand', 'Не найдено')}
- Цена: {basic_data.get('price', 'Не найдено')}

HTML-фрагмент страницы:
{html_snippet}

Выполни ГЛУБОКИЙ анализ и верни JSON со следующей структурой:

{{
  "full_name": "Точное полное название товара с артикулом/модификацией",
  "description": "Подробное описание товара (2-3 абзаца) с техническими деталями",
  "key_features": ["Список ключевых особенностей", "минимум 5-7 пунктов"],
  "advantages": ["Преимущества товара", "почему стоит купить", "минимум 5 пунктов"],
  "specifications": {{
    "Категория 1": {{"Параметр": "Значение"}},
    "Категория 2": {{"Параметр": "Значение"}}
  }},
  "visual_details": {{
    "color": "Основной цвет",
    "material": "Материал корпуса/изготовления",
    "form_factor": "Форма, размеры, дизайн"
  }},
  "target_audience": "Для кого предназначен товар",
  "use_cases": ["Примеры использования", "сценарии применения"],
  "seo_meta": {{
    "title": "SEO-оптимизированный Title (до 60 символов)",
    "description": "Meta Description (до 160 символов)",
    "h1": "Оптимальный H1 заголовок",
    "keywords": ["ключевое слово 1", "ключевое слово 2"]
  }},
  "lsi_phrases": ["LSI-фраза 1", "LSI-фраза 2", "минимум 10 фраз"],
  "selling_points": ["УТП 1", "УТП 2", "что выделяет среди конкурентов"]
}}

ВАЖНО:
- Извлекай ВСЮ информацию из HTML
- Если в HTML есть таблица характеристик - извлеки её ПОЛНОСТЬЮ
- Если есть список преимуществ - включи всё
- Анализируй текстовое описание и структурируй его
- Формулируй SEO-оптимизированные тексты на русском языке
- Используй профессиональную терминологию
- Создавай продающие формулировки"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Ты эксперт по SEO-копирайтингу и анализу товаров для интернет-магазинов. Твоя задача - извлечь максимум информации из HTML-кода страницы товара и структурировать её для создания лидерского контента."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    
    except Exception as e:
        print(f"AI analysis error: {str(e)}")
        return None

def format_extracted_data(ai_data: Dict, basic_data: Dict) -> str:
    if not ai_data:
        return format_basic_data(basic_data)
    
    text = f"""=== ПОЛНЫЙ АНАЛИЗ ТОВАРА ===

📦 ТОЧНОЕ НАЗВАНИЕ
{ai_data.get('full_name', basic_data.get('product_name', 'Не указано'))}

💰 ЦЕНА: {basic_data.get('price', 'Уточняйте')}
🏷️ БРЕНД: {basic_data.get('brand', 'Не указан')}

📝 ПОДРОБНОЕ ОПИСАНИЕ
{ai_data.get('description', 'Описание не найдено')}

✨ КЛЮЧЕВЫЕ ОСОБЕННОСТИ
"""
    
    for feature in ai_data.get('key_features', []):
        text += f"• {feature}\n"
    
    text += "\n🎯 ПРЕИМУЩЕСТВА\n"
    for adv in ai_data.get('advantages', []):
        text += f"✓ {adv}\n"
    
    specs = ai_data.get('specifications', {})
    if specs:
        text += "\n📊 ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ\n"
        for category, params in specs.items():
            text += f"\n{category}:\n"
            for key, value in params.items():
                text += f"  - {key}: {value}\n"
    
    visual = ai_data.get('visual_details', {})
    if visual:
        text += "\n🎨 ВИЗУАЛЬНЫЕ ДЕТАЛИ\n"
        text += f"Цвет: {visual.get('color', 'Не указан')}\n"
        text += f"Материал: {visual.get('material', 'Не указан')}\n"
        text += f"Форм-фактор: {visual.get('form_factor', 'Не указан')}\n"
    
    text += f"\n👥 ЦЕЛЕВАЯ АУДИТОРИЯ\n{ai_data.get('target_audience', 'Не определена')}\n"
    
    use_cases = ai_data.get('use_cases', [])
    if use_cases:
        text += "\n💡 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ\n"
        for case in use_cases:
            text += f"• {case}\n"
    
    seo = ai_data.get('seo_meta', {})
    if seo:
        text += "\n🔍 SEO-ОПТИМИЗАЦИЯ\n"
        text += f"Title: {seo.get('title', '')}\n"
        text += f"Description: {seo.get('description', '')}\n"
        text += f"H1: {seo.get('h1', '')}\n"
        text += f"Keywords: {', '.join(seo.get('keywords', []))}\n"
    
    lsi = ai_data.get('lsi_phrases', [])
    if lsi:
        text += "\n🔑 LSI-ФРАЗЫ ДЛЯ SEO\n"
        text += ", ".join(lsi[:15])
    
    selling = ai_data.get('selling_points', [])
    if selling:
        text += "\n\n💎 УНИКАЛЬНЫЕ ТОРГОВЫЕ ПРЕДЛОЖЕНИЯ\n"
        for point in selling:
            text += f"★ {point}\n"
    
    return text

def format_basic_data(basic_data: Dict) -> str:
    text = f"""Название: {basic_data.get('product_name', 'Не указано')}
Бренд: {basic_data.get('brand', 'Не указан')}
Цена: {basic_data.get('price', 'Не указана')}

Описание:
{basic_data.get('description', 'Не найдено')}

Характеристики:
"""
    for spec in basic_data.get('specifications', []):
        text += f"{spec}\n"
    
    return text
