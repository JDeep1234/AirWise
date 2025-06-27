import React from 'react';
import { Thermometer, Droplets, Wind } from 'lucide-react';

interface WeatherWidgetProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  loading: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  temperature, 
  humidity, 
  windSpeed,
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex flex-col space-y-6 animate-pulse">
        <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Weather Conditions</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Thermometer className="text-red-500 mr-2" size={20} />
            <span className="text-gray-600 dark:text-gray-300">Temperature</span>
          </div>
          <span className="text-gray-800 dark:text-white font-medium">{temperature}°C</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Droplets className="text-blue-500 mr-2" size={20} />
            <span className="text-gray-600 dark:text-gray-300">Humidity</span>
          </div>
          <span className="text-gray-800 dark:text-white font-medium">{humidity}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wind className="text-cyan-500 mr-2" size={20} />
            <span className="text-gray-600 dark:text-gray-300">Wind Speed</span>
          </div>
          <span className="text-gray-800 dark:text-white font-medium">{windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;