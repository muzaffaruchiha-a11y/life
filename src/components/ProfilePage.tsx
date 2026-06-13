import React, { useState } from 'react';
import {
  User,
  Flame,
  Zap,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  X,
  Shield,
  Coins,
} from 'lucide-react';
import {
  useProfile,
  useStats,
  useStreak,
} from '../lib/hooks';
import {
  signOut,
} from '../lib/auth';

const ProfilePage: React.FC = () => {
  const { profile } = useProfile();
  const { stats } = useStats();
  const { streak } = useStreak();
  const [activeTab, setActiveTab] = useState<'profil' | 'achievements' | 'inventory' | 'admin'>('profil');

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f] text-cyan-400">
        Загрузка...
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Чиқишда хато:', error);
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-cyan-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">{profile.name}</h1>
              <p className="text-gray-400 mt-1">Лвл {profile.level}</p>
            </div>
            <User className="w-12 h-12 text-cyan-400" />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-900 rounded-lg p-3 border border-cyan-900">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Zap className="w-4 h-4" />
                ХУ
              </div>
              <p className="text-xl font-bold text-cyan-400">{profile.xp}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-cyan-900">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Coins className="w-4 h-4" />
                Танга
              </div>
              <p className="text-xl font-bold text-yellow-400">{profile.coins}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-cyan-900">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Flame className="w-4 h-4" />
                Ўриллар
              </div>
              <p className="text-xl font-bold text-orange-400">{streak?.current_streak ?? 0}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Сўмма ХУ</span>
              <span className="text-cyan-400">{profile.xp} / {Math.round(profile.xp * 1.5)}</span>
            </div>
            <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-cyan-900">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min((profile.xp / (profile.xp * 1.5)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-cyan-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profil')}
            className={`px-4 py-2 font-semibold whitespace-nowrap transition ${
              activeTab === 'profil'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Профил
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 font-semibold whitespace-nowrap transition ${
              activeTab === 'achievements'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Юту
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 font-semibold whitespace-nowrap transition ${
              activeTab === 'inventory'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Инвентар
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            Бошқаруви
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profil' && (
          <ProfileTab profile={profile} stats={stats} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab />
        )}
        {activeTab === 'admin' && (
          <AdminTab
            profile={profile}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    </div>
  );
};

interface ProfileTabProps {
  profile: any;
  stats: any[];
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, stats }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Ном</span>
          <span className="font-semibold text-cyan-400">{profile.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Электрон почта</span>
          <span className="font-semibold text-cyan-400">Profile ID: {profile.id}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Кейинги янгилаш</span>
          <span className="font-semibold text-cyan-400">
            {new Date(profile.updated_at).toLocaleDateString('uz-UZ')}
          </span>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="bg-gray-950 border border-cyan-800 rounded-lg p-4">
          <h3 className="font-semibold text-cyan-400 mb-4">Статистика</h3>
          <div className="space-y-2">
            {stats.slice(0, 5).map((stat) => (
              <div key={stat.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{stat.category?.name}</span>
                <span className="font-semibold text-cyan-400">Лвл {stat.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AchievementsTab: React.FC = () => {
  return (
    <div className="bg-gray-950 border border-cyan-800 rounded-lg p-8 text-center text-gray-400">
      Ютуқлар мавжуд эмас
    </div>
  );
};

const InventoryTab: React.FC = () => {
  return (
    <div className="bg-gray-950 border border-cyan-800 rounded-lg p-8 text-center text-gray-400">
      Инвентар бўш
    </div>
  );
};

interface AdminTabProps {
  profile: any;
  onSignOut: () => void;
}

const AdminTab: React.FC<AdminTabProps> = ({
  profile,
  onSignOut,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const hashPin = (pin: string): string => {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  };

  const handleUnlockAdmin = () => {
    const hashedPin = hashPin(pinInput);
    if (profile.admin_pin === hashedPin) {
      setIsUnlocked(true);
      setShowPinModal(false);
      setPinInput('');
    } else {
      alert('ПИН нотўғри');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 text-center space-y-4">
        <Lock className="w-12 h-12 text-cyan-400 mx-auto" />
        <p className="text-gray-400">Бошқаруви қисмини қўл берилди</p>
        <button
          onClick={() => setShowPinModal(true)}
          className="w-full py-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 rounded font-semibold transition"
        >
          Қўл бериш
        </button>

        {showPinModal && (
          <PinModal
            title="ПИН киритиш"
            onSubmit={handleUnlockAdmin}
            onClose={() => {
              setShowPinModal(false);
              setPinInput('');
            }}
            pin={pinInput}
            setPin={setPinInput}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Admin Controls */}
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-cyan-900">
          <h3 className="font-semibold text-cyan-400 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Админ Бошқаруви
          </h3>
          <button
            onClick={() => setIsUnlocked(false)}
            className="text-xs text-gray-400 hover:text-cyan-400 transition"
          >
            Қўл беринг
          </button>
        </div>


        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="w-full py-3 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-5 h-5" />
          Чиқиш
        </button>
      </div>
    </div>
  );
};

interface PinModalProps {
  title: string;
  onSubmit: () => void;
  onClose: () => void;
  pin: string;
  setPin: (pin: string) => void;
}

const PinModal: React.FC<PinModalProps> = ({
  title,
  onSubmit,
  onClose,
  pin,
  setPin,
}) => {
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            placeholder="ПИН"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-cyan-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 pr-10"
          />
          <button
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
          >
            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded font-semibold transition"
          >
            Бекор
          </button>
          <button
            onClick={onSubmit}
            disabled={!pin}
            className="flex-1 py-2 bg-cyan-900 hover:bg-cyan-800 disabled:opacity-50 text-cyan-300 rounded font-semibold transition"
          >
            Жавоб
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
