import React from 'react';
import { Shield, Users, Heart, AlertTriangle } from 'lucide-react';

interface HealthRecommendationsProps {
  aqi: number;
  loading: boolean;
}

const HealthRecommendations: React.FC<HealthRecommendationsProps> = ({ aqi, loading }) => {
  const getRecommendations = (aqi: number) => {
    if (aqi <= 50) {
      return {
        icon: Shield,
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        title: 'Good air quality',
        recommendations: [
          'Enjoy outdoor activities',
          'Perfect for outdoor exercise',
          'No restrictions needed'
        ]
      };
    } else if (aqi <= 100) {
      return {
        icon: Users,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        title: 'Moderate air quality',
        recommendations: [
          'Sensitive individuals should consider limiting prolonged outdoor exertion',
          'Keep windows closed during peak traffic hours',
          'Stay hydrated when outdoors'
        ]
      };
    } else if (aqi <= 150) {
      return {
        icon: Heart,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        title: 'Unhealthy for sensitive groups',
        recommendations: [
          'People with respiratory or heart disease should limit outdoor exertion',
          'Children and elderly should minimize outdoor activity',
          'Consider wearing masks outdoors if you have respiratory issues'
        ]
      };
    } else {
      return {
        icon: AlertTriangle,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        title: 'Unhealthy air quality',
        recommendations: [
          'Avoid prolonged outdoor activities',
          'Keep windows closed and use air purifiers',
          'Wear N95 masks when outdoors',
          'Consider working from home if possible'
        ]
      };
    }
  };
  
  const { icon: Icon, color, bgColor, title, recommendations } = getRecommendations(aqi);
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className={`flex items-center ${bgColor} p-3 rounded-lg`}>
        <Icon className={`${color} mr-2`} size={20} />
        <h3 className={`font-medium ${color}`}>{title}</h3>
      </div>
      
      <ul className="space-y-2">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="flex items-start">
            <span className="text-gray-400 dark:text-gray-500 mr-2">•</span>
            <span className="text-gray-700 dark:text-gray-300 text-sm">{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthRecommendations;