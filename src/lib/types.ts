export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  coins: number;
  title: string;
  penalty_enabled: boolean;
  admin_pin: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Stat {
  id: string;
  user_id: string;
  category_id: string;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
export type TaskType = 'one_time' | 'recurring';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export type TaskStatus = 'active' | 'completed_today' | 'completed_forever';

export interface Task {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string | null;
  difficulty: Difficulty;
  task_type: TaskType;
  target_value: number;
  xp_reward: number;
  coin_reward: number;
  frequency: Frequency;
  frequency_config: Record<string, unknown>;
  max_completions_per_day: number;
  last_completed_date: string | null;
  completion_count_today: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  value: number;
  xp_gained: number;
  coins_gained: number;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  coin_price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  reward_id: string;
  coins_spent: number;
  purchased_at: string;
  reward?: Reward;
}

export interface Achievement {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  xp_bonus: number;
  coin_bonus: number;
  title_reward: string | null;
  created_at: string;
  is_unlocked?: boolean;
}

export interface Boss {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  max_hp: number;
  current_hp: number;
  xp_reward: number;
  coin_reward: number;
  title_reward: string | null;
  is_defeated: boolean;
  created_at: string;
  updated_at: string;
}

export interface BossTask {
  id: string;
  boss_id: string;
  task_id: string;
  hp_damage: number;
  task?: Task;
}

export interface Skill {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description: string;
  icon: string;
  required_level: number;
  required_xp: number;
  is_unlocked: boolean;
  parent_skill_id: string | null;
  created_at: string;
  category?: Category;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  best_streak: number;
  last_active_date: string | null;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_type: 'badge' | 'title' | 'reward' | 'skill';
  item_id: string | null;
  item_name: string;
  item_icon: string;
  acquired_at: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; xpMulti: number; coinMulti: number }> = {
  easy: { label: 'Oson', color: 'text-green-400', xpMulti: 1, coinMulti: 1 },
  medium: { label: "O'rtacha", color: 'text-blue-400', xpMulti: 1.5, coinMulti: 1.5 },
  hard: { label: 'Qiyin', color: 'text-purple-400', xpMulti: 2.5, coinMulti: 2.5 },
  epic: { label: 'Epic', color: 'text-orange-400', xpMulti: 4, coinMulti: 4 },
  legendary: { label: 'Afsonaviy', color: 'text-yellow-400', xpMulti: 7, coinMulti: 7 },
};

export const LEVEL_TITLES: Record<number, string> = {
  1: "Boshlang'ich",
  5: 'Talabgor',
  10: 'Intizomli',
  20: 'Jangchi',
  25: 'Elita',
  35: 'Veteran',
  50: 'Usta',
  75: 'Arbob',
  100: 'Afsona',
};

export const RANK_THRESHOLDS = [
  { min: 90, rank: 'S', color: 'text-yellow-400 border-yellow-400' },
  { min: 80, rank: 'A', color: 'text-green-400 border-green-400' },
  { min: 60, rank: 'B', color: 'text-blue-400 border-blue-400' },
  { min: 40, rank: 'C', color: 'text-orange-400 border-orange-400' },
  { min: 0, rank: 'D', color: 'text-red-400 border-red-400' },
];

export function getTitleForLevel(level: number): string {
  let title = LEVEL_TITLES[1];
  for (const [l, t] of Object.entries(LEVEL_TITLES)) {
    if (level >= Number(l)) title = t;
  }
  return title;
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getDailyRank(pct: number): typeof RANK_THRESHOLDS[number] {
  return RANK_THRESHOLDS.find(r => pct >= r.min) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Determine the display status of a task based on date-based logic.
 * This is the core of the recurring task fix.
 */
export function getTaskStatus(task: Task): TaskStatus {
  const today = getTodayStr();

  if (task.task_type === 'one_time') {
    // One-time tasks: if ever completed, done forever
    if (task.last_completed_date !== null) {
      return 'completed_forever';
    }
    return 'active';
  }

  // Recurring tasks: check today's date
  if (task.last_completed_date === today) {
    // Completed today — check if more completions allowed
    if (task.completion_count_today >= task.max_completions_per_day) {
      return 'completed_today';
    }
    // Still has completions left today (multi-completion tasks)
    return 'active';
  }

  // Not completed today — always active for recurring
  return 'active';
}

/**
 * Check if a task should be shown in today's quest list.
 */
export function shouldShowTaskToday(task: Task): boolean {
  const status = getTaskStatus(task);

  if (status === 'completed_forever') return false;

  // Recurring tasks always show (they reset daily)
  if (task.task_type === 'recurring') return true;

  // One-time active tasks show
  return status === 'active';
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Zakovat', slug: 'intelligence', icon: '🧠', color: '#3b82f6', sort_order: 0 },
  { name: 'Kuch', slug: 'strength', icon: '💪', color: '#ef4444', sort_order: 1 },
  { name: 'Moliya', slug: 'finance', icon: '💰', color: '#f59e0b', sort_order: 2 },
  { name: 'Karyera', slug: 'career', icon: '🚀', color: '#8b5cf6', sort_order: 3 },
  { name: 'Ong', slug: 'mind', icon: '🧘', color: '#10b981', sort_order: 4 },
  { name: 'Ijtimoiy', slug: 'social', icon: '🤝', color: '#ec4899', sort_order: 5 },
];
