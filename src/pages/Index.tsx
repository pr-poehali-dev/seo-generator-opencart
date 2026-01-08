import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface FieldType {
  id: string;
  label: string;
  category: string;
  charLimit: number;
  enabled: boolean;
}

interface Prompt {
  id: string;
  fieldType: string;
  template: string;
  aiBalance: number;
  variables: string[];
}

interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  lastCheck: string;
  status: 'active' | 'pending' | 'error';
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('generation');
  const [generationTopic, setGenerationTopic] = useState('');
  const [generationResults, setGenerationResults] = useState<Record<string, string>>({});
  
  const [fieldTypes] = useState<FieldType[]>([
    { id: 'h1', label: 'H1 заголовок', category: 'Заголовки', charLimit: 65, enabled: false },
    { id: 'title', label: 'Title (meta)', category: 'Meta теги', charLimit: 60, enabled: false },
    { id: 'description', label: 'Meta Description', category: 'Meta теги', charLimit: 160, enabled: false },
    { id: 'keywords', label: 'Meta Keywords', category: 'Meta теги', charLimit: 200, enabled: false },
    { id: 'product_desc', label: 'Описание товара', category: 'Описания', charLimit: 1500, enabled: false },
    { id: 'category_desc', label: 'Описание категории', category: 'Описания', charLimit: 1200, enabled: false },
    { id: 'short_desc', label: 'Краткое описание', category: 'Описания', charLimit: 300, enabled: false },
    { id: 'blog_post', label: 'Статья блога', category: 'Контент', charLimit: 5000, enabled: false },
    { id: 'news', label: 'Новость', category: 'Контент', charLimit: 800, enabled: false },
    { id: 'tags', label: 'Теги', category: 'Структура', charLimit: 100, enabled: false },
  ]);

  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  const [prompts] = useState<Prompt[]>([
    {
      id: 'h1',
      fieldType: 'H1 заголовок',
      template: 'Создай SEO-оптимизированный H1 для товара {product_name} в категории {category}. Учитывай поисковые запросы Яндекса и включи ключевые слова естественным образом. Длина: до 65 символов.',
      aiBalance: 70,
      variables: ['{product_name}', '{category}', '{brand}']
    },
    {
      id: 'description',
      fieldType: 'Meta Description',
      template: 'Напиши привлекательное meta description для {product_name}. Включи УТП, призыв к действию и ключевые запросы под Яндекс. Длина: 150-160 символов.',
      aiBalance: 80,
      variables: ['{product_name}', '{price}', '{category}']
    },
    {
      id: 'product_desc',
      fieldType: 'Описание товара',
      template: 'Создай подробное описание товара {product_name} бренда {brand}. Структура: введение, характеристики, преимущества, применение. Оптимизируй под запросы Яндекс.Маркет. Длина: 1000-1500 символов.',
      aiBalance: 90,
      variables: ['{product_name}', '{brand}', '{category}', '{specs}']
    }
  ]);

  const [sources] = useState<Source[]>([
    { id: '1', name: 'Справка Яндекс.Вебмастер', url: 'https://yandex.ru/support/webmaster/', category: 'Официальные гайды', lastCheck: '6 часов назад', status: 'active' },
    { id: '2', name: 'SearchEngines.ru — Новости', url: 'https://www.searchengines.ru/', category: 'Новости SEO', lastCheck: '12 часов назад', status: 'active' },
    { id: '3', name: 'VC.ru — #SEO', url: 'https://vc.ru/tag/seo', category: 'Кейсы и аналитика', lastCheck: '1 день назад', status: 'active' },
    { id: '4', name: 'Блог Яндекс.Маркет', url: 'https://market.yandex.ru/blog', category: 'E-commerce', lastCheck: '2 дня назад', status: 'active' },
    { id: '5', name: 'SEO Community Telegram', url: 't.me/seo_community', category: 'Комьюнити', lastCheck: '4 часа назад', status: 'active' },
    { id: '6', name: 'Habr — SEO', url: 'https://habr.com/ru/flows/seo/', category: 'Техническое SEO', lastCheck: 'Ожидание', status: 'pending' },
  ]);

  const [trafficSettings, setTrafficSettings] = useState({
    yandexAndroid: 80,
    googleAndroid: 15,
    other: 5,
    targetYandex: 85,
    optimizeChannel: true
  });

  const toggleField = (fieldId: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId);
    } else {
      newSelected.add(fieldId);
    }
    setSelectedFields(newSelected);
  };

  const handleGenerate = () => {
    if (!generationTopic.trim()) {
      toast.error('Введите тему генерации');
      return;
    }

    if (selectedFields.size === 0) {
      toast.error('Выберите хотя бы одно поле для генерации');
      return;
    }

    const results: Record<string, string> = {};
    
    selectedFields.forEach(fieldId => {
      const field = fieldTypes.find(f => f.id === fieldId);
      if (field) {
        switch(fieldId) {
          case 'h1':
            results[fieldId] = `${generationTopic} — купить в интернет-магазине с доставкой`;
            break;
          case 'title':
            results[fieldId] = `${generationTopic} | Каталог, цены, отзывы | Интернет-магазин`;
            break;
          case 'description':
            results[fieldId] = `${generationTopic} в наличии. Широкий выбор, доставка по России, гарантия качества. Сравните цены и характеристики. Закажите онлайн!`;
            break;
          case 'keywords':
            results[fieldId] = `${generationTopic.toLowerCase()}, купить ${generationTopic.toLowerCase()}, ${generationTopic.toLowerCase()} цена, ${generationTopic.toLowerCase()} заказать`;
            break;
          case 'product_desc':
            results[fieldId] = `Представляем ${generationTopic} — продукт, который сочетает в себе высокое качество и современные технологии. Этот товар идеально подходит для тех, кто ценит надёжность и функциональность.\n\nОсновные характеристики:\n• Высокое качество изготовления\n• Современный дизайн\n• Оптимальное соотношение цены и качества\n• Гарантия производителя\n\nПреимущества:\nНаш ${generationTopic} отличается долговечностью и удобством использования. Продукт прошёл все необходимые проверки качества и полностью соответствует российским стандартам.\n\nПрименение:\nИдеально подходит для повседневного использования. Простота эксплуатации и надёжность делают этот товар отличным выбором для любого покупателя.`;
            break;
          case 'category_desc':
            results[fieldId] = `В категории ${generationTopic} представлен широкий ассортимент качественных товаров от проверенных производителей. Мы тщательно отбираем каждый продукт, чтобы предложить вам лучшее соотношение цены и качества.\n\nВ нашем каталоге вы найдёте товары на любой вкус и бюджет. Все позиции имеют подробные описания, фотографии и реальные отзывы покупателей. Оформите заказ онлайн с доставкой по всей России!`;
            break;
          case 'short_desc':
            results[fieldId] = `${generationTopic} высокого качества. В наличии, быстрая доставка, гарантия. Широкий выбор моделей по выгодным ценам.`;
            break;
          case 'blog_post':
            results[fieldId] = `# Всё, что нужно знать о ${generationTopic}\n\nВыбор правильного товара — важное решение. В этой статье мы расскажем, на что обратить внимание при покупке и как выбрать оптимальный вариант.\n\n## Основные критерии выбора\n\n1. Качество изготовления\n2. Функциональные характеристики\n3. Цена и гарантийные условия\n4. Отзывы других покупателей\n\n## Актуальные тренды 2026 года\n\nСовременный рынок предлагает широкий выбор решений. Покупатели все чаще обращают внимание на экологичность, надёжность и технологичность продуктов.\n\n## Как выбрать ${generationTopic}\n\nПри выборе рекомендуем учитывать ваши конкретные потребности и бюджет. Наши эксперты всегда готовы помочь с подбором оптимального варианта.\n\n## Заключение\n\nПравильный выбор ${generationTopic} обеспечит вам комфорт и удовлетворение от покупки. Заказывайте в нашем магазине — гарантируем качество и выгодные цены!`;
            break;
          case 'news':
            results[fieldId] = `Новое поступление: ${generationTopic} теперь в наличии!\n\nРады сообщить, что в нашем каталоге появились новинки в категории ${generationTopic}. Расширенный ассортимент, актуальные модели и выгодные цены.\n\nУспейте оформить заказ с дополнительной скидкой 10% для первых покупателей. Акция действует до конца месяца. Доставка по всей России!`;
            break;
          case 'tags':
            results[fieldId] = `${generationTopic.toLowerCase()}, купить онлайн, доставка, качество, выгодная цена`;
            break;
        }
      }
    });

    setGenerationResults(results);
    toast.success(`Сгенерировано ${selectedFields.size} полей`);
  };

  const groupedFields = fieldTypes.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldType[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <aside className="w-64 border-r border-border bg-card">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Icon name="Sparkles" size={24} />
              SEO Генератор
            </h1>
            <p className="text-sm text-muted-foreground mt-1">OpenCart 3 / RU</p>
          </div>
          
          <nav className="p-3">
            <Button
              variant={activeTab === 'generation' ? 'default' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('generation')}
            >
              <Icon name="Wand2" size={18} className="mr-2" />
              Генерация
            </Button>
            
            <Button
              variant={activeTab === 'prompts' ? 'default' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('prompts')}
            >
              <Icon name="FileText" size={18} className="mr-2" />
              Промпты
            </Button>
            
            <Button
              variant={activeTab === 'media' ? 'default' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('media')}
            >
              <Icon name="Image" size={18} className="mr-2" />
              Медиа
            </Button>
            
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('history')}
            >
              <Icon name="History" size={18} className="mr-2" />
              История
            </Button>
            
            <Separator className="my-3" />
            
            <Button
              variant={activeTab === 'actualization' ? 'default' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('actualization')}
            >
              <Icon name="RefreshCw" size={18} className="mr-2" />
              Актуализация
            </Button>
            
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('settings')}
            >
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </Button>
          </nav>
        </aside>

        <main className="flex-1 overflow-hidden">
          {activeTab === 'generation' && (
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-6">
                <h2 className="text-2xl font-semibold mb-4">Генерация SEO-контента</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Тема генерации</Label>
                    <Input
                      id="topic"
                      placeholder="Например: Беспроводные наушники Sony WH-1000XM5"
                      value={generationTopic}
                      onChange={(e) => setGenerationTopic(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Выберите поля для генерации</Label>
                    <ScrollArea className="h-48 rounded-md border border-border p-4">
                      {Object.entries(groupedFields).map(([category, fields]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <p className="text-sm font-medium text-muted-foreground mb-2">{category}</p>
                          <div className="space-y-2">
                            {fields.map((field) => (
                              <div key={field.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={field.id}
                                    checked={selectedFields.has(field.id)}
                                    onCheckedChange={() => toggleField(field.id)}
                                  />
                                  <label
                                    htmlFor={field.id}
                                    className="text-sm cursor-pointer hover:text-foreground transition-colors"
                                  >
                                    {field.label}
                                  </label>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {field.charLimit} симв.
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <Button onClick={handleGenerate} className="w-full" size="lg">
                    <Icon name="Sparkles" size={18} className="mr-2" />
                    Сгенерировать
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                {Object.keys(generationResults).length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Результаты генерации появятся здесь</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl">
                    {Array.from(selectedFields).map((fieldId) => {
                      const field = fieldTypes.find(f => f.id === fieldId);
                      const result = generationResults[fieldId];
                      
                      if (!field || !result) return null;
                      
                      const charCount = result.length;
                      const isOverLimit = charCount > field.charLimit;
                      
                      return (
                        <Card key={fieldId} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{field.label}</h3>
                            <Badge variant={isOverLimit ? 'destructive' : 'default'}>
                              {charCount} / {field.charLimit}
                            </Badge>
                          </div>
                          
                          <Textarea
                            value={result}
                            readOnly
                            className="min-h-[100px] font-mono text-sm"
                          />
                          
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(result);
                                toast.success('Скопировано в буфер обмена');
                              }}
                            >
                              <Icon name="Copy" size={14} className="mr-1" />
                              Копировать
                            </Button>
                            <Button size="sm" variant="outline">
                              <Icon name="RefreshCw" size={14} className="mr-1" />
                              Регенерировать
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-6">
                <h2 className="text-2xl font-semibold mb-2">Управление промптами</h2>
                <p className="text-muted-foreground text-sm">
                  Настройте шаблоны генерации для каждого типа поля OpenCart
                </p>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-4xl">
                  {prompts.map((prompt) => (
                    <Card key={prompt.id} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{prompt.fieldType}</h3>
                        <Badge variant="secondary">ID: {prompt.id}</Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1">Шаблон промпта</Label>
                          <Textarea
                            value={prompt.template}
                            readOnly
                            className="min-h-[120px] text-sm"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-muted-foreground">
                              Баланс: AI vs Переменные
                            </Label>
                            <span className="text-sm font-medium">{prompt.aiBalance}% AI</span>
                          </div>
                          <Progress value={prompt.aiBalance} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Строгие переменные</span>
                            <span>Свободный AI</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Доступные переменные
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {prompt.variables.map((variable) => (
                              <Badge key={variable} variant="outline" className="font-mono text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Icon name="Edit" size={14} className="mr-1" />
                            Редактировать
                          </Button>
                          <Button size="sm" variant="outline">
                            <Icon name="TestTube" size={14} className="mr-1" />
                            Тестировать
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button variant="outline" className="w-full">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить новый промпт
                  </Button>
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTab === 'media' && (
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
          )}

          {activeTab === 'history' && (
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">История генераций</h2>
                    <p className="text-muted-foreground text-sm">
                      Все созданные SEO-материалы и медиа
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Очистить текст
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Очистить медиа
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Icon name="History" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>История генераций пуста</p>
                  <p className="text-sm mt-2">Создайте первый SEO-контент в разделе "Генерация"</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actualization' && (
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-6">
                <h2 className="text-2xl font-semibold mb-2">Актуализация SEO-знаний</h2>
                <p className="text-muted-foreground text-sm">
                  Автоматическое обновление алгоритмов на основе актуальных источников
                </p>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="max-w-4xl space-y-6">
                  <Card className="p-5 bg-accent/10 border-accent">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-accent/20">
                        <Icon name="Clock" size={24} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Расписание проверки</h3>
                        <p className="text-sm text-muted-foreground">Каждую среду в 03:00 МСК</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icon name="Settings" size={14} className="mr-1" />
                        Изменить
                      </Button>
                    </div>
                  </Card>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Источники знаний ({sources.length})</h3>
                      <Button variant="outline" size="sm">
                        <Icon name="Plus" size={14} className="mr-1" />
                        Добавить источник
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {sources.map((source) => (
                        <Card key={source.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{source.name}</h4>
                                <Badge
                                  variant={
                                    source.status === 'active'
                                      ? 'default'
                                      : source.status === 'pending'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {source.status === 'active' && 'Активен'}
                                  {source.status === 'pending' && 'Ожидание'}
                                  {source.status === 'error' && 'Ошибка'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">{source.url}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Icon name="Tag" size={12} />
                                  {source.category}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="Clock" size={12} />
                                  {source.lastCheck}
                                </span>
                              </div>
                            </div>

                            <Button variant="ghost" size="sm">
                              <Icon name="RefreshCw" size={14} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Card className="p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Icon name="TrendingUp" size={18} />
                      Последние обновления алгоритма
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-3 pb-3 border-b border-border last:border-0">
                        <div className="text-muted-foreground whitespace-nowrap">5 дней назад</div>
                        <div>
                          <p className="font-medium mb-1">Обновлены лимиты Title для Яндекса</p>
                          <p className="text-muted-foreground">Источник: Яндекс.Вебмастер — оптимальная длина увеличена до 65 символов</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pb-3 border-b border-border last:border-0">
                        <div className="text-muted-foreground whitespace-nowrap">12 дней назад</div>
                        <div>
                          <p className="font-medium mb-1">Новые рекомендации по структуре описаний</p>
                          <p className="text-muted-foreground">Источник: VC.ru/SEO — акцент на маркированные списки и подзаголовки</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full flex flex-col">
              <div className="border-b border-border p-6">
                <h2 className="text-2xl font-semibold mb-2">Глобальные настройки</h2>
                <p className="text-muted-foreground text-sm">
                  Управление параметрами трафика и оптимизации
                </p>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl space-y-6">
                  <Card className="p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="BarChart3" size={20} />
                      Текущее распределение трафика
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Яндекс (Android)</Label>
                          <span className="text-sm font-medium">{trafficSettings.yandexAndroid}%</span>
                        </div>
                        <Progress value={trafficSettings.yandexAndroid} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Google (Android)</Label>
                          <span className="text-sm font-medium">{trafficSettings.googleAndroid}%</span>
                        </div>
                        <Progress value={trafficSettings.googleAndroid} className="h-2 [&>div]:bg-accent" />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Другие источники</Label>
                          <span className="text-sm font-medium">{trafficSettings.other}%</span>
                        </div>
                        <Progress value={trafficSettings.other} className="h-2 [&>div]:bg-muted-foreground" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="Target" size={20} />
                      Целевые показатели
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                        <div>
                          <p className="font-medium">Оптимизировать каналы трафика</p>
                          <p className="text-sm text-muted-foreground">
                            Алгоритм будет подстраивать SEO под желаемое распределение
                          </p>
                        </div>
                        <Switch
                          checked={trafficSettings.optimizeChannel}
                          onCheckedChange={(checked) =>
                            setTrafficSettings({ ...trafficSettings, optimizeChannel: checked })
                          }
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Целевая доля Яндекс: {trafficSettings.targetYandex}%</Label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={trafficSettings.targetYandex}
                          onChange={(e) =>
                            setTrafficSettings({ ...trafficSettings, targetYandex: parseInt(e.target.value) })
                          }
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          {trafficSettings.targetYandex > trafficSettings.yandexAndroid
                            ? `↑ Увеличить долю Яндекс на ${trafficSettings.targetYandex - trafficSettings.yandexAndroid}%`
                            : trafficSettings.targetYandex < trafficSettings.yandexAndroid
                            ? `↓ Снизить долю Яндекс на ${trafficSettings.yandexAndroid - trafficSettings.targetYandex}%`
                            : '✓ Текущее распределение соответствует целевому'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Icon name="Zap" size={20} />
                      Производительность
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Кэширование промптов</p>
                          <p className="text-xs text-muted-foreground">Ускоряет генерацию повторяющихся запросов</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Оптимизация кода</p>
                          <p className="text-xs text-muted-foreground">Минимизация размера приложения</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
