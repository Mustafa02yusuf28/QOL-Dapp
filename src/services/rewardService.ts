// Simulated Backend Service for Rewards System
// This will track user balances and rewards without a real blockchain

import { sendTokensToUser } from './tokenService';

export interface UserBalance {
  walletAddress: string;
  qolTokens: number;
  pendingRewards: number;
  totalEarned: number;
  auditCount: number;
  verificationCount: number;
}

export interface Reward {
  id: string;
  userId: string;
  auditId: string;
  amount: number;
  type: 'submission' | 'verification' | 'quality_bonus';
  status: 'pending' | 'confirmed';
  timestamp: string;
}

// Mock database (in-memory for now)
let userBalances: Map<string, UserBalance> = new Map();
let rewardsHistory: Reward[] = [];

// Initialize default balance for a user
export function initializeUserBalance(walletAddress: string): UserBalance {
  const balance: UserBalance = {
    walletAddress,
    qolTokens: 0,
    pendingRewards: 0,
    totalEarned: 0,
    auditCount: 0,
    verificationCount: 0,
  };
  userBalances.set(walletAddress, balance);
  return balance;
}

// Get user balance
export function getUserBalance(walletAddress: string): UserBalance {
  if (!userBalances.has(walletAddress)) {
    return initializeUserBalance(walletAddress);
  }
  return userBalances.get(walletAddress)!;
}

// Reward calculation functions
export function calculateSubmissionReward(): number {
  return 10; // Base submission reward
}

export function calculateVerificationReward(verificationNumber: number): number {
  const baseReward = 5;
  // First and third verifiers get bonus
  const multiplier = (verificationNumber === 1 || verificationNumber === 3) ? 1.5 : 1.0;
  return baseReward * multiplier;
}

export function calculateQualityBonus(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  
  const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower variance = higher agreement = higher bonus
  if (standardDeviation < 0.3) return 15; // High accuracy
  if (standardDeviation < 0.7) return 10; // Medium accuracy
  return 5; // Low accuracy
}

// Award submission reward
export async function awardSubmissionReward(walletAddress: string, auditId: string): Promise<Reward> {
  const rewardAmount = calculateSubmissionReward();
  
  const reward: Reward = {
    id: `REWARD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: walletAddress,
    auditId,
    amount: rewardAmount,
    type: 'submission',
    status: 'pending',
    timestamp: new Date().toISOString(),
  };
  
  rewardsHistory.push(reward);
  
  // Update user balance
  const userBalance = getUserBalance(walletAddress);
  userBalance.pendingRewards += reward.amount;
  userBalance.auditCount += 1;
  userBalances.set(walletAddress, userBalance);
  
  // Send real tokens (in production, replace with actual treasury address)
  try {
    await sendTokensToUser(walletAddress, rewardAmount, 'TREASURY_WALLET_ADDRESS');
    reward.status = 'confirmed';
    userBalance.qolTokens += reward.amount;
    userBalance.pendingRewards -= reward.amount;
  } catch (err) {
    console.error('Failed to send tokens:', err);
    // Keep reward as pending
  }
  
  return reward;
}

// Award verification reward
export async function awardVerificationReward(
  walletAddress: string, 
  auditId: string, 
  verificationNumber: number
): Promise<Reward> {
  const rewardAmount = calculateVerificationReward(verificationNumber);
  
  const reward: Reward = {
    id: `REWARD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: walletAddress,
    auditId,
    amount: rewardAmount,
    type: 'verification',
    status: 'confirmed', // Verifiers get instant reward
    timestamp: new Date().toISOString(),
  };
  
  rewardsHistory.push(reward);
  
  // Update user balance
  const userBalance = getUserBalance(walletAddress);
  userBalance.qolTokens += reward.amount;
  userBalance.totalEarned += reward.amount;
  userBalance.verificationCount += 1;
  userBalances.set(walletAddress, userBalance);
  
  // Send real tokens (in production, replace with actual treasury address)
  try {
    await sendTokensToUser(walletAddress, rewardAmount, 'TREASURY_WALLET_ADDRESS');
  } catch (err) {
    console.error('Failed to send tokens:', err);
  }
  
  return reward;
}

// Award quality bonus to reviewer
export function awardQualityBonus(
  walletAddress: string, 
  auditId: string, 
  ratings: number[]
): Reward {
  const bonus = calculateQualityBonus(ratings);
  
  const reward: Reward = {
    id: `REWARD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: walletAddress,
    auditId,
    amount: bonus,
    type: 'quality_bonus',
    status: 'confirmed', // Quality bonus is instant
    timestamp: new Date().toISOString(),
  };
  
  rewardsHistory.push(reward);
  
  // Update user balance
  const userBalance = getUserBalance(walletAddress);
  userBalance.qolTokens += reward.amount;
  userBalance.totalEarned += reward.amount;
  userBalances.set(walletAddress, userBalance);
  
  return reward;
}

// Confirm pending rewards
export function confirmPendingRewards(walletAddress: string) {
  const userBalance = getUserBalance(walletAddress);
  
  // Move pending to confirmed
  const pendingRewards = rewardsHistory.filter(r => 
    r.userId === walletAddress && r.status === 'pending'
  );
  
  pendingRewards.forEach(reward => {
    reward.status = 'confirmed';
    userBalance.qolTokens += reward.amount;
    userBalance.pendingRewards -= reward.amount;
  });
  
  userBalances.set(walletAddress, userBalance);
}

// Get user reward history
export function getUserRewardHistory(walletAddress: string): Reward[] {
  return rewardsHistory.filter(r => r.userId === walletAddress);
}

// Get all user balances (for leaderboard)
export function getAllUserBalances(): UserBalance[] {
  return Array.from(userBalances.values());
}

