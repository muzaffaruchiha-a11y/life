import { supabase } from './supabase';
import { DEFAULT_CATEGORIES } from './types';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) await initUserData(data.user.id, name);
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

async function initUserData(userId: string, name: string) {
  await supabase.from('profiles').upsert({ id: userId, name, title: "Boshlang'ich" });

  const { data: cats } = await supabase.from('categories')
    .upsert(DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: userId }))).select();

  if (cats) {
    await supabase.from('stats').upsert(cats.map(c => ({ user_id: userId, category_id: c.id, level: 1, xp: 0 })));
  }

  await supabase.from('streaks').upsert({ user_id: userId, current_streak: 0, best_streak: 0 });

  const defaultAchievements = [
    { name: 'Birinchi Qadam', description: 'Birinchi topshiriqni bajaring', icon: '🎯', condition_type: 'tasks_completed', condition_value: 1, xp_bonus: 50, coin_bonus: 20 },
    { name: 'Intizom', description: "30 kun ketma-ket topshiriqlar bajaring", icon: '🔥', condition_type: 'streak', condition_value: 30, xp_bonus: 500, coin_bonus: 200, title_reward: 'Intizomli' },
    { name: "Kuch Rejimi", description: "1000 XP to'plang", icon: '⚡', condition_type: 'total_xp', condition_value: 1000, xp_bonus: 100, coin_bonus: 50 },
    { name: 'Pul Ustasi', description: "5000 tanga to'plang", icon: '💎', condition_type: 'total_coins', condition_value: 5000, xp_bonus: 200, coin_bonus: 100 },
    { name: 'Epic Jangchi', description: '10 ta qiyin topshiriq bajaring', icon: '⚔️', condition_type: 'hard_tasks', condition_value: 10, xp_bonus: 300, coin_bonus: 150 },
  ];

  await supabase.from('achievements').upsert(defaultAchievements.map(a => ({ ...a, user_id: userId })));
}
