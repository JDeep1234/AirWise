import React from 'react';

interface Pollutant {
  name: string;
  value: number;
  unit: string;
  level: 'low' | 'moderate' | 'high' | 'very-high' | 'hazardous';
}

interface PollutantLevelsProps {
  pollutants: Pollutant[];
  loading: boolean;
}

const PollutantLevels: React.FC<PollutantLevelsProps> = ({ pollutants, loading }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'very-high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'hazardous': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  const getBarColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'very-high': return 'bg-red-500';
      case 'hazardous': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Pollutant Levels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pollutants.map((pollutant) => (
          <div key={pollutant.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300">{pollutant.name}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getLevelColor(pollutant.level)}`}>
                  {pollutant.level.replace('-', ' ')}
                </span>
              </div>
              <span className="text-gray-800 dark:text-white font-medium">
                {pollutant.value} {pollutant.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`${getBarColor(pollutant.level)} h-2.5 rounded-full transition-all duration-500`} 
                style={{ width: `${Math.min(pollutant.value / 500 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollutantLevels;