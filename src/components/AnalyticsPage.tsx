import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Calendar,
} from 'lucide-react';
import {
  useProfile,
  useCategories,
  useTodayCompletions,
  useStreak,
  useTasks,
} from '../lib/hooks';
import {
  supabase,
} from '../lib/supabase';

interface DailyData {
  day: string;
  xp: number;
}

const AnalyticsPage: React.FC = () => {
  const { profile } = useProfile();
  const { categories } = useCategories();
  const { completions } = useTodayCompletions();
  const { streak } = useStreak();
  const { tasks } = useTasks();
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    xp: 0,
    completed: 0,
    activeStreak: 0,
    activeTasks: 0,
  });
  const [categoryProgress, setCategoryProgress] = useState<
    Array<{ name: string; percent: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        // Fetch weekly data
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: completions } = await supabase
          .from('task_completions')
          .select('created_at, xp')
          .gte('created_at', weekAgo.toISOString())
          .eq('user_id', profile.id);

        const weekData: DailyData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString('uz-UZ', {
            weekday: 'short',
          });

          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          const dayXp = (completions || [])
            .filter((c) => {
              const completionDate = new Date(c.created_at);
              return completionDate >= dayStart && completionDate <= dayEnd;
            })
            .reduce((sum, c) => sum + (c.xp || 0), 0);

          weekData.push({
            day: dayStr,
            xp: dayXp,
          });
        }
        setWeeklyData(weekData);

        // Fetch monthly stats
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const { data: monthCompletions } = await supabase
          .from('task_completions')
          .select('xp')
          .gte('created_at', monthAgo.toISOString())
          .eq('user_id', profile.id);

        const totalMonthlyXp = (monthCompletions || []).reduce(
          (sum, c) => sum + (c.xp || 0),
          0
        );

        setMonthlyStats({
          xp: totalMonthlyXp,
          completed: monthCompletions?.length || 0,
          activeStreak: streak?.current_streak || 0,
          activeTasks: tasks.filter((t) => t.is_active).length,
        });

        // Calculate category progress
        if (categories.length > 0 && completions) {
          const progress = categories.map((cat) => {
            const catTasks = tasks.filter((t) => t.category_id === cat.id);
            const completedCatTasks = completions.filter((tc: any) =>
              catTasks.some((t) => t.id === tc.task_id)
            );
            const percent =
              catTasks.length > 0
                ? Math.round((completedCatTasks.length / catTasks.length) * 100)
                : 0;
            return {
              name: cat.name,
              percent,
            };
          });
          setCategoryProgress(progress);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [profile, categories, tasks, completions, streak]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-cyan-400">
        Загрузка...
      </div>
    );
  }

  const maxXp = Math.max(...weeklyData.map((d) => d.xp), 1);
  const bestCategory = categoryProgress.reduce((prev, current) =>
    prev.percent > current.percent ? prev : current
  );
  const weakestCategory = categoryProgress.reduce((prev, current) =>
    prev.percent < current.percent ? prev : current
  );

  return (
    <div className="bg-[#0a0a0f] min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          Аналитика
        </h1>

        {/* Monthly Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-cyan-900 to-gray-950 border border-cyan-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Ойлик ХУ</p>
            <p className="text-2xl font-bold text-cyan-400">{monthlyStats.xp}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-gray-950 border border-green-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Тўлдирилган</p>
            <p className="text-2xl font-bold text-green-400">{monthlyStats.completed}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900 to-gray-950 border border-orange-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Ўриллар</p>
            <p className="text-2xl font-bold text-orange-400">{monthlyStats.activeStreak}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900 to-gray-950 border border-purple-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Фаол Вазифалар</p>
            <p className="text-2xl font-bold text-purple-400">{monthlyStats.activeTasks}</p>
          </div>
        </div>

        {/* Weekly XP Chart */}
        <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Ҳафталик ХУ</h2>
          <div className="space-y-4">
            {weeklyData.map((data, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 w-12">{data.day}</span>
                  <div className="flex-1 mx-4 h-2 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all"
                      style={{
                        width: `${maxXp > 0 ? (data.xp / maxXp) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-cyan-400 font-semibold min-w-[40px] text-right">
                    {data.xp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Progress */}
        <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Категория Борлиги
          </h2>
          <div className="space-y-4">
            {categoryProgress.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{cat.name}</span>
                  <span className="text-cyan-400 font-semibold">{cat.percent}%</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best/Weakest Categories */}
        <div className="grid grid-cols-2 gap-3">
          {bestCategory && (
            <div className="bg-green-950 border border-green-800 rounded-lg p-4">
              <p className="text-xs text-green-400 mb-1">Энг Яхши</p>
              <p className="text-lg font-bold text-green-400">{bestCategory.name}</p>
              <p className="text-xs text-gray-400 mt-2">{bestCategory.percent}%</p>
            </div>
          )}
          {weakestCategory && (
            <div className="bg-red-950 border border-red-800 rounded-lg p-4">
              <p className="text-xs text-red-400 mb-1">Энг Сусай</p>
              <p className="text-lg font-bold text-red-400">{weakestCategory.name}</p>
              <p className="text-xs text-gray-400 mt-2">{weakestCategory.percent}%</p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {weeklyData.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            Аналитик маълумотлари йўқ
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
