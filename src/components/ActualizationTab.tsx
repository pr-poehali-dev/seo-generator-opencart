import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  lastCheck: string;
  status: 'active' | 'pending' | 'error';
}

interface ActualizationTabProps {
  sources: Source[];
}

const ActualizationTab = ({ sources }: ActualizationTabProps) => {
  return (
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
  );
};

export default ActualizationTab;
