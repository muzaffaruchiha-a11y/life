import React, { useState } from 'react';
import {
  Plus,
  X,
  Swords,
  Link,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useBosses,
  useBossTasks,
  useTasks,
} from '../lib/hooks';
import {
  Boss,
} from '../lib/types';

const BossPage: React.FC = () => {
  const { bosses } = useBosses();
  const { bossTasks } = useBossTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [expandedBoss, setExpandedBoss] = useState<string | null>(null);

  const activeBosses = bosses.filter((b) => !b.is_defeated);
  const defeatedBosses = bosses.filter((b) => b.is_defeated);

  const handleLinkTask = (bossId: string) => {
    setSelectedBoss(bosses.find((b) => b.id === bossId) || null);
    setShowLinkModal(true);
  };

  const toggleExpanded = (bossId: string) => {
    setExpandedBoss(expandedBoss === bossId ? null : bossId);
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">Ҳукмронлар</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-cyan-900">
          <button
            className={`px-4 py-2 font-semibold transition text-cyan-400 border-b-2 border-cyan-400`}
          >
            Фаол ({activeBosses.length})
          </button>
          <button
            className={`px-4 py-2 font-semibold transition text-gray-400`}
          >
            Мағлуб ({defeatedBosses.length})
          </button>
        </div>

        {/* Add Boss Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-3 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 rounded-lg font-semibold flex items-center justify-center gap-2 transition border border-cyan-700 mb-6"
        >
          <Plus className="w-5 h-5" />
          Нави Ҳукмрон қўшиш
        </button>

        {/* Active Bosses */}
        {activeBosses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Ҳозирча ҳукмрон йўқ
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {activeBosses.map((boss) => (
              <BossCard
                key={boss.id}
                boss={boss}
                isExpanded={expandedBoss === boss.id}
                onToggleExpand={() => toggleExpanded(boss.id)}
                onLinkTask={() => handleLinkTask(boss.id)}
                bossTasks={bossTasks.filter((bt) => bt.boss_id === boss.id)}
              />
            ))}
          </div>
        )}

        {/* Defeated Bosses */}
        {defeatedBosses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-400 mt-8">Мағлуб Ҳукмронлар</h2>
            <div className="space-y-3">
              {defeatedBosses.map((boss) => (
                <div
                  key={boss.id}
                  className="bg-gray-950 border border-gray-700 rounded-lg p-4 opacity-60"
                >
                  <p className="font-semibold text-gray-500">{boss.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Мағлуб булди</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Boss Modal */}
      {showCreateModal && (
        <CreateBossModal
          onClose={() => setShowCreateModal(false)}
          onBossCreated={() => setShowCreateModal(false)}
        />
      )}

      {/* Link Task Modal */}
      {showLinkModal && selectedBoss && (
        <LinkTaskModal
          boss={selectedBoss}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedBoss(null);
          }}
        />
      )}
    </div>
  );
};

interface BossCardProps {
  boss: Boss;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onLinkTask: () => void;
  bossTasks: any[];
}

const BossCard: React.FC<BossCardProps> = ({
  boss,
  isExpanded,
  onToggleExpand,
  onLinkTask,
  bossTasks,
}) => {
  const healthPercent = Math.max(0, Math.min((boss.current_hp / boss.max_hp) * 100, 100));

  return (
    <div className="bg-gray-950 border border-cyan-800 rounded-lg overflow-hidden hover:border-cyan-600 transition">
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-900 transition"
      >
        <div className="flex items-center gap-3 flex-1">
          <Swords className="w-5 h-5 text-red-500" />
          <div className="text-left flex-1">
            <p className="font-semibold text-cyan-400">{boss.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 bg-gray-900 rounded-full flex-1 max-w-xs overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {boss.current_hp}/{boss.max_hp} ҲҚ
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-cyan-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-cyan-900 p-4 space-y-3">
          {bossTasks.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Боғланган вазифалар</p>
              <div className="space-y-1">
                {bossTasks.map((bt) => (
                  <div key={bt.id} className="text-xs text-gray-300 bg-gray-900 p-2 rounded">
                    {bt.task_name} (-{bt.damage} ҲҚ)
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onLinkTask}
              className="flex-1 py-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 rounded text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              <Link className="w-4 h-4" />
              Вазифа боғлаш
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CreateBossModalProps {
  onClose: () => void;
  onBossCreated: () => void;
}

const CreateBossModal: React.FC<CreateBossModalProps> = ({
  onClose,
  onBossCreated,
}) => {
  const [name, setName] = useState('');
  const [maxHp, setMaxHp] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return;

    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('bosses').insert({
        user_id: user.id,
        name,
        description: null,
        max_hp: maxHp,
        current_hp: maxHp,
        xp_reward: 100,
        coin_reward: 50,
        title_reward: null,
        is_defeated: false,
      });
      onBossCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-400">Нави Ҳукмрон</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Ҳукмрон номи"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-cyan-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />

        <div>
          <label className="block text-sm text-gray-400 mb-2">Макс ҲҚ: {maxHp}</label>
          <input
            type="range"
            min="50"
            max="1000"
            step="10"
            value={maxHp}
            onChange={(e) => setMaxHp(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

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

interface LinkTaskModalProps {
  boss: Boss;
  onClose: () => void;
}

const LinkTaskModal: React.FC<LinkTaskModalProps> = ({
  boss,
  onClose,
}) => {
  const { tasks } = useTasks();
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [damage, setDamage] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (!selectedTask) return;

    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('boss_tasks').insert({
        boss_id: boss.id,
        task_id: selectedTask,
        hp_damage: damage,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-400">Вазифа боғлаш</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Ҳукмрон</label>
          <input
            type="text"
            disabled
            value={boss.name}
            className="w-full px-4 py-2 bg-gray-900 border border-cyan-800 rounded text-gray-400 opacity-70"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Вазифа</label>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-cyan-800 rounded text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="">Вазифа танлаш</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Ҳукмронга зарар: {damage}</label>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={damage}
            onChange={(e) => setDamage(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded font-semibold transition"
          >
            Бекор
          </button>
          <button
            onClick={handleLink}
            disabled={!selectedTask || loading}
            className="flex-1 py-2 bg-cyan-900 hover:bg-cyan-800 disabled:opacity-50 text-cyan-300 rounded font-semibold transition"
          >
            {loading ? 'Боғланмоқда...' : 'Боғлаш'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BossPage;
