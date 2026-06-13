import { useState } from 'react';
import { signUp, signIn } from '../lib/auth';
import { DEFAULT_CATEGORIES } from '../lib/types';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) { await signIn(email, password); }
      else { if (!name.trim()) { setError('Ism kiritilishi shart'); setLoading(false); return; } await signUp(email, password, name.trim()); }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Xatolik yuz berdi'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border border-cyan-900/50 rounded-lg bg-[#0d0d15]/90 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(0,255,255,0.05)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4"><span className="text-3xl">⚔️</span></div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">LIFE LEVELING</h1>
            <p className="text-gray-500 text-sm mt-1">Shaxsiy rivojlanish tizimi</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <div><label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Ism</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" placeholder="Jangchi ismi..." /></div>}
            <div><label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" placeholder="email@example.com" required /></div>
            <div><label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Parol</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#111118] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" placeholder="••••••••" required minLength={6} /></div>
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-semibold py-3 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50 tracking-wider">{loading ? '...' : isLogin ? 'KIRISH' : "RO'YXATDAN O'TISH"}</button>
          </form>
          <div className="mt-6 text-center"><button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-gray-500 text-sm hover:text-gray-300">{isLogin ? "Hisob yo'q? Ro'yxatdan o'ting" : 'Hisobingiz bormi? Kirish'}</button></div>
        </div>
        <p className="text-center text-gray-700 text-xs mt-4">{DEFAULT_CATEGORIES.length} ta asosiy yo'nalish | Cheksiz rivojlanish</p>
      </div>
    </div>
  );
}
