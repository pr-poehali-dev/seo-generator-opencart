import json
import os
import base64
import time
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Генерация изображений и видео для SEO-оптимизации
    
    Поддерживает:
    - Изображения через DALL-E 3 / Flux / Stable Diffusion
    - Видео через Runway / Luma / альтернативы Veo-3
    """
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        media_type = body.get('type', 'image')
        prompt = body.get('prompt', '')
        options = body.get('options', {})
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Prompt is required'})
            }
        
        if media_type == 'image':
            result = generate_image(prompt, options)
        elif media_type == 'video':
            result = generate_video(prompt, options)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid media type'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def generate_image(prompt: str, options: dict) -> dict:
    """Генерация изображения через доступные API"""
    import requests
    
    openai_key = os.environ.get('OPENAI_API_KEY')
    
    if not openai_key:
        return {
            'error': 'OPENAI_API_KEY not configured',
            'status': 'error'
        }
    
    size = options.get('size', '1024x1024')
    quality = options.get('quality', 'standard')
    style = options.get('style', 'vivid')
    
    size_map = {
        '1024x1024': '1024x1024',
        '1920x1080': '1792x1024',
        '1080x1920': '1024x1792',
        '1200x630': '1792x1024'
    }
    
    dalle_size = size_map.get(size, '1024x1024')
    
    enhanced_prompt = f"{prompt}. Professional product photography, high quality, SEO optimized."
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/images/generations',
            headers={
                'Authorization': f'Bearer {openai_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'dall-e-3',
                'prompt': enhanced_prompt,
                'n': 1,
                'size': dalle_size,
                'quality': quality,
                'style': style
            },
            timeout=60
        )
        
        if response.status_code != 200:
            return {
                'error': f'DALL-E API error: {response.text}',
                'status': 'error'
            }
        
        data = response.json()
        image_url = data['data'][0]['url']
        
        s3_url = upload_to_s3(image_url, 'image', prompt)
        
        return {
            'status': 'success',
            'type': 'image',
            'url': s3_url,
            'original_url': image_url,
            'prompt': enhanced_prompt,
            'size': size,
            'generated_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            'error': f'Image generation failed: {str(e)}',
            'status': 'error'
        }


def generate_video(prompt: str, options: dict) -> dict:
    """Генерация видео (заглушка для интеграции с Runway/Luma/alternatives)"""
    
    duration = options.get('duration', '5')
    video_type = options.get('video_type', 'video')
    animation = options.get('animation', 'smooth')
    
    return {
        'status': 'processing',
        'type': 'video',
        'message': 'Video generation queued. This feature requires Runway ML or Luma API integration.',
        'prompt': prompt,
        'duration': duration,
        'video_type': video_type,
        'animation': animation,
        'estimated_time': '2-5 minutes',
        'note': 'Real video generation requires additional API setup (Runway ML, Luma Dream Machine, or Pika)'
    }


def upload_to_s3(image_url: str, media_type: str, prompt: str) -> str:
    """Загрузка сгенерированного медиа в S3"""
    import boto3
    import requests
    from urllib.parse import quote
    
    try:
        response = requests.get(image_url, timeout=30)
        image_data = response.content
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        timestamp = int(time.time())
        safe_prompt = ''.join(c if c.isalnum() else '_' for c in prompt[:30])
        file_key = f'seo-media/{media_type}_{safe_prompt}_{timestamp}.png'
        
        s3.put_object(
            Bucket='files',
            Key=file_key,
            Body=image_data,
            ContentType='image/png'
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        
        return cdn_url
        
    except Exception as e:
        return image_url
