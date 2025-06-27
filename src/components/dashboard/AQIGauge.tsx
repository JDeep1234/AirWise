import React from 'react';

interface AQIGaugeProps {
  value: number;
  loading: boolean;
}

const AQIGauge: React.FC<AQIGaugeProps> = ({ value, loading }) => {
  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'bg-green-500', text: 'text-green-500' };
    if (aqi <= 100) return { label: 'Moderate', color: 'bg-yellow-500', text: 'text-yellow-500' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', text: 'text-orange-500' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-red-500', text: 'text-red-500' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'bg-purple-500', text: 'text-purple-500' };
    return { label: 'Hazardous', color: 'bg-red-900', text: 'text-red-900' };
  };
  
  const aqiInfo = getAQILevel(value);
  const gaugePercent = Math.min(value / 500 * 100, 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-full animate-pulse">
        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Current AQI</h2>
      
      <div className="relative w-36 h-36 mb-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#e5e7eb" 
            strokeWidth="10" 
            className="dark:stroke-gray-700"
          />
          
          {/* AQI Value circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke={aqiInfo.color.replace('bg-', 'text-')} 
            strokeWidth="10" 
            strokeDasharray={`${gaugePercent * 2.83} 283`} 
            strokeLinecap="round" 
            transform="rotate(-90 50 50)" 
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* AQI Value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-800 dark:text-white">
            {parseInt(Math.round(value).toString())}
          </span>
        </div>
      </div>
      
      <div className={`text-sm font-medium px-3 py-1 rounded-full ${aqiInfo.color} text-white`}>
        {aqiInfo.label}
      </div>
    </div>
  );
};

export default AQIGauge;