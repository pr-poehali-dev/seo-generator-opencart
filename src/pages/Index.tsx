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
    { id: 'brand_desc', label: 'Описание бренда', category: 'Описания', charLimit: 800, enabled: false },
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
      const response = await fetch('https://functions.poehali.dev/56cbafb3-e439-4d58-975a-b974dfd5ca8f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'product',
          productUrl: productUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка анализа страницы');
      }

      const data = await response.json();
      
      console.log('📦 Собранные данные:', data);
      
      const extracted = data.extracted_data || 'Не удалось извлечь данные';
      setExtractedData(extracted);
      
      const productName = data.product_name || 'Товар';
      setGenerationTopic(productName.trim());
      
      toast.success('Данные успешно извлечены из страницы');
      
      console.log('✅ Данные сохранены в контекст:', {
        topic: productName,
        extractedLength: extracted.length,
        brand: data.brand
      });
    } catch (error) {
      console.error('❌ Ошибка анализа:', error);
      toast.error('Не удалось проанализировать страницу');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    const topic = generationTopic.trim();
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
    let brandInfo = '';
    let categoryAnalysis: any = null;
    
    if (selectedFields.has('brand_desc')) {
      try {
        const brandName = topic.split(' ').find(word => 
          word.length > 2 && word[0] === word[0].toUpperCase()
        ) || topic;
        
        const response = await fetch('https://functions.poehali.dev/56cbafb3-e439-4d58-975a-b974dfd5ca8f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: 'brand', brandName: brandName })
        });
        
        const data = await response.json();
        
        if (data.brandInfo) {
          brandInfo = data.brandInfo;
        }
      } catch (error) {
        console.error('Ошибка при поиске информации о бренде:', error);
      }
    }
    
    if (selectedFields.has('category_desc') && productUrl.trim()) {
      try {
        toast.info('Анализируем категорию...');
        
        const response = await fetch('https://functions.poehali.dev/56cbafb3-e439-4d58-975a-b974dfd5ca8f', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            type: 'category', 
            categoryUrl: productUrl,
            categoryName: topic
          })
        });
        
        const data = await response.json();
        
        if (data.description) {
          categoryAnalysis = data;
        }
      } catch (error) {
        console.error('Ошибка при анализе категории:', error);
        toast.error('Не удалось проанализировать категорию');
      }
    }
    
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
            results[fieldId] = `${generationTopic} в наличии. Широкий ассортимент, доставка по России, гарантия качества. Заказывайте онлайн с выгодой!`;
            break;
          case 'keywords':
            const keywords = generationTopic.toLowerCase().split(' ');
            results[fieldId] = `${keywords.join(', ')}, купить, цена, отзывы, доставка, интернет-магазин`;
            break;
          case 'product_desc':
            results[fieldId] = context 
              ? `${generationTopic}\n\n${context.substring(0, 800)}\n\nМы предлагаем широкий выбор товаров с гарантией качества и быстрой доставкой по всей России. Закажите ${generationTopic.toLowerCase()} прямо сейчас и получите профессиональную консультацию наших специалистов.`
              : `${generationTopic}\n\nПредставляем вашему вниманию ${generationTopic.toLowerCase()}. Этот товар отличается высоким качеством и надёжностью. Идеально подходит для повседневного использования.\n\nОсновные преимущества:\n• Высокое качество материалов\n• Современный дизайн\n• Длительный срок службы\n• Доступная цена\n\nМы предлагаем быструю доставку по всей России и гарантию на все товары. Закажите ${generationTopic.toLowerCase()} прямо сейчас!`;
            break;
          case 'category_desc':
            if (categoryAnalysis && categoryAnalysis.description) {
              results[fieldId] = categoryAnalysis.description;
            } else {
              results[fieldId] = `Каталог товаров категории ${generationTopic}. Большой выбор качественных товаров с доставкой по России. Низкие цены, гарантия качества, профессиональные консультации. Закажите онлайн или по телефону!`;
            }
            break;
          case 'short_desc':
            results[fieldId] = `${generationTopic} в наличии. Доставка по России. Гарантия качества. Низкие цены!`;
            break;
          case 'brand_desc':
            if (brandInfo) {
              results[fieldId] = `О бренде ${generationTopic}\n\n${brandInfo}\n\nНаши преимущества:\n• Широкий ассортимент оригинальной продукции\n• Гарантия качества на все товары\n• Быстрая доставка по России\n• Профессиональная поддержка клиентов\n\nВыбирайте качество и надёжность проверенного бренда!`;
            } else {
              results[fieldId] = `О бренде ${generationTopic}\n\nМы — надёжный производитель с многолетним опытом на рынке. Наша миссия — предоставлять качественные товары по доступным ценам.\n\nНаши преимущества:\n• Собственное производство\n• Контроль качества на всех этапах\n• Гарантия на всю продукцию\n• Профессиональная поддержка клиентов\n\nМы постоянно совершенствуем наши товары, используя современные технологии и прислушиваясь к отзывам покупателей. Выбирая нас, вы выбираете надёжность и качество!`;
            }
            break;
          case 'blog_post':
            results[fieldId] = context
              ? `# Всё о ${generationTopic}\n\n${context.substring(0, 2000)}\n\n## Почему стоит выбрать именно этот товар?\n\nЭтот товар пользуется большой популярностью благодаря своим характеристикам и надёжности. Подходит как для профессионального, так и для домашнего использования.\n\n## Как сделать заказ?\n\nОформить заказ очень просто — добавьте товар в корзину и следуйте инструкциям. Доставка осуществляется по всей России!`
              : `# ${generationTopic}: полное руководство\n\nВ этой статье мы расскажем всё, что нужно знать о ${generationTopic.toLowerCase()}. Вы узнаете о преимуществах, характеристиках и особенностях использования.\n\n## Основные характеристики\n\nТовар отличается высоким качеством и надёжностью. Современные технологии производства гарантируют долгий срок службы.\n\n## Преимущества\n\n• Высокое качество\n• Доступная цена\n• Гарантия производителя\n• Быстрая доставка\n\n## Заключение\n\nЗакажите ${generationTopic.toLowerCase()} прямо сейчас и убедитесь в качестве сами!`;
            break;
          case 'news':
            results[fieldId] = `Новинка: ${generationTopic} уже в наличии! Спешите заказать по специальной цене. Ограниченное количество. Доставка по России бесплатно при заказе от 5000 рублей.`;
            break;
          case 'tags':
            const tags = generationTopic.toLowerCase().split(' ').slice(0, 5);
            results[fieldId] = [...tags, 'купить', 'цена', 'доставка', 'интернет-магазин'].join(', ');
            break;
          default:
            results[fieldId] = `Сгенерированный контент для: ${field.label}`;
        }
      }
    });

    setGenerationResults(results);
    toast.success(`Успешно сгенерировано полей: ${selectedFields.size}`);
  };

  return (
    <div className="h-screen flex bg-background">
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
          />
        )}
        
        {activeTab === 'prompts' && (
          <PromptsTab prompts={prompts} />
        )}
        
        {activeTab === 'actualization' && (
          <ActualizationTab sources={sources} />
        )}
        
        {activeTab === 'media' && (
          <MediaTab />
        )}
        
        {activeTab === 'history' && (
          <HistoryTab
            onLoadVersion={handleLoadVersion}
            getCurrentState={getCurrentState}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab
            trafficSettings={trafficSettings}
            setTrafficSettings={setTrafficSettings}
            seoPolicy={seoPolicy}
            onPolicyChange={handlePolicyChange}
          />
        )}
      </main>
    </div>
  );
};

export default Index;