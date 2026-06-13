import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type { Profile, Category, Stat, Task, TaskCompletion, Streak, Boss, Reward, Purchase, Achievement, Skill, InventoryItem, BossTask } from './types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { profile, setProfile, loading, refetch: fetch };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('categories').select('*').eq('user_id', user.id).order('sort_order');
    setCategories(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { categories, loading, refetch: fetch };
}

export function useStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('stats').select('*, category:categories(*)').eq('user_id', user.id);
    setStats(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, refetch: fetch };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('tasks').select('*, category:categories(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    // Include inactive one_time tasks too so we can show "completed_forever" status
    setTasks(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { tasks, loading, refetch: fetch };
}

export function useTodayCompletions() {
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('task_completions').select('*').eq('user_id', user.id).eq('completed_at', today);
    setCompletions(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { completions, loading, refetch: fetch };
}

export function useStreak() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    setStreak(data); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { streak, loading, refetch: fetch };
}

export function useBosses() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('bosses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setBosses(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { bosses, loading, refetch: fetch };
}

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('rewards').select('*').eq('user_id', user.id).eq('is_active', true).order('coin_price');
    setRewards(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { rewards, loading, refetch: fetch };
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('purchases').select('*, reward:rewards(*)').eq('user_id', user.id).order('purchased_at', { ascending: false });
    setPurchases(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { purchases, loading, refetch: fetch };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<(Achievement & { is_unlocked: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: achs } = await supabase.from('achievements').select('*').eq('user_id', user.id);
    const { data: unlocked } = await supabase.from('unlocked_achievements').select('achievement_id').eq('user_id', user.id);
    const unlockedIds = new Set((unlocked || []).map(u => u.achievement_id));
    setAchievements((achs || []).map(a => ({ ...a, is_unlocked: unlockedIds.has(a.id) }))); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { achievements, loading, refetch: fetch };
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('skills').select('*, category:categories(*)').eq('user_id', user.id);
    setSkills(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { skills, loading, refetch: fetch };
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('inventory').select('*').eq('user_id', user.id).order('acquired_at', { ascending: false });
    setItems(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { items, loading, refetch: fetch };
}

export function useBossTasks(bossId?: string) {
  const [bossTasks, setBossTasks] = useState<BossTask[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    if (!bossId) { setLoading(false); return; }
    const { data } = await supabase.from('boss_tasks').select('*, task:tasks(*)').eq('boss_id', bossId);
    setBossTasks(data || []); setLoading(false);
  }, [bossId]);
  useEffect(() => { fetch(); }, [fetch]);
  return { bossTasks, loading, refetch: fetch };
}
