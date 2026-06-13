import type { Profile, Streak } from '../lib/types';
import { xpForLevel, getDailyRank } from '../lib/types';
import { Flame, Coins, Zap, Crown } from 'lucide-react';

export default function StatusHeader({ profile, streak, todayCompletionPct }: { profile: Profile; streak: Streak | null; todayCompletionPct: number }) {
  const xpNeeded = xpForLevel(profile.level);
  const xpPct = Math.min(100, Math.floor((profile.xp / xpNeeded) * 100));
  const rank = getDailyRank(todayCompletionPct);

  return (
    <div className="border border-cyan-900/30 rounded-xl bg-[#0d0d15]/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/50 bg-cyan-500/10 flex items-center justify-center"><Crown size={18} className="text-cyan-400" /></div>
          <div><h2 className="text-white font-bold text-sm">{profile.name}</h2><p className="text-cyan-400/70 text-xs">Lv.{profile.level} — {profile.title}</p></div>
        </div>
        <div className={`px-2.5 py-1 rounded-md border text-sm font-bold ${rank.color}`}>{rank.rank}</div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1"><span className="text-cyan-400/70">XP</span><span className="text-gray-500">{profile.xp}/{xpNeeded}</span></div>
        <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${xpPct}%` }} /></div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1 text-yellow-400"><Coins size={14} /><span>{profile.coins}</span></div>
        <div className="flex items-center gap-1 text-orange-400"><Flame size={14} /><span>{streak?.current_streak || 0} kun</span></div>
        <div className="flex items-center gap-1 text-cyan-400"><Zap size={14} /><span>{todayCompletionPct}%</span></div>
      </div>
    </div>
  );
}
