import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const SEOIntegrationDiagram = () => {
  return (
    <Card className="p-6 bg-secondary/30">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Icon name="Network" size={20} />
        Как работает интеграция
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            1
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">Сбор обновлений</h4>
            <p className="text-sm text-muted-foreground">
              Источники (Яндекс.Вебмастер, VC.ru, SearchEngines) проверяются автоматически. 
              Новые рекомендации попадают в раздел "Актуализация".
            </p>
          </div>
        </div>

        <div className="pl-4 border-l-2 border-primary/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Категоризация</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Каждое обновление получает категорию:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium">Классика</span> — официальные рекомендации (применяются автоматически)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium">Тренд</span> — новые подходы с доказанной эффективностью
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="font-medium">Эксперимент</span> — непроверенные методы (требуют одобрения)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
            3
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">Политика контроля</h4>
            <p className="text-sm text-muted-foreground">
              Вы настраиваете уровень новаторства (0-100%) и правила одобрения. 
              Это защищает от применения рискованных методов без вашего ведома.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            4
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">Интеграция в промпты</h4>
            <p className="text-sm text-muted-foreground">
              После одобрения обновления <strong>автоматически дополняют промпты</strong> в разделе "Промпты". 
              Вес классического SEO (70% по умолчанию) гарантирует, что новые методы не вредят базовым принципам.
            </p>
          </div>
        </div>

        <div className="pl-4 border-l-2 border-accent/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-semibold">
              5
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Генерация контента</h4>
              <p className="text-sm text-muted-foreground">
                При генерации используются актуализированные промпты. 
                Результат: SEO-контент учитывает последние тренды без ущерба классическим методам.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-accent/10 rounded-md border border-accent/30">
        <p className="text-sm font-medium mb-2 flex items-center gap-2">
          <Icon name="Shield" size={16} />
          Защита от чрезмерного новаторства
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Классические методы всегда имеют приоритет (настраивается 0-100%)</li>
          <li>• Экспериментальные подходы применяются только после одобрения</li>
          <li>• Уровень новаторства регулирует влияние трендов на финальный контент</li>
          <li>• Каждое обновление можно отклонить или откатить</li>
        </ul>
      </div>
    </Card>
  );
};

export default SEOIntegrationDiagram;
