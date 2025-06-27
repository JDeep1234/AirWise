import React from 'react';

interface AQILegendProps {
  className?: string;
}

const AQILegend: React.FC<AQILegendProps> = ({ className = '' }) => {
  return (
    <div className={`${className}`}>
      <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">AQI Legend</div>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10B981' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Good (0-50)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#F59E0B' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Moderate (51-100)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#F97316' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Unhealthy for Sensitive Groups (101-150)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#EF4444' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Unhealthy (151-200)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#8B5CF6' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Very Unhealthy (201-300)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#991B1B' }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Hazardous (300+)</span>
        </div>
      </div>
    </div>
  );
};

export default AQILegend; 