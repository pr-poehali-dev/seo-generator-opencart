import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
  taskId?: string;
  status?: 'processing' | 'completed' | 'failed';
  progress?: number;
}

const MediaTab = () => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageStyle, setImageStyle] = useState('vivid');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoType, setVideoType] = useState('video');
  const [videoDuration, setVideoDuration] = useState('5');
  const [videoAnimation, setVideoAnimation] = useState('smooth');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Введите описание изображения');
      return;
    }

    setIsGeneratingImage(true);

    try {
      const response = await fetch('https://functions.poehali.dev/4a12359f-155b-452d-a3f3-48b495c6444c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          prompt: imagePrompt,
          options: {
            size: imageSize,
            quality: 'standard',
            style: imageStyle
          }
        })
      });

      const data = await response.json();

      if (data.status === 'error') {
        if (data.error.includes('OPENAI_API_KEY')) {
          toast.error('Необходимо настроить OPENAI_API_KEY в секретах проекта');
        } else {
          toast.error(`Ошибка генерации: ${data.error}`);
        }
        return;
      }

      if (data.status === 'success' && data.url) {
        const newMedia: GeneratedMedia = {
          id: `img_${Date.now()}`,
          type: 'image',
          url: data.url,
          prompt: imagePrompt,
          timestamp: Date.now()
        };

        setGeneratedMedia([newMedia, ...generatedMedia]);
        toast.success('Изображение успешно сгенерировано!');
        setImagePrompt('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Не удалось сгенерировать изображение');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      toast.error('Введите описание видео');
      return;
    }

    setIsGeneratingVideo(true);

    try {
      const response = await fetch('https://functions.poehali.dev/4a12359f-155b-452d-a3f3-48b495c6444c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'video',
          prompt: videoPrompt,
          options: {
            duration: videoDuration,
            video_type: videoType,
            animation: videoAnimation
          }
        })
      });

      const data = await response.json();

      if (data.status === 'error') {
        if (data.error.includes('RUNWAY_API_KEY')) {
          toast.error('Необходимо настроить RUNWAY_API_KEY в секретах проекта');
        } else {
          toast.error(`Ошибка: ${data.error}`);
        }
        return;
      }

      if (data.status === 'processing' && data.task_id) {
        toast.success('Видео генерируется! Ожидайте 1-3 минуты...');
        
        // Создаем placeholder для видео с task_id
        const newMedia: GeneratedMedia = {
          id: `video_${Date.now()}`,
          type: 'video',
          url: '', // Пока пустой, будет заполнен после генерации
          prompt: videoPrompt,
          timestamp: Date.now(),
          taskId: data.task_id,
          status: 'processing'
        };

        setGeneratedMedia([newMedia, ...generatedMedia]);
        setVideoPrompt('');

        // Запускаем проверку статуса
        pollVideoStatus(data.task_id, newMedia.id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Не удалось запустить генерацию видео');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const pollVideoStatus = async (taskId: string, mediaId: string) => {
    const maxAttempts = 60; // 5 минут максимум (60 * 5 секунд)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `https://functions.poehali.dev/4a12359f-155b-452d-a3f3-48b495c6444c?task_id=${taskId}`,
          { method: 'GET' }
        );

        const data = await response.json();

        if (data.status === 'completed' && data.url) {
          // Обновляем media item с готовым URL
          setGeneratedMedia(prev => 
            prev.map(m => 
              m.id === mediaId 
                ? { ...m, url: data.url, status: 'completed' }
                : m
            )
          );
          toast.success('Видео готово!');
          return true;
        }

        if (data.status === 'failed' || data.status === 'error') {
          setGeneratedMedia(prev => prev.filter(m => m.id !== mediaId));
          toast.error(`Ошибка генерации: ${data.error || 'Неизвестная ошибка'}`);
          return true;
        }

        if (data.status === 'processing') {
          const progress = data.progress || 0;
          setGeneratedMedia(prev => 
            prev.map(m => 
              m.id === mediaId 
                ? { ...m, progress }
                : m
            )
          );
        }

        attempts++;
        if (attempts >= maxAttempts) {
          toast.error('Превышено время ожидания генерации видео');
          setGeneratedMedia(prev => prev.filter(m => m.id !== mediaId));
          return true;
        }

        // Проверяем снова через 5 секунд
        setTimeout(checkStatus, 5000);
        return false;

      } catch (error) {
        console.error('Error checking video status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
        return false;
      }
    };

    checkStatus();
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL скопирован в буфер обмена');
  };

  const handleDelete = (id: string) => {
    setGeneratedMedia(generatedMedia.filter(m => m.id !== id));
    toast.success('Медиа удалено');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <h2 className="text-2xl font-semibold mb-2">Генерация медиа</h2>
        <p className="text-muted-foreground text-sm">
          Создание изображений и видео для SEO-оптимизации
        </p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Image" size={20} />
              Генерация изображений (DALL-E 3)
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="img-prompt">Описание изображения</Label>
                <Textarea
                  id="img-prompt"
                  placeholder="Например: Профессиональная фотография беспроводных наушников на белом фоне, студийный свет"
                  className="mt-1 min-h-[80px]"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Размер</Label>
                  <select 
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background"
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                  >
                    <option value="1024x1024">1024x1024 (квадрат)</option>
                    <option value="1920x1080">1920x1080 (16:9)</option>
                    <option value="1080x1920">1080x1920 (9:16)</option>
                    <option value="1200x630">1200x630 (OG image)</option>
                  </select>
                </div>

                <div>
                  <Label>Стиль</Label>
                  <select 
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background"
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value)}
                  >
                    <option value="vivid">Яркий (Vivid)</option>
                    <option value="natural">Естественный (Natural)</option>
                  </select>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
              >
                {isGeneratingImage ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Icon name="Image" size={16} className="mr-2" />
                    Сгенерировать изображение
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Video" size={20} />
              Генерация видео (Runway ML Gen-3)
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-prompt">Описание видео</Label>
                <Textarea
                  id="video-prompt"
                  placeholder="Например: Короткое демо-видео распаковки товара с плавными движениями камеры"
                  className="mt-1 min-h-[80px]"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Тип</Label>
                  <select 
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background"
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value)}
                  >
                    <option value="video">Видео</option>
                    <option value="stories">Stories (9:16)</option>
                    <option value="reels">Рилс</option>
                  </select>
                </div>

                <div>
                  <Label>Длительность</Label>
                  <select 
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                  >
                    <option value="5">5 сек</option>
                    <option value="10">10 сек</option>
                    <option value="15">15 сек</option>
                  </select>
                </div>

                <div>
                  <Label>Анимация</Label>
                  <select 
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background"
                    value={videoAnimation}
                    onChange={(e) => setVideoAnimation(e.target.value)}
                  >
                    <option value="smooth">Плавная</option>
                    <option value="dynamic">Динамичная</option>
                    <option value="static">Статичная</option>
                  </select>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo || !videoPrompt.trim()}
              >
                {isGeneratingVideo ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Запуск генерации...
                  </>
                ) : (
                  <>
                    <Icon name="Video" size={16} className="mr-2" />
                    Сгенерировать видео
                  </>
                )}
              </Button>

              <div className="p-3 bg-secondary/50 rounded-md text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Icon name="Info" size={14} />
                  <span>Генерация через Runway ML Gen-3. Время генерации: 1-3 минуты. Стоимость: ~$0.05 за 5 сек.</span>
                </p>
              </div>
            </div>
          </Card>

          {generatedMedia.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Image" size={20} />
                Сгенерированные медиа ({generatedMedia.length})
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {generatedMedia.map((media) => (
                  <div key={media.id} className="border rounded-lg p-3 space-y-3">
                    <div className="relative aspect-square bg-secondary rounded-md overflow-hidden">
                      {media.type === 'image' && media.url && (
                        <img 
                          src={media.url} 
                          alt={media.prompt}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {media.type === 'video' && media.status === 'processing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <Icon name="Loader2" size={32} className="animate-spin mb-3" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Генерация видео...
                          </p>
                          {media.progress !== undefined && (
                            <div className="w-full">
                              <Progress value={media.progress} className="h-2" />
                              <p className="text-xs text-center mt-1 text-muted-foreground">
                                {media.progress}%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {media.type === 'video' && media.status === 'completed' && media.url && (
                        <video 
                          src={media.url} 
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {media.type === 'image' ? 'Изображение' : 'Видео'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(media.timestamp).toLocaleString('ru-RU')}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {media.prompt}
                      </p>

                      <div className="flex gap-2">
                        {media.status !== 'processing' && media.url && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCopyUrl(media.url)}
                            >
                              <Icon name="Copy" size={14} className="mr-1" />
                              URL
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(media.url, '_blank')}
                            >
                              <Icon name="ExternalLink" size={14} className="mr-1" />
                              Открыть
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(media.id)}
                          disabled={media.status === 'processing'}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MediaTab;