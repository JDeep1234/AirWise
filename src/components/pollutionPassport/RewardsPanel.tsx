import React, { useState } from 'react';
import { 
  Gift, 
  Shield, 
  CreditCard, 
  QrCode, 
  Download, 
  Check, 
  Clock, 
  ExternalLink,
  Star,
  Trophy
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  provider: string;
  type: 'insurance' | 'loan' | 'transport' | 'utility' | 'retail';
  value: string;
  minScore: number;
  description: string;
  claimed: boolean;
  claimable: boolean;
  expiryDate?: string;
}

interface RewardsPanelProps {
  userScore: number;
  onClaimReward: (rewardId: string) => Promise<void>;
  className?: string;
}

const RewardsPanel: React.FC<RewardsPanelProps> = ({
  userScore,
  onClaimReward,
  className = ''
}) => {
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  // Mock rewards data - in real app, this would come from API
  const rewards: Reward[] = [
    {
      id: '1',
      title: '10% Insurance Discount',
      provider: 'HDFC ERGO',
      type: 'insurance',
      value: '₹12,000 annual savings',
      minScore: 75,
      description: 'Get 10% discount on health and motor insurance premiums',
      claimed: false,
      claimable: userScore >= 75,
      expiryDate: '2024-12-31'
    },
    {
      id: '2',
      title: 'Green Loan Interest Rate',
      provider: 'SBI Bank',
      type: 'loan',
      value: '0.5% rate reduction',
      minScore: 70,
      description: 'Reduced interest rate on home and vehicle loans',
      claimed: false,
      claimable: userScore >= 70,
      expiryDate: '2024-12-31'
    },
    {
      id: '3',
      title: 'Metro Card Reward',
      provider: 'DMRC',
      type: 'transport',
      value: '₹500 metro credits',
      minScore: 60,
      description: 'Free metro credits for sustainable commuting',
      claimed: true,
      claimable: true,
      expiryDate: '2024-06-30'
    },
    {
      id: '4',
      title: 'Electricity Bill Discount',
      provider: 'DHBVN',
      type: 'utility',
      value: '5% monthly discount',
      minScore: 80,
      description: 'Discount on monthly electricity bills',
      claimed: false,
      claimable: userScore >= 80,
      expiryDate: '2024-12-31'
    },
    {
      id: '5',
      title: 'Grocery Vouchers',
      provider: 'BigBasket',
      type: 'retail',
      value: '₹1,000 vouchers',
      minScore: 65,
      description: 'Monthly grocery vouchers for eco-friendly products',
      claimed: false,
      claimable: userScore >= 65,
      expiryDate: '2024-09-30'
    }
  ];

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'insurance':
        return Shield;
      case 'loan':
        return CreditCard;
      case 'transport':
        return Gift;
      case 'utility':
        return Star;
      case 'retail':
        return Trophy;
      default:
        return Gift;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'text-blue-600 bg-blue-50';
      case 'loan':
        return 'text-green-600 bg-green-50';
      case 'transport':
        return 'text-purple-600 bg-purple-50';
      case 'utility':
        return 'text-yellow-600 bg-yellow-50';
      case 'retail':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);
    try {
      await onClaimReward(rewardId);
      // Update local state to reflect claimed status
      // In real app, this would trigger a re-fetch of rewards
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaimingReward(null);
    }
  };

  const claimableRewards = rewards.filter(reward => reward.claimable && !reward.claimed);
  const claimedRewards = rewards.filter(reward => reward.claimed);
  const lockedRewards = rewards.filter(reward => !reward.claimable);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Gift className="h-6 w-6 mr-2 text-blue-600" />
            Rewards & Benefits
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Your Score:
            </span>
            <span className="text-lg font-bold text-blue-600">
              {userScore}
            </span>
          </div>
        </div>

        {/* Available Rewards */}
        {claimableRewards.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-green-600" />
              Available to Claim ({claimableRewards.length})
            </h4>
            <div className="space-y-3">
              {claimableRewards.map((reward) => {
                const RewardIcon = getRewardIcon(reward.type);
                const typeColor = getTypeColor(reward.type);
                
                return (
                  <div key={reward.id} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-green-200 dark:border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${typeColor} dark:bg-gray-600`}>
                          <RewardIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {reward.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {reward.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {reward.value}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              by {reward.provider}
                            </span>
                            {reward.expiryDate && (
                              <span className="text-orange-600 dark:text-orange-400">
                                Expires: {reward.expiryDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleClaimReward(reward.id)}
                          disabled={claimingReward === reward.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                          {claimingReward === reward.id ? (
                            <>
                              <Clock className="h-4 w-4 animate-spin" />
                              <span>Claiming...</span>
                            </>
                          ) : (
                            <>
                              <Gift className="h-4 w-4" />
                              <span>Claim</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowQRCode(reward.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                          <QrCode className="h-4 w-4" />
                          <span>QR Code</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Claimed Rewards */}
        {claimedRewards.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              Claimed Rewards ({claimedRewards.length})
            </h4>
            <div className="space-y-3">
              {claimedRewards.map((reward) => {
                const RewardIcon = getRewardIcon(reward.type);
                
                return (
                  <div key={reward.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                          <RewardIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {reward.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {reward.value} • {reward.provider}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                          Claimed
                        </span>
                        <button
                          onClick={() => setShowQRCode(reward.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked Rewards */}
        {lockedRewards.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              Coming Soon ({lockedRewards.length})
            </h4>
            <div className="space-y-3">
              {lockedRewards.map((reward) => {
                const RewardIcon = getRewardIcon(reward.type);
                const scoreNeeded = reward.minScore - userScore;
                
                return (
                  <div key={reward.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600">
                          <RewardIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {reward.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {reward.value} • {reward.provider}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm font-medium rounded-full">
                          Score {reward.minScore} needed
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {scoreNeeded} points to go
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reward QR Code
                </h3>
                
                {/* Mock QR Code - in real app, generate actual QR code */}
                <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="h-32 w-32 text-gray-400" />
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Show this QR code to the provider to claim your reward
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowQRCode(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPanel; 