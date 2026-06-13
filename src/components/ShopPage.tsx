import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Coins,
} from 'lucide-react';
import {
  useRewards,
  usePurchases,
  useProfile,
} from '../lib/hooks';
import {
  Reward,
} from '../lib/types';
import {
  purchaseReward,
} from '../lib/game';

const ShopPage: React.FC = () => {
  const { profile } = useProfile();
  const { rewards } = useRewards();
  const { purchases, refetch: refetchPurchases } = usePurchases();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);

  const handlePurchaseReward = async (reward: Reward) => {
    if (!profile) return;
    try {
      await purchaseReward(profile.id, reward.id, reward.coin_price);
      refetchPurchases();
    } catch (error) {
      console.error('Покуп қилишда хато:', error);
    }
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header with Coins */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">Дўкон</h1>
          <div className="flex items-center gap-2 bg-gray-950 border border-cyan-800 rounded-lg px-4 py-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-400">{profile?.coins ?? 0}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-cyan-900">
          <button
            onClick={() => setShowPurchaseHistory(false)}
            className={`px-4 py-2 font-semibold transition ${
              !showPurchaseHistory
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Мавжуд
          </button>
          <button
            onClick={() => setShowPurchaseHistory(true)}
            className={`px-4 py-2 font-semibold transition ${
              showPurchaseHistory
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Сотув Тарихи ({purchases.length})
          </button>
        </div>

        {!showPurchaseHistory ? (
          <div className="space-y-4">

            {/* Rewards Grid */}
            {rewards.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Хозирча ҳадя йўқ
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {rewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    onPurchase={() => handlePurchaseReward(reward)}
                    canAfford={(profile?.coins ?? 0) >= reward.coin_price}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Purchase History */
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Сотув тарихи бўш
              </div>
            ) : (
              purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-gray-950 border border-cyan-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-cyan-400">
                      {rewards.find((r) => r.id === purchase.reward_id)?.name ?? 'Номаълум'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(purchase.purchased_at).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-400 font-semibold">
                      -{purchase.coins_spent}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Reward Modal */}
      {showCreateModal && (
        <CreateRewardModal
          onClose={() => setShowCreateModal(false)}
          onRewardCreated={() => {
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

interface RewardCardProps {
  reward: Reward;
  onPurchase: () => void;
  canAfford: boolean;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onPurchase,
  canAfford,
}) => {
  return (
    <div className="bg-gray-950 border border-cyan-800 rounded-lg p-4 flex items-center justify-between hover:border-cyan-600 transition">
      <div className="flex-1">
        <h3 className="font-semibold text-cyan-400">{reward.name}</h3>
        {reward.description && (
          <p className="text-sm text-gray-400 mt-1">{reward.description}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-yellow-400 min-w-[50px] text-right">
            {reward.coin_price}
          </span>
        </div>
        <button
          onClick={onPurchase}
          disabled={!canAfford}
          className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${
            canAfford
              ? 'bg-cyan-900 hover:bg-cyan-800 text-cyan-300'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Сотиб олиш
        </button>
      </div>
    </div>
  );
};

interface CreateRewardModalProps {
  onClose: () => void;
  onRewardCreated: () => void;
}

const CreateRewardModal: React.FC<CreateRewardModalProps> = ({
  onClose,
  onRewardCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coinPrice, setCoinPrice] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return;

    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('rewards').insert({
        user_id: user.id,
        name,
        description: description || null,
        image_url: null,
        coin_price: coinPrice,
        stock: 10,
        is_active: true,
      });
      onRewardCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-cyan-800 rounded-lg p-6 max-w-sm w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-400">Нави ҳадя</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Ҳадя номи"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-cyan-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />

        <textarea
          placeholder="Сифатлари (ихтиёрий)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-cyan-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
          rows={3}
        />

        <div>
          <label className="block text-sm text-gray-400 mb-2">Нарҳи: {coinPrice} танга</label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={coinPrice}
            onChange={(e) => setCoinPrice(parseInt(e.target.value))}
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

export default ShopPage;
