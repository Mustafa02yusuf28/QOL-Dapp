import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './WalletProvider';
import { awardVerificationReward, awardQualityBonus } from '../services/rewardService';

// Mock verification queue data for Mohali, India
const MOCK_UNVERIFIED_AUDITS = [
  {
    auditId: 'AUDIT-MOHALI-001',
    locationId: 'Mohali-India',
    latitude: 30.7046,
    longitude: 76.7179,
    rating: 3,
    reviewerKey: 'G2T9S4vL9Y...',
    verificationCount: 1,
    isVerified: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    mockImageUrl: 'https://placehold.co/400x300/e0e0e0/505050?text=Mohali+Road+Audit+140307',
    reviewerId: 'user-123',
    verifiers: ['verifier-1']
  },
  {
    auditId: 'AUDIT-MOHALI-002',
    locationId: 'Mohali-India',
    latitude: 30.7101,
    longitude: 76.7205,
    rating: 4,
    reviewerKey: 'H3U8T5vM0Z...',
    verificationCount: 0,
    isVerified: false,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    mockImageUrl: 'https://placehold.co/400x300/e0e0e0/505050?text=Mohali+Infrastructure+Audit',
    reviewerId: 'user-456',
    verifiers: []
  }
];

// Mock API functions
async function fetchUnverifiedAudits() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return MOCK_UNVERIFIED_AUDITS;
}

async function verifyAudit(auditId: string, verifierPublicKey: string) {
  // Server-side validation would check:
  // 1. verifierPublicKey is not the same as reviewerKey
  // 2. verifierPublicKey hasn't verified this audit before
  // 3. Audit exists and is not already fully verified
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  const mockTxSignature = `7Gv8...${Math.random().toString(36).substring(2, 8)}`;
  return { auditId, txSignature: mockTxSignature, verifierKey: verifierPublicKey };
}

function VerificationQueue() {
  const { wallet, isConnected } = useWallet();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [commentsByAudit, setCommentsByAudit] = useState<Record<string, string>>({});
  const [distanceByAudit, setDistanceByAudit] = useState<Record<string, number>>({});

  // Haversine distance in meters
  function computeDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setMessage('❌ Geolocation not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setMessage('📍 Location captured.');
        // Precompute distances for visible audits
        if (audits && Array.isArray(audits)) {
          const map: Record<string, number> = {};
          audits.forEach((a: any) => {
            if (typeof a.latitude === 'number' && typeof a.longitude === 'number') {
              map[a.auditId] = computeDistanceMeters(coords.lat, coords.lng, a.latitude, a.longitude);
            }
          });
          setDistanceByAudit(map);
        }
      },
      (err) => {
        setMessage(`❌ Failed to get location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fetch unverified audits
  const { data: audits, isLoading, error } = useQuery({
    queryKey: ['unverified-audits'],
    queryFn: fetchUnverifiedAudits,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter out audits by current user (prevent self-verification)
  // Also filter out audits the user has already verified
  const currentUserKey = wallet?.publicKey?.toString();
  const filteredAudits = audits?.filter(audit => {
    // Don't show audits created by current user
    if (audit.reviewerKey === currentUserKey) {
      return false;
    }
    
    // Don't show audits user has already verified
    if (audit.verifiers && audit.verifiers.includes(currentUserKey || '')) {
      return false;
    }
    
    // Don't show fully verified audits
    if (audit.isVerified) {
      return false;
    }
    
    return true;
  }) || [];

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: ({ auditId, verifierPublicKey }: { auditId: string; verifierPublicKey: string }) => 
      verifyAudit(auditId, verifierPublicKey),
    onSuccess: async (data) => {
      const walletAddress = wallet?.publicKey?.toString() || 'mock-key';
      
      // Find the audit being verified
      const currentAudit = audits?.find(a => a.auditId === data.auditId);
      const newVerificationCount = (currentAudit?.verificationCount || 0) + 1;
      
      // Award verification reward
      const verifierReward = await awardVerificationReward(walletAddress, data.auditId, newVerificationCount);
      
      // If this is the 3rd verification, award quality bonus to reviewer
      let reviewerReward = null;
      if (newVerificationCount >= 3 && currentAudit) {
        // Award quality bonus to the reviewer
        const reviewerKey = currentAudit.reviewerKey || currentAudit.reviewerId;
        const ratings = [currentAudit.rating]; // In real app, collect all ratings
        reviewerReward = awardQualityBonus(reviewerKey, data.auditId, ratings);
        
        setMessage(`🎉 Audit fully verified! You earned +${verifierReward.amount} $QOL. Reviewer bonus: +${reviewerReward.amount} $QOL.`);
      } else {
        setMessage(`✅ Audit verified! You earned +${verifierReward.amount} $QOL. Tx: ${data.txSignature.substring(0, 10)}. Needs ${3 - newVerificationCount} more.`);
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['unverified-audits'], (oldData: any[]) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        
        return oldData.map((audit: any) => {
          if (audit.auditId === data.auditId) {
            const newVerifiers = [...(audit.verifiers || []), walletAddress];
            
            return {
              ...audit,
              verificationCount: newVerificationCount,
              isVerified: newVerificationCount >= 3,
              verifiers: newVerifiers
            };
          }
          return audit;
        });
      });

      // Refetch after a short delay to get updated data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['unverified-audits'] });
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      }, 2000);
    },
    onError: (error) => {
      setMessage(`❌ Verification failed: ${error.message}`);
    },
  });

  const handleVerify = (audit: any) => {
    if (!isConnected) {
      setMessage('Please connect your Solana wallet first.');
      return;
    }

    const userPublicKey = wallet?.publicKey?.toString();
    
    // SECURITY CHECK 1: Prevent self-verification
    if (audit.reviewerKey === userPublicKey) {
      setMessage('❌ Security Error: You cannot verify your own audit. This prevents exploitation.');
      return;
    }

    // SECURITY CHECK 2: Check if user already verified this audit
    if (audit.verifiers?.includes(userPublicKey)) {
      setMessage('You have already verified this audit.');
      return;
    }

    // SECURITY CHECK 3: Require on-site presence (within 200 meters)
    const distance = distanceByAudit[audit.auditId];
    if (!userLocation || typeof distance !== 'number' || distance > 200) {
      setMessage('❌ You must be on-site (within 200 meters) to verify this audit. Use "Use my location".');
      return;
    }

    setMessage('');
    verifyMutation.mutate({ auditId: audit.auditId, verifierPublicKey: userPublicKey || '' });
  };

  if (!isConnected) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Wallet Required</h2>
        <p className="text-gray-300">Please connect your Solana wallet to verify audits and earn $QOL rewards.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card p-12 text-center">
        <svg className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-300">Loading verification queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="font-bold text-red-400 mb-2">Failed to load verification queue</p>
        <p className="text-sm text-gray-400">{error.message}</p>
      </div>
    );
  }

  if (filteredAudits.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-400 mb-2">All Caught Up!</h2>
        <p className="text-gray-300">The verification queue is clear. All available audits have been confirmed.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-10">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent mb-6">
        Verification Queue ({filteredAudits.length} Audits Pending)
      </h2>

      {/* Status Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-xl text-sm border ${
          message.startsWith('✅') || message.startsWith('🎉')
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Audit Cards */}
      <div className="space-y-6">
        {/* Reviewer Tools */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white/5 border border-purple-500/30">
          <button
            onClick={requestLocation}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow hover:from-blue-600 hover:to-indigo-700"
          >
            📍 Use my location
          </button>
          {userLocation && (
            <div className="text-sm text-gray-300">
              Current: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </div>
          )}
        </div>
        {filteredAudits.map((audit) => {
          const hasVerified = audit.verifiers?.includes(wallet?.publicKey?.toString());
          const isFullyVerified = audit.verificationCount >= 3;
          const distance = distanceByAudit[audit.auditId];
          const isOnSite = typeof distance === 'number' && distance <= 200;
          
          return (
            <div key={audit.auditId} className="border border-purple-500/30 p-5 rounded-xl shadow-lg bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="md:w-3/4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {audit.locationId} - Road Quality Audit
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="bg-white/5 p-2 rounded">
                      <span className="text-gray-400 text-xs">Reviewer:</span>
                      <span className="font-mono text-purple-400 ml-1 block truncate">
                        {audit.reviewerKey.substring(0, 6)}...
                      </span>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                      <span className="text-gray-400 text-xs">Rating:</span>
                      <span className="font-bold text-yellow-400 ml-1">
                        {audit.rating} / 5 ⭐
                      </span>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                      <span className="text-gray-400 text-xs">Verifications:</span>
                      <span className="font-bold text-purple-400 ml-1">
                        {audit.verificationCount} / 3
                      </span>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                      <span className="text-gray-400 text-xs">Status:</span>
                      <span className={`font-bold ml-1 ${
                        isFullyVerified ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {isFullyVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="bg-white/5 p-2 rounded col-span-2">
                      <span className="text-gray-400 text-xs">Audit GPS:</span>
                      <span className="ml-1 text-gray-200">
                        {audit.latitude?.toFixed(5)}, {audit.longitude?.toFixed(5)}
                      </span>
                      <span className={`ml-3 text-xs ${isOnSite ? 'text-green-400' : 'text-red-400'}`}>
                        {typeof distance === 'number' ? `${Math.round(distance)} m away` : 'Unknown distance'}
                        {!isOnSite && ' (need ≤ 200 m)'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Verification Progress</span>
                      <span className="font-bold text-purple-400">{audit.verificationCount}/3</span>
                    </div>
                    <div className="w-full bg-purple-500/20 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-lg shadow-purple-500/50"
                        style={{ width: `${(audit.verificationCount / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Proof Image */}
                  <div className="mt-4">
                    <img 
                      src={audit.mockImageUrl} 
                      alt="Audit Proof" 
                      className="w-40 h-auto rounded-xl border-2 border-purple-500/30 shadow-lg"
                    />
                  </div>

                  {/* Reviewer Comment */}
                  <div className="mt-4">
                    <label className="block text-sm text-gray-300 mb-2">Your on-site comment/feedback</label>
                    <textarea
                      className="w-full p-3 rounded-lg bg-white/5 border border-purple-500/30 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-500/60"
                      rows={3}
                      placeholder="Write what you observed on-site..."
                      value={commentsByAudit[audit.auditId] || ''}
                      onChange={(e) => setCommentsByAudit(prev => ({ ...prev, [audit.auditId]: e.target.value }))}
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-1">Comments are required and will be submitted with your verification.</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 md:mt-0 md:w-1/4 flex justify-end">
                  <button
                    onClick={() => handleVerify(audit)}
                    className={`font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out ${
                      hasVerified || isFullyVerified || !isOnSite || !(commentsByAudit[audit.auditId] || '').trim()
                        ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed border border-gray-500/30'
                        : verifyMutation.isPending
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    }`}
                    disabled={hasVerified || isFullyVerified || verifyMutation.isPending || !isOnSite || !(commentsByAudit[audit.auditId] || '').trim()}
                  >
                    {hasVerified 
                      ? 'Already Verified' 
                      : isFullyVerified
                      ? 'Fully Verified'
                      : verifyMutation.isPending
                      ? 'Verifying...'
                      : !isOnSite
                      ? 'Go on-site to verify'
                      : !(commentsByAudit[audit.auditId] || '').trim()
                      ? 'Add comment to verify'
                      : 'Confirm & Earn $QOL'
                    }
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Panel */}
      <div className="mt-6 glass-card p-5">
        <h4 className="font-semibold text-purple-300 mb-3">Verification Process:</h4>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Review the submitted photo and rating</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>Confirm the data is accurate and truthful</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">💰</span>
            <span>Earn $QOL tokens for each verification</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">✓</span>
            <span>Audits need 3 verifications to be finalized</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default VerificationQueue;
