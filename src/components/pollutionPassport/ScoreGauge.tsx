import React from 'react';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  previousScore: number;
  category: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
  weeklyChange: number;
  onInfoClick?: () => void;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  previousScore,
  category,
  weeklyChange,
  onInfoClick
}) => {
  // Calculate the stroke dash array for the circular progress
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Get category specific styling
  const getCategoryColor = () => {
    switch (category) {
      case 'excellent':
        return {
          gradient: 'from-green-400 to-green-600',
          stroke: '#10b981',
          bg: 'bg-green-50',
          text: 'text-green-600'
        };
      case 'good':
        return {
          gradient: 'from-green-300 to-green-500',
          stroke: '#22c55e',
          bg: 'bg-green-50',
          text: 'text-green-500'
        };
      case 'moderate':
        return {
          gradient: 'from-yellow-400 to-yellow-600',
          stroke: '#eab308',
          bg: 'bg-yellow-50',
          text: 'text-yellow-600'
        };
      case 'poor':
        return {
          gradient: 'from-orange-400 to-orange-600',
          stroke: '#f97316',
          bg: 'bg-orange-50',
          text: 'text-orange-600'
        };
      case 'hazardous':
        return {
          gradient: 'from-red-400 to-red-600',
          stroke: '#ef4444',
          bg: 'bg-red-50',
          text: 'text-red-600'
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-600',
          stroke: '#6b7280',
          bg: 'bg-gray-50',
          text: 'text-gray-600'
        };
    }
  };

  const categoryStyle = getCategoryColor();

  // Get trend icon and color
  const getTrendInfo = () => {
    if (weeklyChange > 0) {
      return {
        icon: TrendingUp,
        color: 'text-green-500',
        text: `+${weeklyChange}`
      };
    } else if (weeklyChange < 0) {
      return {
        icon: TrendingDown,
        color: 'text-red-500',
        text: `${weeklyChange}`
      };
    } else {
      return {
        icon: Minus,
        color: 'text-gray-500',
        text: '0'
      };
    }
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  return (
    <div className={`relative ${categoryStyle.bg} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 transition-all duration-300 hover:shadow-lg group`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pollution Credit Score
        </h3>
        <button
          onClick={onInfoClick}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          title="View score breakdown"
        >
          <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Circular Progress Gauge */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
              className="dark:stroke-gray-600"
            />
            {/* Progress circle with gradient */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={categoryStyle.stroke}
              strokeWidth="6"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.1))'
              }}
            />
          </svg>

          {/* Score display in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-3xl font-bold ${categoryStyle.text} transition-colors duration-300`}>
              {score}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              / 100
            </div>
          </div>
        </div>
      </div>

      {/* Category and Trend */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${categoryStyle.text} capitalize`}>
            {category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Grade: {category === 'excellent' ? 'A+' : 
                   category === 'good' ? 'A' :
                   category === 'moderate' ? 'B' :
                   category === 'poor' ? 'C' : 'F'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <TrendIcon className={`h-4 w-4 ${trendInfo.color}`} />
          <span className={`text-sm font-medium ${trendInfo.color}`}>
            {trendInfo.text}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            this week
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {previousScore}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Previous Score
          </div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${score > previousScore ? 'text-green-600' : score < previousScore ? 'text-red-600' : 'text-gray-600'}`}>
            {score > previousScore ? '+' : ''}{score - previousScore}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Change
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
    </div>
  );
};

export default ScoreGauge; 