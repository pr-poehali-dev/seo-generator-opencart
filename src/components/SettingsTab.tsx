import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import VersionManager from '@/components/VersionManager';
import type { Version } from '@/utils/versionManager';

interface TrafficSettings {
  yandexAndroid: number;
  googleAndroid: number;
  other: number;
  targetYandex: number;
  optimizeChannel: boolean;
}

interface SettingsTabProps {
  trafficSettings: TrafficSettings;
  setTrafficSettings: (settings: TrafficSettings) => void;
  currentState: Version['data'];
  onLoadVersion: (version: Version) => void;
}

const SettingsTab = ({ trafficSettings, setTrafficSettings, currentState, onLoadVersion }: SettingsTabProps) => {
  return (
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

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Оптимизация кода</p>
                  <p className="text-xs text-muted-foreground">Минимизация размера приложения</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <VersionManager 
              onLoadVersion={onLoadVersion}
              currentState={currentState}
            />
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SettingsTab;