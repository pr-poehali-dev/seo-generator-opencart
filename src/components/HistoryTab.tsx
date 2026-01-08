import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const HistoryTab = () => {
  return (
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
  );
};

export default HistoryTab;
