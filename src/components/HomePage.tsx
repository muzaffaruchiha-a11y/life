import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile, useTasks, useStreak, useStats, useBosses, useAchievements } from '../lib/hooks';
import { completeTask } from '../lib/game';
import { DIFFICULTY_CONFIG, getDailyRank, getTaskStatus, shouldShowTaskToday, type Task } from '../lib/types';
import StatusHeader from './StatusHeader';
import { Check, ChevronRight, Swords, Trophy, TrendingUp } from 'lucide-react';

export default function HomePage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { profile, refetch: refetchProfile } = useProfile();
  const { tasks, refetch: refetchTasks } = useTasks();
  const { streak, refetch: refetchStreak } = useStreak();
  const { stats, refetch: refetchStats } = useStats();
  const { bosses } = useBosses();
  const { achievements } = useAchievements();

  const [completing, setCompleting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<{ xp: number; coins: number } | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Filter today's visible tasks using the date-based logic
  const todayTasks = tasks.filter(t => t.is_active && shouldShowTaskToday(t));

  // Count how many are done today vs total
  const totalToday = todayTasks.length;
  const completedToday = todayTasks.filter(t => {
    const s = getTaskStatus(t);
    return s === 'completed_today' || s === 'completed_forever';
  }).length;
  const todayPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const rank = getDailyRank(todayPct);

  const handleComplete = async (task: Task) => {
    if (completing) return;
    const status = getTaskStatus(task);
    if (status !== 'active') return;

    setCompleting(task.id);
    setErrMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const result = await completeTask(user.id, task.id, task.xp_reward, task.coin_reward, task.category_id);
      setShowSuccess({ xp: result.xpGained, coins: result.coinsGained });
      setTimeout(() => setShowSuccess(null), 2000);
      await Promise.all([refetchProfile(), refetchTasks(), refetchStreak(), refetchStats()]);
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Xatolik');
      setTimeout(() => setErrMsg(null), 3000);
    }
    setCompleting(null);
  };

  if (!profile) return null;

  return (
    <div className="space-y-4 pb-20">
      <StatusHeader profile={profile} streak={streak} todayCompletionPct={todayPct} />

      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d15] border border-cyan-500/50 rounded-lg px-6 py-3 shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-pulse">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-cyan-400">+{showSuccess.xp} XP</span>
            <span className="text-yellow-400">+{showSuccess.coins} 🪙</span>
          </div>
        </div>
      )}

      {errMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d15] border border-red-500/50 rounded-lg px-6 py-3 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
          <span className="text-red-400 text-sm">{errMsg}</span>
        </div>
      )}

      {/* Today's Progress */}
      <div className="border border-gray-800/50 rounded-xl bg-[#0d0d15]/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider">Bugungi topshiriqlar</h3>
          <span className={`text-lg font-bold ${rank.color}`}>{rank.rank} Rank</span>
        </div>
        <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${todayPct}%` }} />
        </div>
        <p className="text-gray-500 text-xs">{completedToday}/{totalToday} bajarildi ({todayPct}%)</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onNavigate('stats')} className="border border-gray-800/50 rounded-lg bg-[#0d0d15]/80 p-3 text-center hover:border-cyan-500/30 transition-colors">
          <TrendingUp size={18} className="text-cyan-400 mx-auto mb-1" /><p className="text-white text-sm font-bold">{stats.length}</p><p className="text-gray-500 text-[10px]">Statistika</p>
        </button>
        <button onClick={() => onNavigate('quests')} className="border border-gray-800/50 rounded-lg bg-[#0d0d15]/80 p-3 text-center hover:border-cyan-500/30 transition-colors">
          <Swords size={18} className="text-red-400 mx-auto mb-1" /><p className="text-white text-sm font-bold">{bosses.filter(b => !b.is_defeated).length}</p><p className="text-gray-500 text-[10px]">Boss janglari</p>
        </button>
        <button onClick={() => onNavigate('profile')} className="border border-gray-800/50 rounded-lg bg-[#0d0d15]/80 p-3 text-center hover:border-cyan-500/30 transition-colors">
          <Trophy size={18} className="text-yellow-400 mx-auto mb-1" /><p className="text-white text-sm font-bold">{achievements.filter(a => a.is_unlocked).length}</p><p className="text-gray-500 text-[10px]">Yutuqlar</p>
        </button>
      </div>

      {/* Today's Quests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Bugungi Topshiriqlar</h3>
          <button onClick={() => onNavigate('quests')} className="text-cyan-400 text-xs flex items-center gap-1 hover:text-cyan-300">Barchasi <ChevronRight size={14} /></button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="border border-gray-800/30 rounded-xl bg-[#0d0d15]/50 p-8 text-center">
            <p className="text-gray-600 text-sm">Hali topshiriq yo'q</p>
            <button onClick={() => onNavigate('quests')} className="mt-3 text-cyan-400 text-xs hover:text-cyan-300">Topshiriq qo'shish +</button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 8).map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} completing={completing} />
            ))}
          </div>
        )}
      </div>

      {/* Active Bosses */}
      {bosses.filter(b => !b.is_defeated).length > 0 && (
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Faol Boss Janglari</h3>
          <div className="space-y-2">
            {bosses.filter(b => !b.is_defeated).slice(0, 2).map(boss => {
              const hpPct = Math.round((boss.current_hp / boss.max_hp) * 100);
              return (
                <div key={boss.id} className="border border-red-900/30 rounded-lg bg-[#0d0d15]/80 p-3">
                  <div className="flex items-center justify-between mb-2"><span className="text-white text-sm font-medium">👹 {boss.name}</span><span className="text-red-400 text-xs">{boss.current_hp}/{boss.max_hp} HP</span></div>
                  <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all" style={{ width: `${hpPct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Task card with proper visual states based on date-based logic.
 * GREEN border/bg = completed today
 * BLUE border = active (can be completed)
 * GRAY = completed forever (one-time done)
 */
function TaskCard({ task, onComplete, completing }: { task: Task; onComplete: (t: Task) => void; completing: string | null }) {
  const status = getTaskStatus(task);
  const diff = DIFFICULTY_CONFIG[task.difficulty];
  const isCompleting = completing === task.id;

  const borderClass = status === 'completed_today'
    ? 'border-green-500/40 bg-green-500/5'
    : status === 'completed_forever'
    ? 'border-gray-700/30 bg-gray-900/30'
    : 'border-cyan-500/20 bg-[#0d0d15]/80 hover:border-cyan-500/40';

  const opacity = status === 'completed_forever' ? 'opacity-40' : status === 'completed_today' ? 'opacity-70' : '';

  return (
    <div className={`border rounded-lg p-3 flex items-center gap-3 transition-all ${borderClass} ${opacity}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-medium truncate ${status === 'completed_today' ? 'text-green-400 line-through' : status === 'completed_forever' ? 'text-gray-500 line-through' : 'text-white'}`}>{task.name}</span>
          <span className={`text-[10px] ${diff.color}`}>{diff.label}</span>
          {task.task_type === 'recurring' && <span className="text-[10px] text-cyan-400/50">🔄</span>}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-cyan-400/70">+{task.xp_reward} XP</span>
          <span className="text-yellow-400/70">+{task.coin_reward} 🪙</span>
          {task.category && <span style={{ color: task.category.color }}>{task.category.icon} {task.category.name}</span>}
        </div>
      </div>

      {status === 'completed_today' ? (
        <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
          <Check size={16} className="text-green-400" />
        </div>
      ) : status === 'completed_forever' ? (
        <div className="w-9 h-9 rounded-full bg-gray-700/20 border border-gray-700/40 flex items-center justify-center">
          <Check size={16} className="text-gray-500" />
        </div>
      ) : (
        <button
          onClick={() => onComplete(task)}
          disabled={!!completing}
          className="w-9 h-9 rounded-full border border-cyan-500/50 bg-cyan-500/10 flex items-center justify-center hover:bg-cyan-500/20 transition-all disabled:opacity-50"
        >
          {isCompleting ? <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Check size={16} className="text-cyan-400" />}
        </button>
      )}
    </div>
  );
}
