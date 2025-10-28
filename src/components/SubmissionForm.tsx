import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './WalletProvider';
import { awardSubmissionReward } from '../services/rewardService';

const LOCATION_OPTIONS = [
  { id: 'Mohali-India', name: 'Mohali, Punjab, India (140307)' },
];

// Metric data interface
interface MetricInfo {
  name: string;
  unit: string;
  maxValue: number;
  description: string;
}

interface CategoryInfo {
  id: string;
  name: string;
  metrics: Record<string, MetricInfo>;
}

// Reviewable categories and metrics
const REVIEWABLE_CATEGORIES: Record<string, CategoryInfo> = {
  'core-social': {
    id: 'core-social',
    name: 'Core Social Infrastructure',
    metrics: {
      'health-quality': { name: 'Health Quality', unit: 'minutes', maxValue: 120, description: 'Wait time at healthcare facilities' },
      'education-quality': { name: 'Education Quality', unit: 'rating', maxValue: 10, description: 'School quality rating' },
      'crime-safety': { name: 'Crime & Safety', unit: 'cases/month', maxValue: 50, description: 'Local crime incidents' },
      'local-corruption': { name: 'Local Corruption', unit: 'reports/month', maxValue: 10, description: 'Bribery/official misconduct' }
    }
  },
  'mobility-infrastructure': {
    id: 'mobility-infrastructure',
    name: 'Mobility & Urban Infrastructure',
    metrics: {
      'road-conditions': { name: 'Road Conditions', unit: 'stars', maxValue: 5, description: 'Road surface quality' },
      'pothole-fix-speed': { name: 'Pothole Fix Speed', unit: 'days', maxValue: 30, description: 'How quickly potholes get fixed' },
      'traffic-congestion': { name: 'Traffic Congestion', unit: 'minutes', maxValue: 60, description: 'Daily commute delays' },
      'rain-drainage': { name: 'Rain Drainage', unit: 'reports/month', maxValue: 20, description: 'Flooding issues' },
      'construction-standards': { name: 'Construction Standards', unit: '%', maxValue: 100, description: 'Building quality' },
      'road-safety-kids': { name: 'Road Safety for Kids', unit: 'rating', maxValue: 10, description: 'Child safety ratings' }
    }
  },
  'environmental-quality': {
    id: 'environmental-quality',
    name: 'Environmental Quality',
    metrics: {
      'energy-sufficiency': { name: 'Energy Sufficiency', unit: 'cuts/month', maxValue: 10, description: 'Power cut frequency' },
      'sustainability-index': { name: 'Sustainability Index', unit: '%', maxValue: 100, description: 'Environmental practices' },
      'weather-impact': { name: 'Weather Impact', unit: 'events/year', maxValue: 20, description: 'Climate disruptions' }
    }
  },
  'community-lifestyle': {
    id: 'community-lifestyle',
    name: 'Community & Lifestyle',
    metrics: {
      'grocery-access': { name: 'Grocery/Food Access', unit: 'markets/500m', maxValue: 20, description: 'Market availability' },
      'leisure-entertainment': { name: 'Leisure & Entertainment', unit: 'rating', maxValue: 5, description: 'Recreation options' },
      'noise-pollution': { name: 'Noise Pollution', unit: 'dB', maxValue: 100, description: 'Sound levels' }
    }
  }
};

// Mock submission function
async function submitAudit(auditData: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock transaction signature
  const mockTxSignature = `5tH4...${Math.random().toString(36).substring(2, 8)}`;
  
  return {
    auditId: `AUDIT-${Date.now()}`,
    txSignature: mockTxSignature,
    ...auditData
  };
}

function SubmissionForm() {
  const { wallet, isConnected } = useWallet();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(3);
  const [locationId, setLocationId] = useState('Mohali-India');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('mobility-infrastructure');
  const [selectedMetric, setSelectedMetric] = useState('road-conditions');

  // Debounced rating update
  const [debouncedRating, setDebouncedRating] = useState(rating);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRating(rating);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [rating]);

  // Mutation for submitting audit
  const submitMutation = useMutation({
    mutationFn: submitAudit,
    onSuccess: async (data) => {
      const walletAddress = wallet?.publicKey?.toString() || 'mock-key';
      
      // Award submission reward (10 $QOL, pending verification)
      const reward = await awardSubmissionReward(walletAddress, data.auditId);
      
      setMessage(`✅ Audit Submitted! +${reward.amount} $QOL (pending). Tx: ${data.txSignature.substring(0, 10)}. Awaiting 3 verifications.`);
      
      // Reset form
      setRating(3);
      setLocationId(LOCATION_OPTIONS[0].id);
      setImageFile(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Invalidate and refetch locations to show updated data
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error) => {
      setMessage(`❌ Submission failed: ${error.message}`);
    },
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!isConnected) {
      setMessage('Please connect your Solana Wallet first.');
      return;
    }

    if (!imageFile) {
      setMessage('A photo is required for geo-verification.');
      return;
    }

    const auditData = {
      locationId,
      category: selectedCategory,
      metric: selectedMetric,
      rating: debouncedRating,
      imageFile: imageFile.name, // In real implementation, upload to Firebase
      reviewerKey: wallet?.publicKey?.toString() || 'mock-key',
      timestamp: new Date().toISOString(),
    };

    submitMutation.mutate(auditData);
  }, [isConnected, imageFile, locationId, debouncedRating, wallet, submitMutation, selectedCategory, selectedMetric]);

  if (!isConnected) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Wallet Required</h2>
        <p className="text-gray-400">Please connect your Solana wallet to submit audits and earn $QOL rewards.</p>
      </div>
    );
  }

  const selectedCategoryData = REVIEWABLE_CATEGORIES[selectedCategory];
  const selectedMetricData = selectedCategoryData?.metrics[selectedMetric];

  return (
    <div className="glass-card p-6 md:p-10">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent mb-6">Submit New Audit</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Selection */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-purple-300 mb-2">
            Location / District
          </label>
          <select
            id="location"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition placeholder:text-gray-500"
            disabled={submitMutation.isPending}
          >
            {LOCATION_OPTIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-purple-300 mb-2">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              // Reset metric to first available metric in new category
              const categoryMetrics = REVIEWABLE_CATEGORIES[e.target.value]?.metrics;
              if (categoryMetrics) {
                setSelectedMetric(Object.keys(categoryMetrics)[0]);
              }
            }}
            className="w-full p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            disabled={submitMutation.isPending}
          >
            {Object.values(REVIEWABLE_CATEGORIES).map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Metric Selection */}
        <div>
          <label htmlFor="metric" className="block text-sm font-medium text-purple-300 mb-2">
            Specific Metric
          </label>
          <select
            id="metric"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            disabled={submitMutation.isPending}
          >
            {selectedCategoryData && Object.entries(selectedCategoryData.metrics).map(([metricId, metric]) => (
              <option key={metricId} value={metricId} className="bg-[#1a1625]">{metric.name}</option>
            ))}
          </select>
          {selectedMetricData && (
            <p className="mt-2 text-xs text-purple-300/70">{selectedMetricData.description}</p>
          )}
        </div>

        {/* Rating Slider */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-purple-300 mb-2">
            {selectedMetricData?.name} Rating (1-{selectedMetricData?.maxValue})
          </label>
          <input
            type="range"
            id="rating"
            min="1"
            max={selectedMetricData?.maxValue || 5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full h-3 bg-purple-500/20 rounded-lg appearance-none cursor-pointer range-lg accent-purple-500"
            disabled={submitMutation.isPending}
          />
          <div className="text-center text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-3">
            {rating} / {selectedMetricData?.maxValue} {selectedMetricData?.unit === 'stars' ? '⭐' : selectedMetricData?.unit}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-purple-300 mb-2">
            Proof Photo (Required for Verification)
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-purple-700 file:text-white hover:file:from-purple-700 hover:file:to-purple-800 transition"
            required
            disabled={submitMutation.isPending}
          />
          {imageFile && (
            <p className="mt-2 text-xs text-green-400">✓ File selected: {imageFile.name}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a1625] transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          disabled={submitMutation.isPending || !isConnected}
        >
          {submitMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting to Blockchain...
            </>
          ) : (
            'Submit Audit & Stake Reward'
          )}
        </button>

        {/* Status Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-xl text-sm border ${
            message.startsWith('✅') 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}
      </form>

      {/* Info Panel */}
      <div className="mt-6 glass-card p-6">
        <h4 className="font-semibold text-purple-300 mb-3">How it works:</h4>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Select any category and metric you want to review</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Upload a photo as proof of your assessment</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Rate the metric based on your experience</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Submit to Solana blockchain for verification</span>
          </li>
          <li className="flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span>Earn $QOL tokens when 3 verifiers confirm your audit</span>
          </li>
        </ul>
      </div>

      {/* Available Categories */}
      <div className="mt-4 glass-card p-6">
        <h4 className="font-semibold text-purple-300 mb-3">Available for Review:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
          {Object.values(REVIEWABLE_CATEGORIES).map(category => (
            <div key={category.id} className="bg-white/5 p-3 rounded-lg">
              <strong className="text-purple-300">{category.name}:</strong>
              <ul className="ml-3 mt-1 space-y-1">
                {Object.values(category.metrics).map(metric => (
                  <li key={metric.name} className="text-gray-400">• {metric.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SubmissionForm;
