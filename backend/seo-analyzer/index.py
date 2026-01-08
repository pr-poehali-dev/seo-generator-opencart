import json
import urllib.parse
import urllib.request
import re
from html.parser import HTMLParser
from collections import Counter
from typing import Dict, List, Set

class ProductParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.products = []
        self.brands = set()
        self.current_text = ''
        self.in_product = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        class_name = attrs_dict.get('class', '')
        
        if any(keyword in class_name.lower() for keyword in ['product', 'item', 'card', 'товар']):
            self.in_product = True
    
    def handle_data(self, data):
        if self.in_product:
            self.current_text += data.strip() + ' '
    
    def handle_endtag(self, tag):
        if self.in_product and tag in ['div', 'article', 'li']:
            text = self.current_text.strip()
            if len(text) > 10:
                self.products.append(text)
                
                brand_match = re.search(r'\b([A-Z][a-zA-Z]+)\b', text)
                if brand_match:
                    self.brands.add(brand_match.group(1))
            
            self.current_text = ''
            self.in_product = False

def search_wikipedia(query: str) -> str:
    encoded_query = urllib.parse.quote(query)
    search_url = f"https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch={encoded_query}&utf8=&format=json&srlimit=1"
    
    req = urllib.request.Request(
        search_url,
        headers={'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzerBot/1.0)'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
    
    results = data.get('query', {}).get('search', [])
    
    if results and len(results) > 0:
        snippet = results[0].get('snippet', '')
        snippet = snippet.replace('<span class="searchmatch">', '').replace('</span>', '')
        snippet = snippet.replace('&quot;', '"').replace('&#039;', "'")
        title = results[0].get('title', '')
        return f"{title} — {snippet}"
    
    return ''

def analyze_category_page(url: str) -> Dict:
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
        
        parser = ProductParser()
        parser.feed(html)
        
        title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
        page_title = title_match.group(1).strip() if title_match else ''
        
        h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
        h1_text = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip() if h1_match else ''
        
        brand_patterns = [
            r'"brand"[:\s]+"([^"]+)"',
            r'data-brand="([^"]+)"',
            r'"manufacturer"[:\s]+"([^"]+)"',
            r'\b(Apple|Samsung|Xiaomi|Huawei|Sony|LG|Nokia|Realme|OPPO|Vivo|OnePlus|Google|Asus|Lenovo|Motorola|HTC|Honor|ZTE|Meizu|TCL)\b'
        ]
        
        brands_found = set()
        for pattern in brand_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            brands_found.update([b.strip() for b in matches if len(b.strip()) > 1])
        
        if not brands_found and parser.brands:
            brands_found = parser.brands
        
        price_matches = re.findall(r'(\d[\d\s]{3,})\s*(?:₽|руб)', html)
        estimated_products = max(len(price_matches) // 2, 10) if price_matches else 10
        
        words = re.findall(r'\b[а-яА-ЯёЁ]{4,}\b', html.lower())
        word_freq = Counter(words)
        stop_words = {'этот', 'того', 'этого', 'можно', 'есть', 'быть', 'очень', 'более', 'самый', 'который', 'весь', 'товар', 'цена', 'рубль', 'купить'}
        keywords = [word for word, count in word_freq.most_common(50) if word not in stop_words and count > 5][:10]
        
        return {
            'products': parser.products[:20] if parser.products else [],
            'brands': list(brands_found)[:10],
            'page_title': page_title,
            'h1': h1_text,
            'keywords': keywords,
            'total_products': max(len(parser.products), estimated_products)
        }
    
    except Exception as e:
        raise Exception(f"Ошибка при анализе страницы: {str(e)}")

def generate_category_description(analysis: Dict, category_name: str) -> str:
    brands_text = ''
    if analysis['brands']:
        brands_list = ', '.join(analysis['brands'][:5])
        brands_text = f" Популярные бренды: {brands_list}."
    
    keywords_text = ''
    if analysis['keywords']:
        keywords_text = ' '.join(analysis['keywords'][:5])
    
    description = f"""В категории {category_name} представлено {analysis['total_products']} товаров.{brands_text}

Широкий ассортимент качественной продукции с доставкой по России. В нашем каталоге вы найдёте проверенные товары от надёжных производителей.

Ключевые особенности:
• Большой выбор моделей и брендов
• Актуальные цены и характеристики
• Гарантия качества на все товары
• Быстрая доставка по всей России
• Профессиональная консультация

Популярные запросы: {keywords_text}

Оформите заказ онлайн или получите консультацию наших специалистов!"""
    
    return description

def handler(event: dict, context) -> dict:
    '''SEO-анализатор: поиск информации о брендах и анализ категорий для генерации контента'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}') or '{}'
    
    try:
        body = json.loads(body_str)
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    
    analysis_type = body.get('type', 'brand')
    
    try:
        if analysis_type == 'brand':
            brand_name = body.get('brandName', '').strip()
            
            if not brand_name:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'brandName is required'})
                }
            
            search_query = f"{brand_name} бренд производитель история компания"
            brand_info = search_wikipedia(search_query)
            
            if len(brand_info) > 800:
                brand_info = brand_info[:797] + '...'
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'type': 'brand',
                    'brandInfo': brand_info,
                    'source': 'Wikipedia (ru)' if brand_info else 'none'
                })
            }
        
        elif analysis_type == 'category':
            category_url = body.get('categoryUrl', '').strip()
            category_name = body.get('categoryName', '').strip()
            
            if not category_url:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'categoryUrl is required'})
                }
            
            if not category_name:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'categoryName is required'})
                }
            
            analysis = analyze_category_page(category_url)
            description = generate_category_description(analysis, category_name)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'type': 'category',
                    'description': description,
                    'analysis': analysis,
                    'source': 'page_analysis'
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid type. Use "brand" or "category"'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }