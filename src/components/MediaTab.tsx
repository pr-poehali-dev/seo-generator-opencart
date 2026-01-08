import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const MediaTab = () => {
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
              Генерация изображений (Nana-Banana Pro)
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="img-prompt">Описание изображения</Label>
                <Textarea
                  id="img-prompt"
                  placeholder="Например: Профессиональная фотография беспроводных наушников на белом фоне, студийный свет"
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Размер</Label>
                  <select className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background">
                    <option>1024x1024 (квадрат)</option>
                    <option>1920x1080 (16:9)</option>
                    <option>1080x1920 (9:16)</option>
                    <option>1200x630 (OG image)</option>
                  </select>
                </div>

                <div>
                  <Label>Стиль</Label>
                  <select className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background">
                    <option>Фотореалистичный</option>
                    <option>Студийная съёмка</option>
                    <option>Минимализм</option>
                    <option>Lifestyle</option>
                  </select>
                </div>
              </div>

              <Button className="w-full">
                <Icon name="Image" size={16} className="mr-2" />
                Сгенерировать изображение
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Video" size={20} />
              Генерация видео (Veo-3)
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-prompt">Описание видео</Label>
                <Textarea
                  id="video-prompt"
                  placeholder="Например: Короткое демо-видео распаковки товара с плавными движениями камеры"
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Тип</Label>
                  <select className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background">
                    <option>Видео</option>
                    <option>Stories (9:16)</option>
                    <option>Рилс</option>
                  </select>
                </div>

                <div>
                  <Label>Длительность</Label>
                  <select className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background">
                    <option>5 сек</option>
                    <option>10 сек</option>
                    <option>15 сек</option>
                  </select>
                </div>

                <div>
                  <Label>Анимация</Label>
                  <select className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background">
                    <option>Плавная</option>
                    <option>Динамичная</option>
                    <option>Статичная</option>
                  </select>
                </div>
              </div>

              <Button className="w-full">
                <Icon name="Video" size={16} className="mr-2" />
                Сгенерировать видео
              </Button>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MediaTab;
