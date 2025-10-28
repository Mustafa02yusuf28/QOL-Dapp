import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MOCK_LOCATIONS_DATA, calculateQoLScore, CATEGORIES } from '../data/metrics';
import { CategoryView, CategoryTabs } from './CategoryView';
import { useWallet } from './WalletProvider';
import { InteractiveMap } from './InteractiveMap';

// Mock API function
async function fetchLocations() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Calculate QoL scores for all locations
  const locationsWithScores = MOCK_LOCATIONS_DATA.map(location => ({
    ...location,
    overallQoLScore: calculateQoLScore(location)
  }));
  
  return locationsWithScores;
}

// Color mapping for QoL scores
function getScoreColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function MapView() {
  const { isConnected } = useWallet();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('core-social');
  
  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleVerify = async (metricId: string) => {
    // Mock verification - in real implementation, this would call the smart contract
    console.log(`Verifying metric: ${metricId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (isLoading) {
    return (
      <div className="glass-card p-12 h-[calc(100vh-220px)] flex flex-col justify-center items-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-300">Loading QoL data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 h-[calc(100vh-220px)] flex flex-col justify-center items-center">
        <div className="text-center text-red-400">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="font-bold mb-2">Failed to load QoL data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const selectedLocationData = selectedLocation 
    ? locations?.find(loc => loc.id === selectedLocation)
    : null;

  return (
    <div className="glass-card p-6">
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent mb-1">Live QoL Map View</h2>
        <p className="text-gray-300 text-sm">
          Comprehensive Quality of Life Index with verified blockchain data
        </p>
      </div>

      {/* Interactive Map */}
      <div className="mb-6">
        <InteractiveMap 
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Location Selection */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-purple-300 mb-2">Select Location to View Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {locations?.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedLocation === location.id
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-purple-500/30 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white text-sm">{location.name}</h4>
                <div className={`w-3 h-3 rounded-full ${getScoreColor(location.overallQoLScore)} shadow-lg`}></div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{location.overallQoLScore}/100</div>
                <div className="text-xs text-gray-400 mt-1">Overall QoL Score</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Category View */}
      {selectedLocationData && (
        <div className="mt-6 glass-card p-6 relative">
          {/* Close Button */}
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-4 right-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <span>✕</span>
            <span className="hidden sm:inline">Close Details</span>
          </button>
          
          <h3 className="text-xl font-bold text-white mb-4 pr-20">
            {selectedLocationData.name} - Detailed Analysis
          </h3>
          
          {/* Category Tabs */}
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={CATEGORIES}
          />
          
          {/* Category Content */}
          <CategoryView
            categoryId={activeCategory}
            metrics={selectedLocationData.metrics[activeCategory] || {}}
            onVerify={handleVerify}
            canVerify={isConnected}
          />
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 glass-card p-4">
        <h4 className="font-semibold text-purple-300 mb-2 text-sm">QoL Score Legend</h4>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
            <span className="text-gray-300">80-100 (Excellent)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
            <span className="text-gray-300">60-79 (Good)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
            <span className="text-gray-300">40-59 (Fair)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
            <span className="text-gray-300">0-39 (Poor)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;
