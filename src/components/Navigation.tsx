import { Home, ScrollText, BarChart3, ShoppingBag, User } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Bosh', icon: Home },
  { id: 'quests', label: 'Topshiriqlar', icon: ScrollText },
  { id: 'stats', label: 'Statistika', icon: BarChart3 },
  { id: 'shop', label: "Do'kon", icon: ShoppingBag },
  { id: 'profile', label: 'Profil', icon: User },
];

export default function Navigation({ active, onNavigate }: { active: string; onNavigate: (page: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d15]/95 backdrop-blur-xl border-t border-gray-800/50 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${isActive ? 'text-cyan-400' : 'text-gray-600 hover:text-gray-400'}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
