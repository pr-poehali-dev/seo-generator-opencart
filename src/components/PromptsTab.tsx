import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Prompt {
  id: string;
  fieldType: string;
  template: string;
  aiBalance: number;
  variables: string[];
}

interface PromptsTabProps {
  prompts: Prompt[];
}

const PromptsTab = ({ prompts }: PromptsTabProps) => {
  return (
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
  );
};

export default PromptsTab;
