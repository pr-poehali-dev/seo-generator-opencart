import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Icon name="Sparkles" size={24} />
          SEO Генератор
        </h1>
        <p className="text-sm text-muted-foreground mt-1">OpenCart 3 / RU</p>
      </div>
      
      <nav className="p-3">
        <Button
          variant={activeTab === 'generation' ? 'default' : 'ghost'}
          className="w-full justify-start mb-1"
          onClick={() => setActiveTab('generation')}
        >
          <Icon name="Wand2" size={18} className="mr-2" />
          Генерация
        </Button>
        
        <Button
          variant={activeTab === 'prompts' ? 'default' : 'ghost'}
          className="w-full justify-start mb-1"
          onClick={() => setActiveTab('prompts')}
        >
          <Icon name="FileText" size={18} className="mr-2" />
          Промпты
        </Button>
        
        <Button
          variant={activeTab === 'media' ? 'default' : 'ghost'}
          className="w-full justify-start mb-1"
          onClick={() => setActiveTab('media')}
        >
          <Icon name="Image" size={18} className="mr-2" />
          Медиа
        </Button>
        
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          className="w-full justify-start mb-1"
          onClick={() => setActiveTab('history')}
        >
          <Icon name="History" size={18} className="mr-2" />
          История
        </Button>
        
        <Separator className="my-3" />
        
        <Button
          variant={activeTab === 'actualization' ? 'default' : 'ghost'}
          className="w-full justify-start mb-1"
          onClick={() => setActiveTab('actualization')}
        >
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Актуализация
        </Button>
        
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          className="w-full justify-start mb-1"
          onClick={() => setActiveTab('settings')}
        >
          <Icon name="Settings" size={18} className="mr-2" />
          Настройки
        </Button>
      </nav>
    </aside>
  );
};

export default Sidebar;
