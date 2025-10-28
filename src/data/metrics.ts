// Comprehensive QoL Metrics Data Structure
export interface MetricData {
  id: string;
  name: string;
  category: string;
  categoryWeight: number;
  dataType: 'factual' | 'verified' | 'blended';
  verificationRequired: boolean;
  value: number;
  maxValue: number;
  unit: string;
  description: string;
  lastUpdated: string;
  verifiedBy?: string[];
  verificationCount?: number;
  isVerified?: boolean;
}

export interface LocationData {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  metrics: {
    [categoryId: string]: {
      [metricId: string]: MetricData;
    };
  };
  overallQoLScore: number;
  lastCalculated: string;
}

// Category definitions
export const CATEGORIES = {
  'core-social': {
    id: 'core-social',
    name: 'Core Social Infrastructure',
    weight: 0.40,
    description: 'Essential, non-negotiable public services',
    metrics: {
      'health-capacity': {
        id: 'health-capacity',
        name: 'Health Capacity',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'beds/1000 pop',
        maxValue: 5,
        description: 'Hospital beds per 1000 population'
      },
      'health-quality': {
        id: 'health-quality',
        name: 'Health Quality',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'minutes',
        maxValue: 120,
        description: 'Average wait time at healthcare facilities'
      },
      'education-quality': {
        id: 'education-quality',
        name: 'Education Quality',
        dataType: 'blended' as const,
        verificationRequired: true,
        unit: 'rating',
        maxValue: 10,
        description: 'School ratings combined with user reviews'
      },
      'crime-safety': {
        id: 'crime-safety',
        name: 'Crime & Safety',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'cases/month',
        maxValue: 50,
        description: 'Verified reports of localized crime'
      },
      'local-corruption': {
        id: 'local-corruption',
        name: 'Local Corruption',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'reports/month',
        maxValue: 10,
        description: 'Verified reports of bribery or official misconduct'
      }
    }
  },
  'mobility-infrastructure': {
    id: 'mobility-infrastructure',
    name: 'Mobility & Urban Infrastructure',
    weight: 0.35,
    description: 'Daily life transportation and infrastructure',
    metrics: {
      'road-conditions': {
        id: 'road-conditions',
        name: 'Road Conditions',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'stars',
        maxValue: 5,
        description: 'General rating of road surface quality'
      },
      'pothole-fix-speed': {
        id: 'pothole-fix-speed',
        name: 'Pothole Fix Speed',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'days',
        maxValue: 30,
        description: 'Average time to fix reported potholes'
      },
      'traffic-congestion': {
        id: 'traffic-congestion',
        name: 'Traffic Congestion',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'minutes',
        maxValue: 60,
        description: 'Rush hour traffic delay'
      },
      'rain-drainage': {
        id: 'rain-drainage',
        name: 'Rain Drainage',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'reports/month',
        maxValue: 20,
        description: 'Flood reports during normal rain'
      },
      'construction-standards': {
        id: 'construction-standards',
        name: 'Construction Standards',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: '%',
        maxValue: 100,
        description: 'Construction site compliance rate'
      },
      'road-safety-kids': {
        id: 'road-safety-kids',
        name: 'Road Safety for Kids',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'rating',
        maxValue: 10,
        description: 'Pedestrian safety for children'
      },
      'transit-proximity': {
        id: 'transit-proximity',
        name: 'Transit Proximity',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'meters',
        maxValue: 2000,
        description: 'Distance to nearest transit stop'
      }
    }
  },
  'economic-affordability': {
    id: 'economic-affordability',
    name: 'Economic & Affordability',
    weight: 0.15,
    description: 'Economic factors affecting cost of living',
    metrics: {
      'affordability-ratio': {
        id: 'affordability-ratio',
        name: 'Affordability Ratio',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'ratio',
        maxValue: 1,
        description: 'Wage vs rent affordability ratio'
      },
      'job-proximity': {
        id: 'job-proximity',
        name: 'Job Proximity',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'km',
        maxValue: 10,
        description: 'Distance to major employment centers'
      },
      'tourism-impact': {
        id: 'tourism-impact',
        name: 'Tourism Impact',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'M$/year',
        maxValue: 10,
        description: 'Annual tourism income'
      },
      'hazardous-distance': {
        id: 'hazardous-distance',
        name: 'Hazardous Distance',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'km',
        maxValue: 20,
        description: 'Distance to industrial facilities'
      }
    }
  },
  'environmental-utility': {
    id: 'environmental-utility',
    name: 'Environmental & Utility',
    weight: 0.07,
    description: 'Environmental factors and utility reliability',
    metrics: {
      'aqi-water-quality': {
        id: 'aqi-water-quality',
        name: 'AQI & Water Quality',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'AQI',
        maxValue: 200,
        description: 'Air Quality Index'
      },
      'energy-sufficiency': {
        id: 'energy-sufficiency',
        name: 'Energy Sufficiency',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'cuts/month',
        maxValue: 10,
        description: 'Power cut frequency'
      },
      'sustainability-index': {
        id: 'sustainability-index',
        name: 'Sustainability Index',
        dataType: 'blended' as const,
        verificationRequired: true,
        unit: '%',
        maxValue: 100,
        description: 'Recycling rate and green initiatives'
      },
      'weather-impact': {
        id: 'weather-impact',
        name: 'Weather Impact',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'events/year',
        maxValue: 20,
        description: 'Extreme weather disruption events'
      }
    }
  },
  'amenities-lifestyle': {
    id: 'amenities-lifestyle',
    name: 'Amenities & Lifestyle',
    weight: 0.03,
    description: 'Quality of life amenities and lifestyle factors',
    metrics: {
      'green-space-access': {
        id: 'green-space-access',
        name: 'Green Space Access',
        dataType: 'factual' as const,
        verificationRequired: false,
        unit: 'parks/1km',
        maxValue: 10,
        description: 'Number of parks within 1km radius'
      },
      'grocery-food-access': {
        id: 'grocery-food-access',
        name: 'Grocery/Food Access',
        dataType: 'blended' as const,
        verificationRequired: true,
        unit: 'markets/500m',
        maxValue: 20,
        description: 'Food markets within 500m with quality ratings'
      },
      'leisure-entertainment': {
        id: 'leisure-entertainment',
        name: 'Leisure & Entertainment',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'rating',
        maxValue: 5,
        description: 'Restaurant and entertainment ratings'
      },
      'noise-pollution': {
        id: 'noise-pollution',
        name: 'Noise Pollution',
        dataType: 'verified' as const,
        verificationRequired: true,
        unit: 'dB',
        maxValue: 100,
        description: 'Residential noise levels'
      }
    }
  }
};

// Mock data for Mohali, India (140307) - Single location focus
export const MOCK_LOCATIONS_DATA: LocationData[] = [
  {
    id: 'Mohali-India',
    name: 'Mohali, Punjab, India (140307)',
    coordinates: { lat: 30.7046, lng: 76.7179 },
    overallQoLScore: 0,
    lastCalculated: new Date().toISOString(),
    metrics: {
      'core-social': {
        'health-capacity': {
          id: 'health-capacity',
          name: 'Health Capacity',
          category: 'core-social',
          categoryWeight: 0.40,
          dataType: 'factual',
          verificationRequired: false,
          value: 1.8,
          maxValue: 5,
          unit: 'beds/1000 pop',
          description: 'Hospital beds per 1000 population',
          lastUpdated: new Date().toISOString()
        },
        'health-quality': {
          id: 'health-quality',
          name: 'Health Quality',
          category: 'core-social',
          categoryWeight: 0.40,
          dataType: 'verified',
          verificationRequired: true,
          value: 35,
          maxValue: 120,
          unit: 'minutes',
          description: 'Average wait time at healthcare facilities',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'education-quality': {
          id: 'education-quality',
          name: 'Education Quality',
          category: 'core-social',
          categoryWeight: 0.40,
          dataType: 'blended',
          verificationRequired: true,
          value: 7.5,
          maxValue: 10,
          unit: 'rating',
          description: 'School ratings combined with user reviews',
          lastUpdated: new Date().toISOString(),
          verificationCount: 1,
          isVerified: false,
          verifiedBy: ['verifier-1']
        },
        'crime-safety': {
          id: 'crime-safety',
          name: 'Crime & Safety',
          category: 'core-social',
          categoryWeight: 0.40,
          dataType: 'verified',
          verificationRequired: true,
          value: 8,
          maxValue: 50,
          unit: 'cases/month',
          description: 'Verified reports of localized crime',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'local-corruption': {
          id: 'local-corruption',
          name: 'Local Corruption',
          category: 'core-social',
          categoryWeight: 0.40,
          dataType: 'verified',
          verificationRequired: true,
          value: 1,
          maxValue: 10,
          unit: 'reports/month',
          description: 'Verified reports of bribery or official misconduct',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        }
      },
      'mobility-infrastructure': {
        'road-conditions': {
          id: 'road-conditions',
          name: 'Road Conditions',
          category: 'mobility-infrastructure',
          categoryWeight: 0.35,
          dataType: 'verified',
          verificationRequired: true,
          value: 3,
          maxValue: 5,
          unit: 'stars',
          description: 'General rating of road surface quality',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'pothole-fix-speed': {
          id: 'pothole-fix-speed',
          name: 'Pothole Fix Speed',
          category: 'mobility-infrastructure',
          categoryWeight: 0.35,
          dataType: 'verified',
          verificationRequired: true,
          value: 7,
          maxValue: 30,
          unit: 'days',
          description: 'Average time to fix reported potholes',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'traffic-congestion': {
          id: 'traffic-congestion',
          name: 'Traffic Congestion',
          category: 'mobility-infrastructure',
          categoryWeight: 0.35,
          dataType: 'verified',
          verificationRequired: true,
          value: 20,
          maxValue: 60,
          unit: 'minutes',
          description: 'Rush hour traffic delay',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'rain-drainage': {
          id: 'rain-drainage',
          name: 'Rain Drainage',
          category: 'mobility-infrastructure',
          categoryWeight: 0.35,
          dataType: 'verified',
          verificationRequired: true,
          value: 4,
          maxValue: 20,
          unit: 'reports/month',
          description: 'Flood reports during normal rain',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'construction-standards': {
          id: 'construction-standards',
          name: 'Construction Standards',
          category: 'mobility-infrastructure',
          categoryWeight: 0.35,
          dataType: 'verified',
          verificationRequired: true,
          value: 75,
          maxValue: 100,
          unit: '%',
          description: 'Construction site compliance rate',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'road-safety-kids': {
          id: 'road-safety-kids',
          name: 'Road Safety for Kids',
          category: 'mobility-infrastructure',
          categoryWeight: 0.35,
          dataType: 'verified',
          verificationRequired: true,
          value: 5,
          maxValue: 10,
          unit: 'rating',
          description: 'Pedestrian safety for children',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'transit-proximity': {
          id: 'transit-proximity',
          name: 'Transit Proximity',
          category: 'mobility-infrastructure',
          categoryWeight: 0.35,
          dataType: 'factual',
          verificationRequired: false,
          value: 500,
          maxValue: 2000,
          unit: 'meters',
          description: 'Distance to nearest transit stop',
          lastUpdated: new Date().toISOString()
        }
      },
      'economic-affordability': {
        'affordability-ratio': {
          id: 'affordability-ratio',
          name: 'Affordability Ratio',
          category: 'economic-affordability',
          categoryWeight: 0.15,
          dataType: 'factual',
          verificationRequired: false,
          value: 0.65,
          maxValue: 1,
          unit: 'ratio',
          description: 'Wage vs rent affordability ratio',
          lastUpdated: new Date().toISOString()
        },
        'job-proximity': {
          id: 'job-proximity',
          name: 'Job Proximity',
          category: 'economic-affordability',
          categoryWeight: 0.15,
          dataType: 'factual',
          verificationRequired: false,
          value: 2.5,
          maxValue: 10,
          unit: 'km',
          description: 'Distance to major employment centers',
          lastUpdated: new Date().toISOString()
        },
        'tourism-impact': {
          id: 'tourism-impact',
          name: 'Tourism Impact',
          category: 'economic-affordability',
          categoryWeight: 0.15,
          dataType: 'factual',
          verificationRequired: false,
          value: 0.8,
          maxValue: 10,
          unit: 'M$/year',
          description: 'Annual tourism income',
          lastUpdated: new Date().toISOString()
        },
        'hazardous-distance': {
          id: 'hazardous-distance',
          name: 'Hazardous Distance',
          category: 'economic-affordability',
          categoryWeight: 0.15,
          dataType: 'factual',
          verificationRequired: false,
          value: 8,
          maxValue: 20,
          unit: 'km',
          description: 'Distance to industrial facilities',
          lastUpdated: new Date().toISOString()
        }
      },
      'environmental-utility': {
        'aqi-water-quality': {
          id: 'aqi-water-quality',
          name: 'AQI & Water Quality',
          category: 'environmental-utility',
          categoryWeight: 0.07,
          dataType: 'factual',
          verificationRequired: false,
          value: 65,
          maxValue: 200,
          unit: 'AQI',
          description: 'Air Quality Index',
          lastUpdated: new Date().toISOString()
        },
        'energy-sufficiency': {
          id: 'energy-sufficiency',
          name: 'Energy Sufficiency',
          category: 'environmental-utility',
          categoryWeight: 0.07,
          dataType: 'verified',
          verificationRequired: true,
          value: 4,
          maxValue: 10,
          unit: 'cuts/month',
          description: 'Power cut frequency',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'sustainability-index': {
          id: 'sustainability-index',
          name: 'Sustainability Index',
          category: 'environmental-utility',
          categoryWeight: 0.07,
          dataType: 'blended',
          verificationRequired: true,
          value: 55,
          maxValue: 100,
          unit: '%',
          description: 'Recycling rate and green initiatives',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'weather-impact': {
          id: 'weather-impact',
          name: 'Weather Impact',
          category: 'environmental-utility',
          categoryWeight: 0.07,
          dataType: 'verified',
          verificationRequired: true,
          value: 6,
          maxValue: 20,
          unit: 'events/year',
          description: 'Extreme weather disruption events',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        }
      },
      'amenities-lifestyle': {
        'green-space-access': {
          id: 'green-space-access',
          name: 'Green Space Access',
          category: 'amenities-lifestyle',
          categoryWeight: 0.03,
          dataType: 'factual',
          verificationRequired: false,
          value: 4,
          maxValue: 10,
          unit: 'parks/1km',
          description: 'Number of parks within 1km radius',
          lastUpdated: new Date().toISOString()
        },
        'grocery-food-access': {
          id: 'grocery-food-access',
          name: 'Grocery/Food Access',
          category: 'amenities-lifestyle',
          categoryWeight: 0.03,
          dataType: 'blended',
          verificationRequired: true,
          value: 6,
          maxValue: 20,
          unit: 'markets/500m',
          description: 'Food markets within 500m with quality ratings',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'leisure-entertainment': {
          id: 'leisure-entertainment',
          name: 'Leisure & Entertainment',
          category: 'amenities-lifestyle',
          categoryWeight: 0.03,
          dataType: 'verified',
          verificationRequired: true,
          value: 3.8,
          maxValue: 5,
          unit: 'rating',
          description: 'Restaurant and entertainment ratings',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        },
        'noise-pollution': {
          id: 'noise-pollution',
          name: 'Noise Pollution',
          category: 'amenities-lifestyle',
          categoryWeight: 0.03,
          dataType: 'verified',
          verificationRequired: true,
          value: 68,
          maxValue: 100,
          unit: 'dB',
          description: 'Residential noise levels',
          lastUpdated: new Date().toISOString(),
          verificationCount: 0,
          isVerified: false,
          verifiedBy: []
        }
      }
    }
  }
];

// Calculate QoL score for a location
export function calculateQoLScore(location: LocationData): number {
  let totalScore = 0;
  let totalWeight = 0;

  Object.values(CATEGORIES).forEach(category => {
    const categoryMetrics = location.metrics[category.id];
    if (!categoryMetrics) return;

    let categoryScore = 0;
    let metricCount = 0;

    Object.values(categoryMetrics).forEach(metric => {
      // Normalize metric value to 0-1 scale
      const normalizedValue = metric.value / metric.maxValue;
      
      // For verified metrics, apply verification bonus
      let finalValue = normalizedValue;
      if (metric.dataType === 'verified' && metric.isVerified) {
        finalValue = Math.min(1, normalizedValue * 1.1); // 10% bonus for verified data
      }
      
      categoryScore += finalValue;
      metricCount++;
    });

    if (metricCount > 0) {
      const avgCategoryScore = categoryScore / metricCount;
      totalScore += avgCategoryScore * category.weight;
      totalWeight += category.weight;
    }
  });

  return totalWeight > 0 ? Math.round(totalScore * 100) : 0;
}
