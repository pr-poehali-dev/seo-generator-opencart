import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { seoKnowledgeManager, type SEOUpdate, type SEOPolicy } from '@/utils/seoKnowledgeManager';
import SEOIntegrationDiagram from '@/components/SEOIntegrationDiagram';

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
  onPolicyChange?: (policy: SEOPolicy) => void;
}

const ActualizationTab = ({ sources, onPolicyChange }: ActualizationTabProps) => {
  const [updates, setUpdates] = useState<SEOUpdate[]>([]);
  const [policy, setPolicy] = useState<SEOPolicy>(seoKnowledgeManager.getPolicy());

  useEffect(() => {
    setUpdates(seoKnowledgeManager.getUpdates());
  }, []);

  const handlePolicyChange = (newPolicy: Partial<SEOPolicy>) => {
    const updated = seoKnowledgeManager.updatePolicy(newPolicy);
    setPolicy(updated);
    onPolicyChange?.(updated);
    toast.success('Политика актуализации обновлена');
  };

  const handleApproveUpdate = (updateId: string) => {
    seoKnowledgeManager.approveUpdate(updateId);
    setUpdates(seoKnowledgeManager.getUpdates());
    toast.success('Обновление одобрено');
  };

  const handleApplyUpdate = (updateId: string) => {
    seoKnowledgeManager.applyUpdateToPrompts(updateId);
    setUpdates(seoKnowledgeManager.getUpdates());
    toast.success('Обновление применено к промптам');
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дней назад`;
    if (days < 30) return `${Math.floor(days / 7)} недель назад`;
    return `${Math.floor(days / 30)} месяцев назад`;
  };

  const getCategoryColor = (category: SEOUpdate['category']) => {
    switch (category) {
      case 'classic': return 'default';
      case 'trend': return 'secondary';
      case 'experimental': return 'outline';
    }
  };

  const getCategoryLabel = (category: SEOUpdate['category']) => {
    switch (category) {
      case 'classic': return 'Классика';
      case 'trend': return 'Тренд';
      case 'experimental': return 'Эксперимент';
    }
  };

  const getImpactColor = (impact: SEOUpdate['impact']) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const pendingUpdates = updates.filter(u => !u.approved);
  const approvedUpdates = updates.filter(u => u.approved && !u.appliedToPrompts);
  const appliedUpdates = updates.filter(u => u.appliedToPrompts);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <h2 className="text-2xl font-semibold mb-2">Актуализация SEO-знаний</h2>
        <p className="text-muted-foreground text-sm">
          Управление обновлениями и интеграция с промптами
        </p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl space-y-6">
          <SEOIntegrationDiagram />
          
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Sliders" size={20} />
              Политика актуализации
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Уровень новаторства: {policy.innovationLevel}%</Label>
                  <span className="text-xs text-muted-foreground">
                    {policy.innovationLevel < 30 ? 'Консервативный' : 
                     policy.innovationLevel < 70 ? 'Сбалансированный' : 'Новаторский'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={policy.innovationLevel}
                  onChange={(e) => handlePolicyChange({ innovationLevel: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {policy.innovationLevel < 30 && '← Только проверенные классические методы'}
                  {policy.innovationLevel >= 30 && policy.innovationLevel < 70 && '↔ Баланс между классикой и новыми трендами'}
                  {policy.innovationLevel >= 70 && '→ Активное использование новых подходов'}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Автоприменение классических обновлений</p>
                    <p className="text-xs text-muted-foreground">Официальные рекомендации без одобрения</p>
                  </div>
                  <Switch
                    checked={policy.autoApplyClassic}
                    onCheckedChange={(checked) => handlePolicyChange({ autoApplyClassic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Требовать одобрение для трендов</p>
                    <p className="text-xs text-muted-foreground">Проверять новые подходы перед применением</p>
                  </div>
                  <Switch
                    checked={policy.requireApprovalForTrends}
                    onCheckedChange={(checked) => handlePolicyChange({ requireApprovalForTrends: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Требовать одобрение для экспериментов</p>
                    <p className="text-xs text-muted-foreground">Максимальный контроль новых методов</p>
                  </div>
                  <Switch
                    checked={policy.requireApprovalForExperimental}
                    onCheckedChange={(checked) => handlePolicyChange({ requireApprovalForExperimental: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Приоритет Яндекса</p>
                    <p className="text-xs text-muted-foreground">Фокус на рекомендациях Яндекса</p>
                  </div>
                  <Switch
                    checked={policy.prioritizeYandex}
                    onCheckedChange={(checked) => handlePolicyChange({ prioritizeYandex: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">Вес классического SEO: {policy.classicSEOWeight}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={policy.classicSEOWeight}
                  onChange={(e) => handlePolicyChange({ classicSEOWeight: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Базовые SEO-принципы vs экспериментальные подходы в промптах
                </p>
              </div>
            </div>
          </Card>

          {pendingUpdates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="AlertCircle" size={18} className="text-primary" />
                <h3 className="font-semibold">Ожидают одобрения ({pendingUpdates.length})</h3>
              </div>
              
              <div className="space-y-3">
                {pendingUpdates.map((update) => (
                  <Card key={update.id} className="p-4 border-l-4 border-l-primary">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{update.title}</h4>
                            <Badge variant={getCategoryColor(update.category)} className="text-xs">
                              {getCategoryLabel(update.category)}
                            </Badge>
                            <Badge variant={getImpactColor(update.impact)} className="text-xs">
                              {update.impact}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Icon name="ExternalLink" size={12} />
                              {update.source}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {formatDate(update.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Target" size={12} />
                              {update.affectedFields.length} полей
                            </span>
                          </div>

                          <div className="bg-secondary/50 p-3 rounded-md text-sm">
                            <p className="font-medium mb-1">Изменения:</p>
                            {update.changes.map((change, idx) => (
                              <div key={idx} className="mb-2 last:mb-0">
                                {change.before && (
                                  <p className="text-muted-foreground mb-1">
                                    <span className="line-through">{change.before}</span>
                                  </p>
                                )}
                                <p className="text-foreground">→ {change.after}</p>
                                <p className="text-xs text-muted-foreground mt-1">{change.reasoning}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveUpdate(update.id)}
                        >
                          <Icon name="Check" size={14} className="mr-1" />
                          Одобрить
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icon name="X" size={14} className="mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {approvedUpdates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="CheckCircle2" size={18} className="text-accent" />
                <h3 className="font-semibold">Готовы к применению ({approvedUpdates.length})</h3>
              </div>
              
              <div className="space-y-3">
                {approvedUpdates.map((update) => (
                  <Card key={update.id} className="p-4 bg-accent/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{update.title}</h4>
                          <Badge variant={getCategoryColor(update.category)} className="text-xs">
                            {getCategoryLabel(update.category)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          Затронет: {update.affectedFields.join(', ')}
                        </p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleApplyUpdate(update.id)}
                      >
                        <Icon name="ArrowRight" size={14} className="mr-1" />
                        Применить к промптам
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

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

          {appliedUpdates.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" size={18} />
                Применённые обновления ({appliedUpdates.length})
              </h3>
              
              <div className="space-y-3">
                {appliedUpdates.slice(0, 5).map((update) => (
                  <div key={update.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                    <div className="text-muted-foreground whitespace-nowrap text-sm">
                      {formatDate(update.timestamp)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{update.title}</p>
                        <Badge variant={getCategoryColor(update.category)} className="text-xs">
                          {getCategoryLabel(update.category)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Источник: {update.source} — {update.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActualizationTab;