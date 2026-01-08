import json
import os
import base64
import time
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Генерация изображений и видео для SEO-оптимизации
    
    Поддерживает:
    - Изображения через DALL-E 3 (OpenAI)
    - Видео через Runway ML Gen-3 API
    """
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    method = event.get('httpMethod', 'POST')
    
    # GET запрос для проверки статуса видео
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        task_id = params.get('task_id')
        
        if not task_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'task_id parameter required'})
            }
        
        result = check_video_status(task_id)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
    
    # POST запрос для генерации
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
    """Генерация видео через Runway ML Gen-3 API"""
    import requests
    
    runway_key = os.environ.get('RUNWAY_API_KEY')
    
    if not runway_key:
        return {
            'error': 'RUNWAY_API_KEY not configured',
            'status': 'error',
            'note': 'Get your API key from https://app.runwayml.com/settings/api'
        }
    
    duration = int(options.get('duration', '5'))
    video_type = options.get('video_type', 'video')
    
    # Runway поддерживает 5 или 10 секунд
    if duration > 5:
        duration = 10
    else:
        duration = 5
    
    enhanced_prompt = f"{prompt}. High quality, professional, smooth motion, cinematic."
    
    try:
        # Шаг 1: Запуск генерации видео
        response = requests.post(
            'https://api.runwayml.com/v1/gen3/generations',
            headers={
                'Authorization': f'Bearer {runway_key}',
                'Content-Type': 'application/json',
                'X-Runway-Version': '2024-11-06'
            },
            json={
                'prompt': enhanced_prompt,
                'duration': duration,
                'ratio': '16:9' if video_type == 'video' else '9:16',
                'seed': int(time.time()) % 1000000
            },
            timeout=30
        )
        
        if response.status_code != 201:
            return {
                'error': f'Runway API error: {response.text}',
                'status': 'error'
            }
        
        data = response.json()
        task_id = data.get('id')
        
        # Runway возвращает task_id, видео генерируется асинхронно
        # Реальное видео будет готово через 1-3 минуты
        
        return {
            'status': 'processing',
            'type': 'video',
            'task_id': task_id,
            'message': f'Видео генерируется (task_id: {task_id}). Ожидайте 1-3 минуты.',
            'prompt': enhanced_prompt,
            'duration': duration,
            'estimated_time': '1-3 minutes',
            'check_url': f'https://api.runwayml.com/v1/tasks/{task_id}',
            'note': 'Use task_id to check generation status and retrieve video URL when ready'
        }
        
    except Exception as e:
        return {
            'error': f'Video generation failed: {str(e)}',
            'status': 'error'
        }


def check_video_status(task_id: str) -> dict:
    """Проверка статуса генерации видео в Runway ML"""
    import requests
    
    runway_key = os.environ.get('RUNWAY_API_KEY')
    
    if not runway_key:
        return {
            'error': 'RUNWAY_API_KEY not configured',
            'status': 'error'
        }
    
    try:
        response = requests.get(
            f'https://api.runwayml.com/v1/tasks/{task_id}',
            headers={
                'Authorization': f'Bearer {runway_key}',
                'X-Runway-Version': '2024-11-06'
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return {
                'error': f'Failed to check status: {response.text}',
                'status': 'error'
            }
        
        data = response.json()
        task_status = data.get('status')
        
        # Статусы: PENDING, RUNNING, SUCCEEDED, FAILED, CANCELLED
        if task_status == 'SUCCEEDED':
            video_url = data.get('output', [None])[0]
            
            if video_url:
                # Загружаем готовое видео в S3
                s3_url = upload_to_s3(video_url, 'video', data.get('prompt', 'video'))
                
                return {
                    'status': 'completed',
                    'type': 'video',
                    'url': s3_url,
                    'original_url': video_url,
                    'task_id': task_id
                }
            else:
                return {
                    'status': 'error',
                    'error': 'Video URL not found in response'
                }
        
        elif task_status in ['PENDING', 'RUNNING']:
            progress = data.get('progress', 0)
            return {
                'status': 'processing',
                'progress': progress,
                'task_id': task_id,
                'message': f'Генерация в процессе: {progress}%'
            }
        
        elif task_status == 'FAILED':
            return {
                'status': 'failed',
                'error': data.get('failure_reason', 'Unknown error'),
                'task_id': task_id
            }
        
        else:
            return {
                'status': task_status.lower(),
                'task_id': task_id
            }
    
    except Exception as e:
        return {
            'error': f'Status check failed: {str(e)}',
            'status': 'error'
        }


def upload_to_s3(media_url: str, media_type: str, prompt: str) -> str:
    """Загрузка сгенерированного медиа в S3"""
    import boto3
    import requests
    
    try:
        response = requests.get(media_url, timeout=60)
        media_data = response.content
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        timestamp = int(time.time())
        safe_prompt = ''.join(c if c.isalnum() else '_' for c in prompt[:30])
        
        # Определяем расширение и Content-Type
        if media_type == 'image':
            extension = 'png'
            content_type = 'image/png'
        else:
            extension = 'mp4'
            content_type = 'video/mp4'
        
        file_key = f'seo-media/{media_type}_{safe_prompt}_{timestamp}.{extension}'
        
        s3.put_object(
            Bucket='files',
            Key=file_key,
            Body=media_data,
            ContentType=content_type
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        
        return cdn_url
        
    except Exception as e:
        return media_url