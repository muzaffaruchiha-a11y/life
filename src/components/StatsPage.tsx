import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Zap,
  Plus,
  X,
} from 'lucide-react';
import {
  useStats,
  useSkills,
} from '../lib/hooks';

interface ExpandedCategory {
  [key: string]: boolean;
}

interface MonthData {
  month: number;
  year: number;
}

const StatsPage: React.FC = () => {
  const { stats, loading: statsLoading } = useStats();
  const { skills } = useSkills();
  const [expandedCategories, setExpandedCategories] = useState<ExpandedCategory>({});
  const [activeTab, setActiveTab] = useState<'skills' | 'heatmap' | 'calendar'>('skills');
  const [showCreateSkillModal, setShowCreateSkillModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-cyan-400">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0f] min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">Статистика</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-cyan-900">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'skills'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Қўллар
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'heatmap'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Жўмушчилик
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'calendar'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Календар
          </button>
        </div>

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="border border-cyan-800 rounded-lg bg-gray-950 overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(stat.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-900 transition"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold text-cyan-400">{stat.category?.name}</span>
                    <span className="text-xs text-gray-500">Лвл {stat.level}</span>
                  </div>
                  {expandedCategories[stat.id] ? (
                    <ChevronUp className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedCategories[stat.id] && (
                  <div className="border-t border-cyan-900 p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ишчанлик</span>
                        <span className="text-cyan-400">{stat.level}</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                          style={{ width: `${Math.min((stat.level / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Skills in this category */}
                    <div className="mt-3 space-y-2">
                      {skills
                        .filter((s) => s.category_id === stat.category_id)
                        .map((skill) => (
                          <div
                            key={skill.id}
                            className="bg-gray-900 p-2 rounded flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-300">{skill.name}</span>
                            {skill.is_unlocked && (
                              <span className="text-cyan-400 text-xs">Очилди</span>
                            )}
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCategory(stat.id);
                        setShowCreateSkillModal(true);
                      }}
                      className="w-full mt-2 py-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 rounded font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Plus className="w-4 h-4" />
                      Қўл қўшиш
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && <HeatmapView />}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && <CalendarView />}
      </div>

      {/* Create Skill Modal */}
      {showCreateSkillModal && (
        <CreateSkillButton
          categoryId={selectedCategory!}
          onClose={() => setShowCreateSkillModal(false)}
          onSkillCreated={() => {
            setShowCreateSkillModal(false);
          }}
        />
      )}
    </div>
  );
};

interface CreateSkillButtonProps {
  categoryId: string;
  onClose: () => void;
  onSkillCreated: () => void;
}

const CreateSkillButton: React.FC<CreateSkillButtonProps> = ({
  categoryId,
  onClose,
  onSkillCreated,
}) => {
  const { } = useSkills();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return;

    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('skills').insert({
        user_id: user.id,
        category_id: categoryId,
        name,
        description: '',
        icon: '',
        required_level: 1,
        required_xp: 0,
        is_unlocked: false,
      });
      onSkillCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-400">Қўл қўшиш</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Қўл номи"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-cyan-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />


        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded font-semibold transition"
          >
            Бекор
          </button>
          <button
            onClick={handleCreate}
            disabled={!name || loading}
            className="flex-1 py-2 bg-cyan-900 hover:bg-cyan-800 disabled:opacity-50 text-cyan-300 rounded font-semibold transition"
          >
            {loading ? 'Қўшилмоқда...' : 'Қўшиш'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HeatmapView: React.FC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const weeks = [];
  let currentWeek = [];
  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">365 кун жўмушчилиги</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="w-3 h-3 bg-gray-800 rounded border border-gray-700 hover:border-cyan-400 cursor-pointer transition"
                    title={day.toLocaleDateString()}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-800 rounded" /> Жўмуш йўқ
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-900 rounded" /> Паст
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-600 rounded" /> Ўрта
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded" /> Юқори
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarView: React.FC = () => {
  const [monthData, setMonthData] = useState<MonthData>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const daysInMonth = new Date(monthData.year, monthData.month + 1, 0).getDate();
  const firstDayOfMonth = new Date(monthData.year, monthData.month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = new Date(monthData.year, monthData.month, 1).toLocaleDateString('uz-UZ', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setMonthData((prev) => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setMonthData((prev) => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  return (
    <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="text-cyan-400 hover:text-cyan-300 transition"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-cyan-400">{monthName}</h3>
        <button
          onClick={handleNextMonth}
          className="text-cyan-400 hover:text-cyan-300 transition"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Ду', 'Се', 'Чо', 'Па', 'Жу', 'Ша', 'Ё'].map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 font-semibold py-2">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day}
            className="aspect-square flex items-center justify-center bg-gray-900 border border-gray-800 rounded hover:border-cyan-400 cursor-pointer transition text-sm text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPage;
