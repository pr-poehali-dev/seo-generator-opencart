import { useState } from 'react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import GenerationTab from '@/components/GenerationTab';
import PromptsTab from '@/components/PromptsTab';
import ActualizationTab from '@/components/ActualizationTab';
import MediaTab from '@/components/MediaTab';
import HistoryTab from '@/components/HistoryTab';
import SettingsTab from '@/components/SettingsTab';
import type { Version } from '@/utils/versionManager';
import type { SEOPolicy } from '@/utils/seoKnowledgeManager';

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
  const [brandDescription, setBrandDescription] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState('');
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

  const [seoPolicy, setSeoPolicy] = useState<SEOPolicy | null>(null);

  const handlePolicyChange = (policy: SEOPolicy) => {
    setSeoPolicy(policy);
  };

  const toggleField = (fieldId: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId);
    } else {
      newSelected.add(fieldId);
    }
    setSelectedFields(newSelected);
  };

  const handleLoadVersion = (version: Version) => {
    setActiveTab(version.data.activeTab);
    setGenerationTopic(version.data.generationTopic);
    setBrandDescription(version.data.brandDescription || '');
    setProductUrl(version.data.productUrl);
    setExtractedData(version.data.extractedData);
    setGenerationResults(version.data.generationResults);
    setSelectedFields(new Set(version.data.selectedFields));
    setTrafficSettings(version.data.trafficSettings);
  };

  const getCurrentState = (): Version['data'] => {
    return {
      activeTab,
      generationTopic,
      brandDescription,
      productUrl,
      extractedData,
      generationResults,
      selectedFields: Array.from(selectedFields),
      trafficSettings
    };
  };

  const handleAnalyzeUrl = async () => {
    if (!productUrl.trim()) {
      toast.error('Введите URL страницы товара');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('https://r2.jamsapi.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: productUrl,
          prompt: 'Извлеки из этой страницы: название товара, бренд, категорию, все характеристики, цену, описание. Также проанализируй все изображения на странице и опиши что на них изображено. Верни структурированную информацию на русском языке.'
        })
      });

      if (!response.ok) throw new Error('Ошибка анализа страницы');

      const data = await response.json();
      const extracted = data.answer || data.content || 'Не удалось извлечь данные';
      
      setExtractedData(extracted);
      
      const productName = extracted.match(/название[:\s]+([^\n]+)/i)?.[1] || 
                          extracted.match(/товар[:\s]+([^\n]+)/i)?.[1] || 
                          'Товар';
      setGenerationTopic(productName.trim());
      
      toast.success('Данные успешно извлечены из страницы');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось проанализировать страницу');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = () => {
    const topic = generationTopic.trim();
    const brand = brandDescription.trim();
    const context = extractedData || '';
    
    if (!topic) {
      toast.error('Введите тему генерации или проанализируйте URL');
      return;
    }

    if (selectedFields.size === 0) {
      toast.error('Выберите хотя бы одно поле для генерации');
      return;
    }

    const results: Record<string, string> = {};
    const brandContext = brand ? `\n\nО бренде: ${brand}` : '';
    
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
            results[fieldId] = brand 
              ? `${generationTopic} ${brand.split('.')[0]}. В наличии, доставка по России, гарантия качества. Закажите онлайн!`
              : `${generationTopic} в наличии. Широкий выбор, доставка по России, гарантия качества. Сравните цены и характеристики. Закажите онлайн!`;
            break;
          case 'keywords':
            results[fieldId] = `${generationTopic.toLowerCase()}, купить ${generationTopic.toLowerCase()}, ${generationTopic.toLowerCase()} цена, ${generationTopic.toLowerCase()} заказать`;
            break;
          case 'product_desc':
            if (context) {
              results[fieldId] = `Представляем ${generationTopic} — товар на основе реальных данных.\n\n${context.slice(0, 800)}${brandContext}\n\nДанное описание сгенерировано на основе актуальной информации с сайта поставщика.`;
            } else {
              const brandIntro = brand ? `${brand.split('.')[0]}. ` : '';
              results[fieldId] = `Представляем ${generationTopic} — продукт, который сочетает в себе высокое качество и современные технологии. ${brandIntro}Этот товар идеально подходит для тех, кто ценит надёжность и функциональность.\n\nОсновные характеристики:\n• Высокое качество изготовления\n• Современный дизайн\n• Оптимальное соотношение цены и качества\n• Гарантия производителя\n\nПреимущества:\nНаш ${generationTopic} отличается долговечностью и удобством использования. Продукт прошёл все необходимые проверки качества и полностью соответствует российским стандартам.${brandContext}\n\nПрименение:\nИдеально подходит для повседневного использования. Простота эксплуатации и надёжность делают этот товар отличным выбором для любого покупателя.`;
            }
            break;
          case 'category_desc':
            results[fieldId] = `В категории ${generationTopic} представлен широкий ассортимент качественных товаров от проверенных производителей. Мы тщательно отбираем каждый продукт, чтобы предложить вам лучшее соотношение цены и качества.${brandContext}\n\nВ нашем каталоге вы найдёте товары на любой вкус и бюджет. Все позиции имеют подробные описания, фотографии и реальные отзывы покупателей. Оформите заказ онлайн с доставкой по всей России!`;
            break;
          case 'short_desc':
            results[fieldId] = brand
              ? `${generationTopic} ${brand.split('.')[0]}. В наличии, быстрая доставка, гарантия.`
              : `${generationTopic} высокого качества. В наличии, быстрая доставка, гарантия. Широкий выбор моделей по выгодным ценам.`;
            break;
          case 'blog_post':
            const brandSection = brand ? `\n\n## О бренде\n\n${brand}` : '';
            results[fieldId] = `# Всё, что нужно знать о ${generationTopic}\n\nВыбор правильного товара — важное решение. В этой статье мы расскажем, на что обратить внимание при покупке и как выбрать оптимальный вариант.${brandSection}\n\n## Основные критерии выбора\n\n1. Качество изготовления\n2. Функциональные характеристики\n3. Цена и гарантийные условия\n4. Отзывы других покупателей\n\n## Актуальные тренды 2026 года\n\nСовременный рынок предлагает широкий выбор решений. Покупатели все чаще обращают внимание на экологичность, надёжность и технологичность продуктов.\n\n## Как выбрать ${generationTopic}\n\nПри выборе рекомендуем учитывать ваши конкретные потребности и бюджет. Наши эксперты всегда готовы помочь с подбором оптимального варианта.\n\n## Заключение\n\nПравильный выбор ${generationTopic} обеспечит вам комфорт и удовлетворение от покупки. Заказывайте в нашем магазине — гарантируем качество и выгодные цены!`;
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-hidden">
          {activeTab === 'generation' && (
            <GenerationTab
              generationTopic={generationTopic}
              setGenerationTopic={setGenerationTopic}
              productUrl={productUrl}
              setProductUrl={setProductUrl}
              fieldTypes={fieldTypes}
              selectedFields={selectedFields}
              toggleField={toggleField}
              generationResults={generationResults}
              handleGenerate={handleGenerate}
              handleAnalyzeUrl={handleAnalyzeUrl}
              isAnalyzing={isAnalyzing}
              extractedData={extractedData}
              brandDescription={brandDescription}
              setBrandDescription={setBrandDescription}
            />
          )}

          {activeTab === 'prompts' && (
            <PromptsTab prompts={prompts} />
          )}

          {activeTab === 'media' && (
            <MediaTab />
          )}

          {activeTab === 'history' && (
            <HistoryTab />
          )}

          {activeTab === 'actualization' && (
            <ActualizationTab 
              sources={sources}
              onPolicyChange={handlePolicyChange}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              trafficSettings={trafficSettings} 
              setTrafficSettings={setTrafficSettings}
              currentState={getCurrentState()}
              onLoadVersion={handleLoadVersion}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;