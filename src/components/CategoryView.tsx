import React, { useState } from 'react';
import { MetricCard } from './MetricCard';
import { MetricData, CATEGORIES } from '../data/metrics';

interface CategoryViewProps {
  categoryId: string;
  metrics: { [metricId: string]: MetricData };
  onVerify?: (metricId: string) => void;
  onUpdate?: (metricId: string, value: number) => void;
  canVerify?: boolean;
}

export function CategoryView({ categoryId, metrics, onVerify, onUpdate, canVerify }: CategoryViewProps) {
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const category = CATEGORIES[categoryId as keyof typeof CATEGORIES];
  
  if (!category) return null;

  const handleVerify = async (metricId: string) => {
    if (!onVerify) return;
    
    setIsVerifying(metricId);
    try {
      await onVerify(metricId);
    } finally {
      setIsVerifying(null);
    }
  };

  const getCategoryScore = () => {
    const metricValues = Object.values(metrics);
    if (metricValues.length === 0) return 0;
    
    let totalScore = 0;
    metricValues.forEach(metric => {
      const normalizedValue = metric.value / metric.maxValue;
      totalScore += normalizedValue;
    });
    
    return Math.round((totalScore / metricValues.length) * 100);
  };

  const categoryScore = getCategoryScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Category Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
          <p className="text-gray-600 text-sm mb-2">{category.description}</p>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Weight: {Math.round(category.weight * 100)}%</span>
            <span className={`text-lg font-bold ${getScoreColor(categoryScore)}`}>
              Score: {categoryScore}/100
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Category Score</div>
          <div className={`text-3xl font-bold ${getScoreColor(categoryScore)}`}>
            {categoryScore}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(metrics).map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            onVerify={handleVerify}
            onUpdate={onUpdate}
            isVerifying={isVerifying === metric.id}
            canVerify={canVerify}
          />
        ))}
      </div>

      {/* Category Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Category Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Metrics:</span>
            <span className="font-medium ml-1">{Object.keys(metrics).length}</span>
          </div>
          <div>
            <span className="text-gray-600">Verified:</span>
            <span className="font-medium ml-1">
              {Object.values(metrics).filter(m => m.isVerified).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Pending:</span>
            <span className="font-medium ml-1">
              {Object.values(metrics).filter(m => !m.isVerified && m.verificationRequired).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Static:</span>
            <span className="font-medium ml-1">
              {Object.values(metrics).filter(m => !m.verificationRequired).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Tabs Component
interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories: { [key: string]: any };
}

export function CategoryTabs({ activeCategory, onCategoryChange, categories }: CategoryTabsProps) {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {Object.values(categories).map((category: any) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeCategory === category.id
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="text-center">
            <div className="font-semibold">{category.name}</div>
            <div className="text-xs text-gray-500">{Math.round(category.weight * 100)}%</div>
          </div>
        </button>
      ))}
    </div>
  );
}
