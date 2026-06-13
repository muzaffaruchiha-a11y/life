import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTasks, useCategories, useProfile, useStreak, useStats } from '../lib/hooks';
import { completeTask } from '../lib/game';
import { DIFFICULTY_CONFIG, getTaskStatus, type Difficulty, type TaskType, type Frequency, type Task } from '../lib/types';
import { Check, Plus, X, Trash2, Swords } from 'lucide-react';

export default function QuestPage() {
  const { tasks, refetch: refetchTasks } = useTasks();
  const { categories } = useCategories();
  const { refetch: refetchProfile } = useProfile();
  const { refetch: refetchStreak } = useStreak();
  const { refetch: refetchStats } = useStats();

  const [showCreate, setShowCreate] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [completing, setCompleting] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showBossCreate, setShowBossCreate] = useState(false);

  // Show all active tasks + completed one_time tasks for reference
  const activeTasks = tasks.filter(t => t.is_active || getTaskStatus(t) === 'completed_forever');
  const filteredTasks = filterCat === 'all' ? activeTasks : activeTasks.filter(t => t.category_id === filterCat);

  const handleComplete = async (task: Task) => {
    if (completing) return;
    const status = getTaskStatus(task);
    if (status !== 'active') return;

    setCompleting(task.id);
    setErrMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await completeTask(user.id, task.id, task.xp_reward, task.coin_reward, task.category_id);
      await Promise.all([refetchTasks(), refetchProfile(), refetchStreak(), refetchStats()]);
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Xatolik');
      setTimeout(() => setErrMsg(null), 3000);
    }
    setCompleting(null);
  };

  const handleDelete = async (taskId: string) => {
    await supabase.from('tasks').update({ is_active: false }).eq('id', taskId);
    refetchTasks();
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold">Topshiriqlar</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowBossCreate(true)} className="w-9 h-9 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"><Swords size={16} className="text-red-400" /></button>
          <button onClick={() => setShowCreate(true)} className="w-9 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center hover:bg-cyan-500/20 transition-colors"><Plus size={16} className="text-cyan-400" /></button>
        </div>
      </div>

      {errMsg && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs">{errMsg}</div>}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setFilterCat('all')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap border transition-colors ${filterCat === 'all' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-800 text-gray-500 hover:text-gray-300'}`}>Barchasi</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap border transition-colors`} style={filterCat === c.id ? { color: c.color, borderColor: c.color + '80', backgroundColor: c.color + '15' } : {}}>{c.icon} {c.name}</button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">Topshiriqlar topilmadi</div>
        ) : (
          filteredTasks.map(task => {
            const status = getTaskStatus(task);
            const diff = DIFFICULTY_CONFIG[task.difficulty];
            const isCompleting = completing === task.id;

            const borderClass = status === 'completed_today'
              ? 'border-green-500/40 bg-green-500/5'
              : status === 'completed_forever'
              ? 'border-gray-700/30 bg-gray-900/30'
              : 'border-gray-800/50 bg-[#0d0d15]/80';

            const opacity = status === 'completed_forever' ? 'opacity-40' : status === 'completed_today' ? 'opacity-70' : '';

            return (
              <div key={task.id} className={`border rounded-lg p-3 transition-all ${borderClass} ${opacity}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${status === 'completed_today' ? 'text-green-400 line-through' : status === 'completed_forever' ? 'text-gray-500 line-through' : 'text-white'}`}>{task.name}</span>
                      <span className={`text-[10px] ${diff.color}`}>{diff.label}</span>
                      {task.task_type === 'recurring' && <span className="text-[10px] text-cyan-400/50">🔄 {task.frequency === 'daily' ? 'Kundalik' : task.frequency === 'weekly' ? 'Haftalik' : task.frequency}</span>}
                      {task.task_type === 'one_time' && <span className="text-[10px] text-gray-500">Bir marta</span>}
                    </div>
                    {task.description && <p className="text-gray-600 text-xs mb-1">{task.description}</p>}
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-cyan-400/70">+{task.xp_reward} XP</span>
                      <span className="text-yellow-400/70">+{task.coin_reward} 🪙</span>
                      {task.category && <span style={{ color: task.category.color }}>{task.category.icon}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {status === 'completed_today' ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center"><Check size={14} className="text-green-400" /></div>
                    ) : status === 'completed_forever' ? (
                      <div className="w-8 h-8 rounded-full bg-gray-700/20 border border-gray-700/40 flex items-center justify-center"><Check size={14} className="text-gray-500" /></div>
                    ) : (
                      <button onClick={() => handleComplete(task)} disabled={!!completing} className="w-8 h-8 rounded-full border border-cyan-500/50 bg-cyan-500/10 flex items-center justify-center hover:bg-cyan-500/20 transition-all disabled:opacity-50">
                        {isCompleting ? <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Check size={14} className="text-cyan-400" />}
                      </button>
                    )}
                    {task.is_active && (
                      <button onClick={() => handleDelete(task.id)} className="w-7 h-7 rounded flex items-center justify-center text-gray-700 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreate && <CreateTaskModal categories={categories} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refetchTasks(); }} />}
      {showBossCreate && <CreateBossModal onClose={() => setShowBossCreate(false)} onCreated={() => { setShowBossCreate(false); refetchTasks(); }} />}
    </div>
  );
}

function CreateTaskModal({ categories, onClose, onCreated }: { categories: import('../lib/types').Category[]; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [taskType, setTaskType] = useState<TaskType>('recurring');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [maxCompletions, setMaxCompletions] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nom kiritilishi shart'); return; }
    setLoading(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const diffConfig = DIFFICULTY_CONFIG[difficulty];
      await supabase.from('tasks').insert({
        user_id: user.id,
        category_id: categoryId,
        name: name.trim(),
        description: description.trim() || null,
        difficulty,
        task_type: taskType,
        target_value: 1,
        xp_reward: Math.floor(50 * diffConfig.xpMulti),
        coin_reward: Math.floor(20 * diffConfig.coinMulti),
        frequency,
        frequency_config: frequency === 'weekly' ? { days: [1, 3, 5] } : {},
        max_completions_per_day: maxCompletions,
        last_completed_date: null,
        completion_count_today: 0,
      });
      onCreated();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Xatolik'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md border border-cyan-900/30 rounded-t-xl sm:rounded-xl bg-[#0d0d15] p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-white font-bold">Yangi Topshiriq</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50" placeholder="Topshiriq nomi..." />
          <input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50" placeholder="Tavsif (ixtiyoriy)..." />
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm">{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Turi</label>
            <div className="grid grid-cols-2 gap-1">
              <button type="button" onClick={() => setTaskType('one_time')} className={`py-2 rounded-lg text-xs border transition-colors ${taskType === 'one_time' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-800 text-gray-500'}`}>Bir marta</button>
              <button type="button" onClick={() => setTaskType('recurring')} className={`py-2 rounded-lg text-xs border transition-colors ${taskType === 'recurring' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-800 text-gray-500'}`}>Takrorlanuvchi 🔄</button>
            </div>
          </div>

          {taskType === 'recurring' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Chastota</label>
              <div className="grid grid-cols-3 gap-1">
                {([['daily', 'Kundalik'], ['weekly', 'Haftalik'], ['monthly', 'Oylik']] as [Frequency, string][]).map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setFrequency(val)} className={`py-2 rounded-lg text-xs border transition-colors ${frequency === val ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-800 text-gray-500'}`}>{label}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Qiyinlik</label>
            <div className="grid grid-cols-5 gap-1">
              {(['easy', 'medium', 'hard', 'epic', 'legendary'] as Difficulty[]).map(d => (
                <button key={d} type="button" onClick={() => setDifficulty(d)} className={`py-2 rounded-lg text-xs border transition-colors ${difficulty === d ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-gray-800 text-gray-500'}`}>{DIFFICULTY_CONFIG[d].label}</button>
              ))}
            </div>
          </div>

          {taskType === 'recurring' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kunlik bajarish limiti</label>
              <input type="number" value={maxCompletions} onChange={e => setMaxCompletions(Math.max(1, Number(e.target.value)))} min={1} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm" />
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-semibold py-3 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50">{loading ? '...' : 'YARATISH'}</button>
        </form>
      </div>
    </div>
  );
}

function CreateBossModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxHp, setMaxHp] = useState(1000);
  const [xpReward, setXpReward] = useState(500);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('bosses').insert({ user_id: user.id, name: name.trim(), description: description.trim() || null, max_hp: maxHp, current_hp: maxHp, xp_reward: xpReward, coin_reward: 200 });
      onCreated();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md border border-red-900/30 rounded-t-xl sm:rounded-xl bg-[#0d0d15] p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-red-400 font-bold">👹 Yangi Boss</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm" placeholder="Boss nomi..." />
          <input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm" placeholder="Tavsif..." />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs text-gray-400 mb-1">HP</label><input type="number" value={maxHp} onChange={e => setMaxHp(Number(e.target.value))} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">XP mukofot</label><input type="number" value={xpReward} onChange={e => setXpReward(Number(e.target.value))} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm" /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-500/20 border border-red-500/50 text-red-400 font-semibold py-3 rounded-lg hover:bg-red-500/30 disabled:opacity-50">{loading ? '...' : 'BOSS YARATISH'}</button>
        </form>
      </div>
    </div>
  );
}
