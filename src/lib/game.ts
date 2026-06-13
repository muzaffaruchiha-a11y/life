import { supabase } from './supabase';
import { xpForLevel, getTitleForLevel, getTodayStr, getTaskStatus } from './types';

/**
 * Complete a task with proper daily-reset and anti-duplicate logic.
 */
export async function completeTask(
  userId: string,
  taskId: string,
  xpReward: number,
  coinReward: number,
  categoryId: string
) {
  const today = getTodayStr();

  // Fetch the task to validate completion eligibility
  const { data: task, error: taskErr } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskErr || !task) throw new Error('Topshiriq topilmadi');

  const status = getTaskStatus(task);

  // Block if not eligible
  if (status === 'completed_forever') {
    throw new Error('Bu topshiriq allaqachon bajarilgan');
  }
  if (status === 'completed_today') {
    throw new Error('Bu topshiriq bugun allaqachon bajarilgan');
  }

  // Add completion record
  const { error: ce } = await supabase.from('task_completions').insert({
    user_id: userId,
    task_id: taskId,
    value: 1,
    xp_gained: xpReward,
    coins_gained: coinReward,
    completed_at: today,
  });
  if (ce) throw ce;

  // Update task's last_completed_date and completion_count_today
  const isNewDay = task.last_completed_date !== today;
  const newCount = isNewDay ? 1 : task.completion_count_today + 1;

  await supabase
    .from('tasks')
    .update({
      last_completed_date: today,
      completion_count_today: newCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  // For one-time tasks, also mark is_active = false after completion
  if (task.task_type === 'one_time') {
    await supabase.from('tasks').update({ is_active: false }).eq('id', taskId);
  }

  // Update profile XP, coins, and level
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!profile) throw new Error('Profil topilmadi');

  let newXp = profile.xp + xpReward;
  let newLevel = profile.level;
  let xpNeeded = xpForLevel(newLevel);
  while (newXp >= xpNeeded) {
    newXp -= xpNeeded;
    newLevel++;
    xpNeeded = xpForLevel(newLevel);
  }

  const newTitle = getTitleForLevel(newLevel);
  const newCoins = profile.coins + coinReward;

  await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel, coins: newCoins, title: newTitle, updated_at: new Date().toISOString() })
    .eq('id', userId);

  // Update stat XP
  const { data: stat } = await supabase.from('stats').select('*').eq('user_id', userId).eq('category_id', categoryId).single();
  if (stat) {
    let statXp = stat.xp + xpReward;
    let statLevel = stat.level;
    let statXpNeeded = xpForLevel(statLevel);
    while (statXp >= statXpNeeded) {
      statXp -= statXpNeeded;
      statLevel++;
      statXpNeeded = xpForLevel(statLevel);
    }
    await supabase.from('stats').update({ xp: statXp, level: statLevel, updated_at: new Date().toISOString() }).eq('id', stat.id);
  }

  // Update streak
  const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', userId).single();
  if (streak) {
    const lastDate = streak.last_active_date;
    let newCurrent = streak.current_streak;
    let newBest = streak.best_streak;
    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastDate === yesterday) newCurrent++;
      else newCurrent = 1;
      if (newCurrent > newBest) newBest = newCurrent;
    }
    await supabase
      .from('streaks')
      .update({ current_streak: newCurrent, best_streak: newBest, last_active_date: today, updated_at: new Date().toISOString() })
      .eq('id', streak.id);
  }

  // Check boss damage
  const { data: bossLinks } = await supabase.from('boss_tasks').select('boss_id, hp_damage').eq('task_id', taskId);
  if (bossLinks) {
    for (const bl of bossLinks) {
      const { data: boss } = await supabase.from('bosses').select('*').eq('id', bl.boss_id).single();
      if (boss && !boss.is_defeated) {
        const newHp = Math.max(0, boss.current_hp - bl.hp_damage);
        const defeated = newHp === 0;
        await supabase.from('bosses').update({ current_hp: newHp, is_defeated: defeated, updated_at: new Date().toISOString() }).eq('id', boss.id);
        if (defeated) {
          const { data: freshProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (freshProfile) {
            await supabase.from('profiles').update({
              xp: freshProfile.xp + boss.xp_reward,
              coins: freshProfile.coins + boss.coin_reward,
              title: boss.title_reward || freshProfile.title,
            }).eq('id', userId);
          }
          if (boss.title_reward) {
            await supabase.from('inventory').insert({ user_id: userId, item_type: 'title', item_name: boss.title_reward, item_icon: '👑' });
          }
          await supabase.from('inventory').insert({ user_id: userId, item_type: 'badge', item_name: `Boss: ${boss.name}`, item_icon: '🗡️' });
        }
      }
    }
  }

  return { xpGained: xpReward, coinsGained: coinReward, newLevel, newTitle };
}

export async function purchaseReward(userId: string, rewardId: string, coinPrice: number) {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!profile) throw new Error('Profil topilmadi');
  if (profile.coins < coinPrice) throw new Error('Tangalar yetarli emas!');

  await supabase.from('profiles').update({ coins: profile.coins - coinPrice, updated_at: new Date().toISOString() }).eq('id', userId);

  const { data: reward } = await supabase.from('rewards').select('*').eq('id', rewardId).single();
  if (reward && reward.stock > 0) {
    await supabase.from('rewards').update({ stock: reward.stock - 1 }).eq('id', rewardId);
  }

  await supabase.from('purchases').insert({ user_id: userId, reward_id: rewardId, coins_spent: coinPrice });
  await supabase.from('inventory').insert({ user_id: userId, item_type: 'reward', item_id: rewardId, item_name: reward?.name || 'Mukofot', item_icon: '🎁' });
}

export async function applyPenalties(userId: string) {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const { data: activeTasks } = await supabase.from('tasks')
    .select('*').eq('user_id', userId).eq('is_active', true).eq('task_type', 'recurring');
  if (!activeTasks?.length) return;

  const { data: yesterdayCompletions } = await supabase.from('task_completions')
    .select('task_id').eq('user_id', userId).eq('completed_at', yesterday);
  const completedIds = new Set((yesterdayCompletions || []).map(c => c.task_id));
  const missedTasks = activeTasks.filter(t => !completedIds.has(t.id));
  if (missedTasks.length === 0) return;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!profile || !profile.penalty_enabled) return;

  const xpPenalty = missedTasks.reduce((sum, t) => sum + Math.floor(t.xp_reward * 0.2), 0);
  const coinPenalty = missedTasks.reduce((sum, t) => sum + Math.floor(t.coin_reward * 0.2), 0);

  await supabase.from('profiles').update({ xp: Math.max(0, profile.xp - xpPenalty), coins: Math.max(0, profile.coins - coinPenalty) }).eq('id', userId);
  const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', userId).single();
  if (streak) {
    await supabase.from('streaks').update({ current_streak: 0 }).eq('id', streak.id);
  }
}
