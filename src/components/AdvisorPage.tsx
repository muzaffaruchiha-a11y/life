import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useProfile,
  useStats,
  useTodayCompletions,
  useStreak,
  useBosses,
  useAchievements,
} from '../lib/hooks';

interface AdvisorMessage {
  type: 'info' | 'success' | 'warning' | 'action';
  text: string;
}

const AdvisorPage: React.FC = () => {
  const { profile } = useProfile();
  const { stats } = useStats();
  const { completions } = useTodayCompletions();
  const { streak } = useStreak();
  const { bosses } = useBosses();
  const { achievements } = useAchievements();
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const generateAdvice = () => {
    setLoading(true);
    const newMessages: AdvisorMessage[] = [];

    if (!profile || !streak) {
      setLoading(false);
      return;
    }

    // Check streaks
    if (streak.current_streak === 0) {
      newMessages.push({
        type: 'warning',
        text: 'Сизнинг ўриллари йўқ. Бугун вазифа тўлдиришни бошлаш вақти!',
      });
    } else if (streak.current_streak >= 7) {
      newMessages.push({
        type: 'success',
        text: `Отличная работа! Вы в серии ${streak.current_streak} дней подряд. Продолжайте!`,
      });
    }

    // Check today's progress
    const todayCount = completions.length;
    if (todayCount === 0) {
      newMessages.push({
        type: 'action',
        text: 'Давайте начнём день! Выберите вашу первую задачу из квеста.',
      });
    } else if (todayCount < 3) {
      newMessages.push({
        type: 'info',
        text: `Отлично! Вы выполнили ${todayCount} задач. Может быть, ещё одну?`,
      });
    } else {
      newMessages.push({
        type: 'success',
        text: `Вау! Вы выполнили ${todayCount} задач сегодня. Это отличный прогресс!`,
      });
    }

    // Check stats
    const strongestStat = stats.reduce((prev, current) =>
      prev.level > current.level ? prev : current
    );
    const weakestStat = stats.reduce((prev, current) =>
      prev.level < current.level ? prev : current
    );

    if (strongestStat && strongestStat.level > 20) {
      newMessages.push({
        type: 'success',
        text: `Ваша навык "${strongestStat.category?.name}" достиг уровня ${strongestStat.level}!`,
      });
    }

    if (weakestStat && weakestStat.level < 5) {
      newMessages.push({
        type: 'action',
        text: `"${weakestStat.category?.name}" отстаёт. Выполняйте больше задач в этой категории.`,
      });
    }

    // Check bosses
    const activeBosses = bosses.filter((b) => !b.is_defeated);
    const defeatedBosses = bosses.filter((b) => b.is_defeated);

    if (activeBosses.length > 0) {
      const bossWithLowestHp = activeBosses.reduce((prev, current) =>
        prev.current_hp < current.current_hp ? prev : current
      );
      newMessages.push({
        type: 'warning',
        text: `Ёмон "${bossWithLowestHp.name}" почти побеждена! Продолжайте атаковать!`,
      });
    }

    if (defeatedBosses.length > 0) {
      newMessages.push({
        type: 'success',
        text: `Вы уже победили ${defeatedBosses.length} боссов! Отличные боевые навыки!`,
      });
    }

    // Check level
    if (profile.level >= 10) {
      newMessages.push({
        type: 'success',
        text: `Поздравляем! Вы достигли уровня ${profile.level}!`,
      });
    }

    // Check coins
    if (profile.coins > 500) {
      newMessages.push({
        type: 'info',
        text: `У вас ${profile.coins} монет. Может быть, пришло время купить награду?`,
      });
    }

    setMessages(newMessages);
    setLoading(false);
  };

  useEffect(() => {
    generateAdvice();
  }, [profile, stats, completions, streak, bosses, achievements]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            Тизим Маслахатчиси
          </h1>
          <button
            onClick={() => generateAdvice()}
            disabled={loading}
            className="p-2 rounded-lg bg-cyan-900 hover:bg-cyan-800 text-cyan-300 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Юқоридан маълумот ютказишни ўйлаяпман...
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, idx) => (
              <MessageCard key={idx} message={message} />
            ))}
          </div>
        )}

        {/* Weekly Report */}
        <div className="mt-8 bg-gray-950 border border-cyan-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">Ҳафталик Отчёт</h2>
          <WeeklyReport
            profile={profile}
            completedToday={completions.length}
            streak={streak}
            bosses={bosses}
          />
        </div>
      </div>
    </div>
  );
};

interface MessageCardProps {
  message: AdvisorMessage;
}

const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  const borderColor: { [key: string]: string } = {
    info: 'border-cyan-700',
    success: 'border-green-700',
    warning: 'border-yellow-700',
    action: 'border-orange-700',
  };

  const bgColor: { [key: string]: string } = {
    info: 'bg-cyan-950',
    success: 'bg-green-950',
    warning: 'bg-yellow-950',
    action: 'bg-orange-950',
  };

  const textColor: { [key: string]: string } = {
    info: 'text-cyan-300',
    success: 'text-green-300',
    warning: 'text-yellow-300',
    action: 'text-orange-300',
  };

  return (
    <div
      className={`${bgColor[message.type]} border-l-4 ${borderColor[message.type]} rounded-lg p-4`}
    >
      <p className={`${textColor[message.type]} font-medium`}>{message.text}</p>
    </div>
  );
};

interface WeeklyReportProps {
  profile: any;
  completedToday: number;
  streak: any;
  bosses: any[];
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({
  profile,
  completedToday,
  streak,
  bosses,
}) => {
  if (!profile || !streak) {
    return <div className="text-gray-400">Маълумотни юқоридан олмоқда...</div>;
  }

  const activeBosses = bosses.filter((b) => !b.defeated);
  const defeatedBosses = bosses.filter((b) => b.defeated);

  return (
    <div className="space-y-4 text-gray-300">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded p-3 border border-cyan-900">
          <p className="text-xs text-gray-500">Фойдаланувчи</p>
          <p className="text-lg font-bold text-cyan-400">{profile.username}</p>
        </div>
        <div className="bg-gray-900 rounded p-3 border border-cyan-900">
          <p className="text-xs text-gray-500">Сатҳ</p>
          <p className="text-lg font-bold text-cyan-400">{profile.level}</p>
        </div>
        <div className="bg-gray-900 rounded p-3 border border-cyan-900">
          <p className="text-xs text-gray-500">Буғун Тўлдирилган</p>
          <p className="text-lg font-bold text-green-400">{completedToday}</p>
        </div>
        <div className="bg-gray-900 rounded p-3 border border-cyan-900">
          <p className="text-xs text-gray-500">Ўриллар</p>
          <p className="text-lg font-bold text-orange-400">{streak.count}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-cyan-900">
        <h3 className="font-semibold text-cyan-400 mb-2">Бослар</h3>
        <p className="text-sm text-gray-400">
          Фаол: {activeBosses.length} | Мағлуб: {defeatedBosses.length}
        </p>
      </div>

      <div className="pt-4 border-t border-cyan-900">
        <h3 className="font-semibold text-cyan-400 mb-2">Қўвват Нуқталари</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Мунтазам жўмуш ҳалокатинг йўқ</li>
          <li>• Вазифалар ўрталаб тўғри тўлдирилмоқда</li>
          <li>• Ҳукмрон системасидан фойдаланмоқда</li>
        </ul>
      </div>

      <div className="pt-4 border-t border-cyan-900">
        <h3 className="font-semibold text-cyan-400 mb-2">Сўзлар</h3>
        <p className="text-sm text-gray-400">
          Ўзингизи ва ўзингизни момиқаланг. Ҳар бир вазифани тўлдирган сайин юқори чиқасиз!
        </p>
      </div>
    </div>
  );
};

export default AdvisorPage;
