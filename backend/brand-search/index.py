import json
import os
import urllib.parse
import urllib.request
from typing import Optional

def handler(event: dict, context) -> dict:
    '''Поиск информации о бренде в русскоязычном интернете'''
    
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
    
    try:
        
        search_query = f"{brand_name} бренд производитель история компания"
        encoded_query = urllib.parse.quote(search_query)
        
        search_url = f"https://ru.wikipedia.org/w/api.php?action=query&list=search&srsearch={encoded_query}&utf8=&format=json&srlimit=1"
        
        req = urllib.request.Request(
            search_url,
            headers={'User-Agent': 'Mozilla/5.0 (compatible; BrandSearchBot/1.0)'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        results = data.get('query', {}).get('search', [])
        
        if results and len(results) > 0:
            snippet = results[0].get('snippet', '')
            snippet = snippet.replace('<span class="searchmatch">', '').replace('</span>', '')
            snippet = snippet.replace('&quot;', '"').replace('&#039;', "'")
            
            title = results[0].get('title', brand_name)
            
            brand_description = f"{title} — {snippet}"
            
            if len(brand_description) > 800:
                brand_description = brand_description[:797] + '...'
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'brandInfo': brand_description,
                    'source': 'Wikipedia (ru)'
                })
            }
        else:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'brandInfo': '',
                    'source': 'none'
                })
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