import React from 'react';
import { MetricData } from '../data/metrics';

interface MetricCardProps {
  metric: MetricData;
  onVerify?: (metricId: string) => void;
  onUpdate?: (metricId: string, value: number) => void;
  isVerifying?: boolean;
  canVerify?: boolean;
}

// Factual/External Data Component (No verification required)
export function FactualMetricCard({ metric }: MetricCardProps) {
  const getValueColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-yellow-600';
    if (ratio >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{metric.name}</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Static Data
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {metric.value}
        </span>
        <span className={`text-sm font-medium ${getValueColor(metric.value, metric.maxValue)}`}>
          {metric.unit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            metric.value / metric.maxValue >= 0.8 ? 'bg-green-500' :
            metric.value / metric.maxValue >= 0.6 ? 'bg-yellow-500' :
            metric.value / metric.maxValue >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
        ></div>
      </div>
      
      <p className="text-xs text-gray-500">{metric.description}</p>
      <p className="text-xs text-gray-400 mt-1">
        Last updated: {new Date(metric.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  );
}

// On-Chain Verified Data Component (Requires verification)
export function VerifiedMetricCard({ metric, onVerify, isVerifying, canVerify }: MetricCardProps) {
  const getValueColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-yellow-600';
    if (ratio >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVerificationStatus = () => {
    if (metric.isVerified) return { text: 'Verified', color: 'bg-green-100 text-green-800' };
    if (metric.verificationCount && metric.verificationCount > 0) {
      return { text: `${metric.verificationCount}/3 Verified`, color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Unverified', color: 'bg-red-100 text-red-800' };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{metric.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${verificationStatus.color}`}>
          {verificationStatus.text}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {metric.value}
        </span>
        <span className={`text-sm font-medium ${getValueColor(metric.value, metric.maxValue)}`}>
          {metric.unit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            metric.value / metric.maxValue >= 0.8 ? 'bg-green-500' :
            metric.value / metric.maxValue >= 0.6 ? 'bg-yellow-500' :
            metric.value / metric.maxValue >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
        ></div>
      </div>
      
      {/* Verification Progress */}
      {!metric.isVerified && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Verification Progress</span>
            <span>{metric.verificationCount || 0}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((metric.verificationCount || 0) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mb-2">{metric.description}</p>
      
      {/* Verify Button */}
      {canVerify && !metric.isVerified && onVerify && (
        <button
          onClick={() => onVerify(metric.id)}
          disabled={isVerifying}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-3 rounded-lg transition duration-150 ease-in-out disabled:bg-gray-400"
        >
          {isVerifying ? 'Verifying...' : 'Verify Data'}
        </button>
      )}
      
      <p className="text-xs text-gray-400 mt-2">
        Last updated: {new Date(metric.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  );
}

// Blended Score Component (Mixed data types)
export function BlendedMetricCard({ metric, onVerify, isVerifying, canVerify }: MetricCardProps) {
  const getValueColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-yellow-600';
    if (ratio >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVerificationStatus = () => {
    if (metric.isVerified) return { text: 'Fully Verified', color: 'bg-green-100 text-green-800' };
    if (metric.verificationCount && metric.verificationCount > 0) {
      return { text: `Partial (${metric.verificationCount}/3)`, color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Static Only', color: 'bg-blue-100 text-blue-800' };
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{metric.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${verificationStatus.color}`}>
          {verificationStatus.text}
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {metric.value}
        </span>
        <span className={`text-sm font-medium ${getValueColor(metric.value, metric.maxValue)}`}>
          {metric.unit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            metric.value / metric.maxValue >= 0.8 ? 'bg-green-500' :
            metric.value / metric.maxValue >= 0.6 ? 'bg-yellow-500' :
            metric.value / metric.maxValue >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
        ></div>
      </div>
      
      {/* Verification Progress */}
      {!metric.isVerified && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>User Review Progress</span>
            <span>{metric.verificationCount || 0}/3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((metric.verificationCount || 0) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mb-2">{metric.description}</p>
      
      {/* Verify Button */}
      {canVerify && !metric.isVerified && onVerify && (
        <button
          onClick={() => onVerify(metric.id)}
          disabled={isVerifying}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-3 rounded-lg transition duration-150 ease-in-out disabled:bg-gray-400"
        >
          {isVerifying ? 'Verifying...' : 'Add Review'}
        </button>
      )}
      
      <p className="text-xs text-gray-400 mt-2">
        Last updated: {new Date(metric.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  );
}

// Main Metric Card Component
export function MetricCard(props: MetricCardProps) {
  const { metric } = props;
  
  switch (metric.dataType) {
    case 'factual':
      return <FactualMetricCard {...props} />;
    case 'verified':
      return <VerifiedMetricCard {...props} />;
    case 'blended':
      return <BlendedMetricCard {...props} />;
    default:
      return <FactualMetricCard {...props} />;
  }
}
