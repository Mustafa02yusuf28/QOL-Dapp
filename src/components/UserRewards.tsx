import React from 'react';
import { useWallet } from './WalletProvider';
import { getUserBalance, getUserRewardHistory } from '../services/rewardService';

export function UserRewards() {
  const { wallet } = useWallet();
  
  if (!wallet) {
    return null;
  }
  
  const walletAddress = wallet?.publicKey?.toString() || '';
  const balance = getUserBalance(walletAddress);
  const history = getUserRewardHistory(walletAddress);
  
  return (
    <div className="glass-card p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">Your $QOL Rewards</h3>
        <span className="text-2xl">💰</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
          <div className="text-xs text-purple-300/70 mb-1">Available</div>
          <div className="text-lg font-bold text-green-400">
            {balance.qolTokens.toFixed(1)} $QOL
          </div>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
          <div className="text-xs text-purple-300/70 mb-1">Pending</div>
          <div className="text-lg font-bold text-yellow-400">
            {balance.pendingRewards.toFixed(1)} $QOL
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-gray-400">Total</div>
          <div className="font-bold text-purple-400">{balance.totalEarned.toFixed(1)}</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-gray-400">Audits</div>
          <div className="font-bold text-blue-400">{balance.auditCount}</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-gray-400">Verified</div>
          <div className="font-bold text-pink-400">{balance.verificationCount}</div>
        </div>
      </div>
      
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="text-xs font-semibold text-purple-300 mb-2">Recent Rewards</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {history.slice(-3).reverse().map((reward, index) => (
              <div key={index} className="flex justify-between text-xs bg-white/5 p-2 rounded">
                <span className={`${
                  reward.type === 'submission' ? 'text-blue-400' :
                  reward.type === 'verification' ? 'text-green-400' :
                  'text-purple-400'
                }`}>
                  {reward.type === 'submission' ? '📝' :
                   reward.type === 'verification' ? '✅' :
                   '⭐'} {reward.type.replace('_', ' ')}
                </span>
                <span className="font-bold text-white">
                  +{reward.amount} $QOL
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRewards;
