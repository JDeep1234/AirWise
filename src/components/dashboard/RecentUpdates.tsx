import React from 'react';
import { Info, AlertTriangle, Check } from 'lucide-react';

interface Update {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  time: string;
}

interface RecentUpdatesProps {
  updates: Update[];
  loading: boolean;
}

const RecentUpdates: React.FC<RecentUpdatesProps> = ({ updates, loading }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info size={16} className="text-blue-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'success': return <Check size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };
  
  const getUpdateClass = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20';
      case 'warning': return 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20';
      case 'success': return 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {updates.map((update) => (
        <div 
          key={update.id} 
          className={`p-3 border ${getUpdateClass(update.type)} rounded-lg transition-all duration-200`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="mt-0.5 mr-2">
                {getIcon(update.type)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{update.message}</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{update.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentUpdates;