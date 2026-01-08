import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface GenerationTabProps {
  generationTopic: string;
  setGenerationTopic: (topic: string) => void;
  fieldTypes: FieldType[];
  selectedFields: Set<string>;
  toggleField: (fieldId: string) => void;
  generationResults: Record<string, string>;
  handleGenerate: () => void;
}

const GenerationTab = ({
  generationTopic,
  setGenerationTopic,
  fieldTypes,
  selectedFields,
  toggleField,
  generationResults,
  handleGenerate
}: GenerationTabProps) => {
  const groupedFields = fieldTypes.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldType[]>);

  return (
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
  );
};

export default GenerationTab;
