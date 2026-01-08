import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { versionManager, type Version } from '@/utils/versionManager';

interface VersionManagerProps {
  onLoadVersion: (version: Version) => void;
  currentState: Version['data'];
}

const VersionManager = ({ onLoadVersion, currentState }: VersionManagerProps) => {
  const [versions, setVersions] = useState<Version[]>(versionManager.getAllVersions());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const currentVersionId = versionManager.getCurrentVersionId();

  const handleSaveVersion = () => {
    if (!newVersionName.trim()) {
      toast.error('Введите название версии');
      return;
    }

    const version = versionManager.saveVersion(
      newVersionName,
      newVersionDescription,
      currentState,
      'a6819d3'
    );

    setVersions(versionManager.getAllVersions());
    setIsCreateDialogOpen(false);
    setNewVersionName('');
    setNewVersionDescription('');
    
    toast.success(`Версия "${version.name}" сохранена`);
  };

  const handleLoadVersion = (version: Version) => {
    versionManager.setCurrentVersion(version.id);
    onLoadVersion(version);
    toast.success(`Загружена версия "${version.name}"`);
  };

  const handleDeleteVersion = (id: string, name: string) => {
    if (versionManager.deleteVersion(id)) {
      setVersions(versionManager.getAllVersions());
      toast.success(`Версия "${name}" удалена`);
    } else {
      toast.error('Не удалось удалить версию');
    }
  };

  const handleExportVersion = (id: string, name: string) => {
    const exported = versionManager.exportVersion(id);
    if (exported) {
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Версия экспортирована');
    }
  };

  const handleImportVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const version = versionManager.importVersion(content);
      
      if (version) {
        setVersions(versionManager.getAllVersions());
        toast.success(`Версия "${version.name}" импортирована`);
      } else {
        toast.error('Не удалось импортировать версию');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Управление версиями</h3>
          <p className="text-sm text-muted-foreground">
            Сохраняйте и переключайтесь между разными состояниями приложения
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <label>
              <Icon name="Upload" size={14} className="mr-1" />
              Импорт
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportVersion}
              />
            </label>
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Icon name="Flag" size={14} className="mr-1" />
                Сохранить версию
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новую версию</DialogTitle>
                <DialogDescription>
                  Сохраните текущее состояние как отдельную версию для быстрого переключения
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="version-name">Название версии</Label>
                  <Input
                    id="version-name"
                    placeholder="Например: v1.0 - Базовая декомпозиция"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="version-desc">Описание (опционально)</Label>
                  <Textarea
                    id="version-desc"
                    placeholder="Что изменилось в этой версии..."
                    value={newVersionDescription}
                    onChange={(e) => setNewVersionDescription(e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                
                <div className="text-xs text-muted-foreground bg-secondary p-3 rounded-md">
                  <p className="font-medium mb-1">Будет сохранено:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Все настройки и состояния</li>
                    <li>Результаты генерации</li>
                    <li>Выбранные поля</li>
                    <li>Параметры трафика</li>
                  </ul>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveVersion}>
                  <Icon name="Save" size={14} className="mr-1" />
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        {versions.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center text-muted-foreground">
              <Icon name="Flag" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Сохранённых версий пока нет</p>
              <p className="text-sm mt-2">Создайте первую версию для быстрого переключения</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <Card key={version.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{version.name}</h4>
                      {currentVersionId === version.id && (
                        <Badge variant="default" className="text-xs">
                          Активна
                        </Badge>
                      )}
                      {version.commit && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {version.commit.slice(0, 7)}
                        </Badge>
                      )}
                    </div>
                    
                    {version.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {version.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={12} />
                        {formatDate(version.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="CheckSquare" size={12} />
                        {version.data.selectedFields.length} полей
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoadVersion(version)}
                      disabled={currentVersionId === version.id}
                    >
                      <Icon name="RotateCcw" size={14} className="mr-1" />
                      Загрузить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExportVersion(version.id, version.name)}
                    >
                      <Icon name="Download" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteVersion(version.id, version.name)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default VersionManager;
