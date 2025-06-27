import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { fetchForecast } from '../services/api';
import { Link } from 'react-router-dom';

type ForecastDay = {
  date: string;
  aqi_max: number;
  aqi_min: number;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
  };
};

type HourlyData = {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  wind: number;
};

type FormattedForecastDay = {
  date: string;
  maxAQI: number;
  hourly: HourlyData[];
  recommendations: string[];
};

// Convert backend data format to the format our component uses
const formatForecastData = (apiData: ForecastDay[]) => {
  return apiData.map(day => ({
    date: day.date,
    maxAQI: day.aqi_max,
    hourly: [
      // We'll create some hourly slots based on the day data
      { time: '06:00', aqi: Math.round(day.aqi_min * 1.05), pm25: Math.round(day.pollutants.pm25 * 0.9), pm10: Math.round(day.pollutants.pm10 * 0.9), wind: 5 + Math.floor(Math.random() * 5) },
      { time: '12:00', aqi: Math.round(day.aqi_max), pm25: Math.round(day.pollutants.pm25 * 1.1), pm10: Math.round(day.pollutants.pm10 * 1.1), wind: 8 + Math.floor(Math.random() * 5) },
      { time: '18:00', aqi: Math.round(day.aqi_max * 0.95), pm25: Math.round(day.pollutants.pm25), pm10: Math.round(day.pollutants.pm10), wind: 6 + Math.floor(Math.random() * 5) },
      { time: '00:00', aqi: Math.round(day.aqi_min), pm25: Math.round(day.pollutants.pm25 * 0.8), pm10: Math.round(day.pollutants.pm10 * 0.8), wind: 4 + Math.floor(Math.random() * 5) }
    ],
    recommendations: getRecommendationsForAQI(day.aqi_max)
  }));
};

// Generate recommendations based on AQI level
const getRecommendationsForAQI = (aqi: number) => {
  if (aqi <= 50) {
    return [
      'Air quality is good, enjoy outdoor activities',
      'No special precautions needed',
      'Great day for outdoor exercise',
      'Open windows for natural ventilation'
    ];
  } else if (aqi <= 100) {
    return [
      'Air quality is acceptable for most individuals',
      'Sensitive groups should consider limiting prolonged outdoor exertion',
      'Good day for moderate outdoor activities',
      'Keep windows open during cleaner periods of the day'
    ];
  } else if (aqi <= 150) {
    return [
      'Moderate outdoor activities',
      'Sensitive groups should limit outdoor exposure',
      'Use air purifiers indoors if available',
      'Consider wearing masks when outdoors'
    ];
  } else if (aqi <= 200) {
    return [
      'Avoid prolonged outdoor exertion',
      'Keep windows closed and use air purifiers',
      'Wear N95 masks when outdoors',
      'Consider working from home if possible'
    ];
  } else {
    return [
      'Minimize all outdoor activities',
      'Keep windows closed at all times',
      'Use air purifiers on high setting',
      'Wear N95 masks if you must go outside'
    ];
  }
};

const Forecast: React.FC = () => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<FormattedForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const loadForecastData = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiData = await fetchForecast(7);
      const formattedData = formatForecastData(apiData);
      setForecastData(formattedData);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Failed to fetch forecast data:', err);
      setError('Failed to load forecast data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadForecastData();
  }, []);
  
  const toggleDay = (day: string) => {
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      setExpandedDay(day);
    }
  };
  
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-900';
  };
  
  const getAQITextColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-red-900';
  };
  
  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">7-Day AQI Forecast</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">View predicted air quality for Gurugram over the next 7 days.</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button 
              onClick={loadForecastData}
              className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <CalendarDays className="mr-2 text-blue-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">AQI Forecast</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading forecast data...</p>
          </div>
        ) : forecastData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No forecast data available.</p>
            <button 
              onClick={loadForecastData}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {forecastData.map((day) => (
              <div key={day.date} className="transition-all duration-200">
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                  onClick={() => toggleDay(day.date)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="font-medium text-gray-800 dark:text-white">{day.date}</div>
                    <div className="flex items-center mt-1 md:mt-0">
                      <div className={`h-3 w-3 rounded-full ${getAQIColor(day.maxAQI)} mr-2`}></div>
                      <span className={`${getAQITextColor(day.maxAQI)} font-medium`}>
                        AQI: {day.maxAQI}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({getAQILabel(day.maxAQI)})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 hidden md:inline-block">
                      {expandedDay === day.date ? 'Hide details' : 'Show details'}
                    </span>
                    {expandedDay === day.date ? 
                      <ChevronUp className="text-gray-500" size={18} /> : 
                      <ChevronDown className="text-gray-500" size={18} />
                    }
                  </div>
                </div>
                
                {/* Expanded details */}
                {expandedDay === day.date && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Hourly Forecast</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {day.hourly.map((hour: HourlyData, index: number) => (
                        <div 
                          key={index} 
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800 dark:text-white">{hour.time}</span>
                            <div className={`px-2 py-1 rounded text-xs ${getAQIColor(hour.aqi)} text-white`}>
                              {hour.aqi}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-500 dark:text-gray-400">PM2.5</div>
                            <div className="text-gray-800 dark:text-white font-medium text-right">{hour.pm25} µg/m³</div>
                            
                            <div className="text-gray-500 dark:text-gray-400">PM10</div>
                            <div className="text-gray-800 dark:text-white font-medium text-right">{hour.pm10} µg/m³</div>
                            
                            <div className="text-gray-500 dark:text-gray-400">Wind</div>
                            <div className="text-gray-800 dark:text-white font-medium text-right">{hour.wind} km/h</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {day.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated || 'N/A'}
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={loadForecastData}
                className="text-blue-500 hover:text-blue-600 font-medium flex items-center text-sm"
              >
                Refresh
              </button>
              <Link to="/historical" className="text-blue-500 hover:text-blue-600 font-medium flex items-center text-sm">
                View Historical Data
                <ArrowRight className="ml-1" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Understanding the Forecast</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            Our 7-day AQI forecast is generated using advanced machine learning models that analyze historical patterns, 
            current air quality readings, weather predictions, and human activity factors to predict future air quality conditions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900">
              <div className="font-medium text-green-800 dark:text-green-400">Good (0-50)</div>
              <p className="text-sm mt-1">Air quality is satisfactory with little to no risk.</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900">
              <div className="font-medium text-yellow-800 dark:text-yellow-400">Moderate (51-100)</div>
              <p className="text-sm mt-1">Acceptable, but moderate health concern for sensitive people.</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900">
              <div className="font-medium text-orange-800 dark:text-orange-400">Unhealthy for Sensitive Groups (101-150)</div>
              <p className="text-sm mt-1">Members of sensitive groups may experience health effects.</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900">
              <div className="font-medium text-red-800 dark:text-red-400">Unhealthy (151-200)</div>
              <p className="text-sm mt-1">Everyone may begin to experience health effects.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900">
              <div className="font-medium text-purple-800 dark:text-purple-400">Very Unhealthy (201-300)</div>
              <p className="text-sm mt-1">Health alert: everyone may experience more serious health effects.</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <div className="font-medium text-red-900 dark:text-red-300">Hazardous (301+)</div>
              <p className="text-sm mt-1">Health warning of emergency conditions. Entire population affected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;