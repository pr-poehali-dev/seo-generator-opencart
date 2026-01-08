export interface SEOUpdate {
  id: string;
  title: string;
  description: string;
  source: string;
  category: 'classic' | 'trend' | 'experimental';
  timestamp: number;
  impact: 'critical' | 'high' | 'medium' | 'low';
  affectedFields: string[];
  changes: {
    type: 'limit' | 'structure' | 'keyword' | 'style';
    before?: string;
    after: string;
    reasoning: string;
  }[];
  approved: boolean;
  appliedToPrompts: boolean;
}

export interface SEOPolicy {
  innovationLevel: number;
  autoApplyClassic: boolean;
  requireApprovalForTrends: boolean;
  requireApprovalForExperimental: boolean;
  prioritizeYandex: boolean;
  classicSEOWeight: number;
}

const STORAGE_KEY = 'seo-knowledge-updates';
const POLICY_KEY = 'seo-policy';

export const seoKnowledgeManager = {
  getPolicy(): SEOPolicy {
    const stored = localStorage.getItem(POLICY_KEY);
    return stored ? JSON.parse(stored) : {
      innovationLevel: 50,
      autoApplyClassic: true,
      requireApprovalForTrends: true,
      requireApprovalForExperimental: true,
      prioritizeYandex: true,
      classicSEOWeight: 70
    };
  },

  updatePolicy(policy: Partial<SEOPolicy>): SEOPolicy {
    const current = this.getPolicy();
    const updated = { ...current, ...policy };
    localStorage.setItem(POLICY_KEY, JSON.stringify(updated));
    return updated;
  },

  getUpdates(): SEOUpdate[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultUpdates();
  },

  getDefaultUpdates(): SEOUpdate[] {
    return [
      {
        id: 'upd_1',
        title: 'Обновлены лимиты Title для Яндекса',
        description: 'Яндекс изменил оптимальную длину Title с 60 до 65 символов',
        source: 'Яндекс.Вебмастер',
        category: 'classic',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        impact: 'high',
        affectedFields: ['title'],
        changes: [{
          type: 'limit',
          before: '60 символов',
          after: '65 символов',
          reasoning: 'Яндекс теперь показывает более длинные заголовки в поиске без обрезки'
        }],
        approved: true,
        appliedToPrompts: true
      },
      {
        id: 'upd_2',
        title: 'Новые рекомендации по структуре описаний',
        description: 'Акцент на маркированные списки и подзаголовки улучшает CTR',
        source: 'VC.ru/SEO',
        category: 'trend',
        timestamp: Date.now() - 12 * 24 * 60 * 60 * 1000,
        impact: 'medium',
        affectedFields: ['product_desc', 'category_desc'],
        changes: [{
          type: 'structure',
          after: 'Структурируйте текст с подзаголовками (##), маркированными списками и короткими абзацами',
          reasoning: 'Исследования показывают рост CTR на 15% при структурированных описаниях'
        }],
        approved: true,
        appliedToPrompts: false
      },
      {
        id: 'upd_3',
        title: 'Эмодзи в Title повышают CTR',
        description: 'Эксперименты показывают рост кликов на 8-12% при использовании эмодзи',
        source: 'SearchEngines.ru',
        category: 'experimental',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        impact: 'low',
        affectedFields: ['title', 'h1'],
        changes: [{
          type: 'style',
          after: 'Можно добавить релевантный эмодзи в начале или конце заголовка (опционально)',
          reasoning: 'Эмодзи привлекают внимание, но могут выглядеть непрофессионально в B2B'
        }],
        approved: false,
        appliedToPrompts: false
      },
      {
        id: 'upd_4',
        title: 'Семантическое ядро: переход на LSI-ключи',
        description: 'Яндекс лучше ранжирует тексты с LSI и синонимами, чем с точным вхождением',
        source: 'Яндекс.Вебмастер',
        category: 'classic',
        timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000,
        impact: 'critical',
        affectedFields: ['product_desc', 'category_desc', 'blog_post'],
        changes: [{
          type: 'keyword',
          before: 'Точное вхождение ключа 3-5 раз',
          after: 'Естественное использование ключа + синонимы + LSI-слова',
          reasoning: 'Алгоритм YATI распознаёт переспам и понижает страницы с избыточным повторением'
        }],
        approved: true,
        appliedToPrompts: true
      }
    ];
  },

  saveUpdate(update: SEOUpdate): void {
    const updates = this.getUpdates();
    const index = updates.findIndex(u => u.id === update.id);
    
    if (index >= 0) {
      updates[index] = update;
    } else {
      updates.unshift(update);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  },

  approveUpdate(updateId: string): void {
    const updates = this.getUpdates();
    const update = updates.find(u => u.id === updateId);
    
    if (update) {
      update.approved = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
    }
  },

  applyUpdateToPrompts(updateId: string): void {
    const updates = this.getUpdates();
    const update = updates.find(u => u.id === updateId);
    
    if (update && update.approved) {
      update.appliedToPrompts = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
    }
  },

  getApplicableUpdates(policy: SEOPolicy): SEOUpdate[] {
    const updates = this.getUpdates();
    
    return updates.filter(update => {
      if (!update.approved) {
        if (update.category === 'classic' && policy.autoApplyClassic) {
          return true;
        }
        if (update.category === 'trend' && !policy.requireApprovalForTrends) {
          return true;
        }
        if (update.category === 'experimental' && !policy.requireApprovalForExperimental) {
          return true;
        }
        return false;
      }
      
      return !update.appliedToPrompts;
    });
  },

  getInnovationMultiplier(policy: SEOPolicy, category: SEOUpdate['category']): number {
    const level = policy.innovationLevel;
    
    if (category === 'classic') {
      return 1.0;
    } else if (category === 'trend') {
      return 0.5 + (level / 100) * 0.5;
    } else {
      return (level / 100);
    }
  },

  generateEnhancedPrompt(
    basePrompt: string, 
    updates: SEOUpdate[], 
    policy: SEOPolicy
  ): string {
    let enhanced = basePrompt;
    
    const sortedUpdates = updates
      .filter(u => u.approved)
      .sort((a, b) => {
        const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return impactOrder[a.impact] - impactOrder[b.impact];
      });
    
    const additions: string[] = [];
    
    for (const update of sortedUpdates) {
      const multiplier = this.getInnovationMultiplier(policy, update.category);
      
      if (multiplier > 0.3) {
        for (const change of update.changes) {
          const instruction = change.after;
          
          if (update.category === 'classic' || multiplier > 0.6) {
            additions.push(instruction);
          } else if (multiplier > 0.3) {
            additions.push(`[Опционально] ${instruction}`);
          }
        }
      }
    }
    
    if (additions.length > 0) {
      enhanced += '\n\nДополнительные рекомендации:\n' + additions.map((a, i) => `${i + 1}. ${a}`).join('\n');
    }
    
    return enhanced;
  }
};
