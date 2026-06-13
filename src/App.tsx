import React, { useState } from 'react';
import {
  Home,
  ScrollText,
  BarChart3,
  ShoppingBag,
  User,
  Swords,
  MessageCircle,
  TrendingUp,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from './lib/context';
import Auth from './components/Auth';
import HomePage from './components/HomePage';
import QuestPage from './components/QuestPage';
import StatsPage from './components/StatsPage';
import ShopPage from './components/ShopPage';
import ProfilePage from './components/ProfilePage';
import BossPage from './components/BossPage';
import AnalyticsPage from './components/AnalyticsPage';
import AdvisorPage from './components/AdvisorPage';

type PageType = 'home' | 'quests' | 'stats' | 'shop' | 'profile' | 'boss' | 'analytics' | 'advisor';

interface SubPageConfig {
  title: string;
  icon: React.ReactNode;
}

const subPageConfigs: Record<PageType, SubPageConfig | null> = {
  home: null,
  quests: null,
  stats: null,
  shop: null,
  profile: null,
  boss: { title: 'Ҳукмронлар', icon: <Swords className="w-5 h-5" /> },
  analytics: { title: 'Аналитика', icon: <TrendingUp className="w-5 h-5" /> },
  advisor: { title: 'Маслахатчи', icon: <MessageCircle className="w-5 h-5" /> },
};

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-cyan-400">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          Юклаяпман...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const subPageConfig = subPageConfigs[currentPage];
  const showSubPageHeader = subPageConfig !== null;

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white">
      {/* Sub-page Header */}
      {showSubPageHeader && subPageConfig && (
        <div className="sticky top-0 z-40 bg-gray-950 border-b border-cyan-900 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-400 hover:text-cyan-400 transition"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-cyan-400">
              {subPageConfig.icon}
              <h1 className="text-lg font-bold">{subPageConfig.title}</h1>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div>
        {currentPage === 'home' && <HomePage onNavigate={(p) => setCurrentPage(p as PageType)} />}
        {currentPage === 'quests' && <QuestPage />}
        {currentPage === 'stats' && <StatsPage />}
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'boss' && <BossPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'advisor' && <AdvisorPage />}
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-cyan-900 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-around gap-2">
            <NavButton
              icon={<Home className="w-6 h-6" />}
              label="Аста"
              active={currentPage === 'home'}
              onClick={() => setCurrentPage('home')}
            />
            <NavButton
              icon={<ScrollText className="w-6 h-6" />}
              label="Вазифалар"
              active={currentPage === 'quests'}
              onClick={() => setCurrentPage('quests')}
            />
            <NavButton
              icon={<BarChart3 className="w-6 h-6" />}
              label="Статистика"
              active={currentPage === 'stats'}
              onClick={() => setCurrentPage('stats')}
            />
            <NavButton
              icon={<ShoppingBag className="w-6 h-6" />}
              label="Дўкон"
              active={currentPage === 'shop'}
              onClick={() => setCurrentPage('shop')}
            />
            <NavButton
              icon={<User className="w-6 h-6" />}
              label="Профил"
              active={currentPage === 'profile'}
              onClick={() => setCurrentPage('profile')}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
        active
          ? 'text-cyan-400 bg-cyan-900/30'
          : 'text-gray-400 hover:text-cyan-400'
      }`}
    >
      {icon}
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </button>
  );
};

export default App;
