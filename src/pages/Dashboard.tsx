import React, { useState, useEffect } from 'react';
import { Wind, Droplets, Thermometer, Clock, RefreshCw, MapPin, Activity, Search, Heart, Bell } from 'lucide-react';
import AQIGauge from '../components/dashboard/AQIGauge';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import PollutantLevels from '../components/dashboard/PollutantLevels';
import AQIMap from '../components/dashboard/AQIMap';
import HealthRecommendations from '../components/dashboard/HealthRecommendations';
import RecentUpdates from '../components/dashboard/RecentUpdates';
import TrendChart from '../components/dashboard/TrendChart';
import AQILegend from '../components/dashboard/AQILegend';
import { fetchCurrentAirQuality, fetchRecommendations, fetchHourlyTrend, fetchAlerts } from '../services/api';
import { Link } from 'react-router-dom';

// Define types to match the expected props in components
type PollutantLevel = 'high' | 'moderate' | 'low' | 'very-high' | 'hazardous';
type UpdateType = 'warning' | 'info' | 'success';

interface Pollutant {
  name: string;
  value: number;
  unit: string;
  level: PollutantLevel;
}

interface Update {
  id: string;
  type: UpdateType;
  message: string;
  time: string;
}

interface Alert {
  id: string;
  level: string;
  title: string;
  message: string;
  timestamp: string;
  location?: string;
}

interface AirQualityData {
  aqi: number;
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
  };
  pollutants: Pollutant[];
  updates: Update[];
}

interface HourlyData {
  timestamp: string;
  hour: string;
  aqi: number;
  pm25: number;
}

const Dashboard: React.FC = () => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [hourlyTrendData, setHourlyTrendData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all needed data in parallel
      const [currentData, hourlyData, alertsData] = await Promise.all([
        fetchCurrentAirQuality(),
        fetchHourlyTrend(),
        fetchAlerts()
      ]);
      
      if (!currentData) {
        throw new Error("No data received from the API");
      }
      
      // Convert alerts to updates format
      const updates: Update[] = alertsData.map((alert: Alert) => ({
        id: alert.id,
        type: getUpdateTypeFromAlertLevel(alert.level),
        message: alert.message,
        time: new Date(alert.timestamp).toLocaleString()
      }));
      
      // Prepare data to match the expected format
      const formattedData: AirQualityData = {
        aqi: Math.round(currentData.aqi || 0),
        weather: {
          temperature: Math.round(currentData.weather?.temperature || 0),
          humidity: Math.round(currentData.weather?.humidity || 0),
          windSpeed: Math.round(currentData.weather?.wind_speed || 0)
        },
        pollutants: [
          { name: 'PM2.5', value: Math.round(currentData.pollutants?.pm25 || 0), unit: 'µg/m³', level: getLevelLabel(currentData.pollutants?.pm25 || 0, 'pm25') as PollutantLevel },
          { name: 'PM10', value: Math.round(currentData.pollutants?.pm10 || 0), unit: 'µg/m³', level: getLevelLabel(currentData.pollutants?.pm10 || 0, 'pm10') as PollutantLevel },
          { name: 'O₃', value: Math.round(currentData.pollutants?.o3 || 0), unit: 'µg/m³', level: getLevelLabel(currentData.pollutants?.o3 || 0, 'o3') as PollutantLevel },
          { name: 'NO₂', value: Math.round(currentData.pollutants?.no2 || 0), unit: 'µg/m³', level: getLevelLabel(currentData.pollutants?.no2 || 0, 'no2') as PollutantLevel },
          { name: 'SO₂', value: Math.round(currentData.pollutants?.so2 || 0), unit: 'µg/m³', level: getLevelLabel(currentData.pollutants?.so2 || 0, 'so2') as PollutantLevel },
          { name: 'CO', value: Number((currentData.pollutants?.co || 0).toFixed(1)), unit: 'mg/m³', level: getLevelLabel(currentData.pollutants?.co || 0, 'co') as PollutantLevel }
        ],
        updates: updates
      };
      
      // Format the hourly trend data to ensure integer AQI values
      const formattedHourlyData = hourlyData.map((item: HourlyData) => ({
        ...item,
        aqi: Math.round(item.aqi),
        pm25: Math.round(item.pm25)
      }));
      
      setAirQualityData(formattedData);
      setHourlyTrendData(formattedHourlyData);
      setLastUpdated(new Date().toLocaleString());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load air quality data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Convert alert level to update type
  const getUpdateTypeFromAlertLevel = (level: string): UpdateType => {
    switch (level) {
      case 'severe':
      case 'high':
        return 'warning';
      case 'moderate':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up automatic refresh every 15 minutes
    const intervalId = setInterval(() => {
      fetchData();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Helper function to determine pollution level labels
  const getLevelLabel = (value: number, pollutant: string): string => {
    // Simple thresholds - these should be refined based on actual standards
    switch (pollutant) {
      case 'pm25':
        return value <= 12 ? 'low' : value <= 35 ? 'moderate' : 'high';
      case 'pm10':
        return value <= 54 ? 'low' : value <= 154 ? 'moderate' : 'high';
      case 'o3':
        return value <= 50 ? 'low' : value <= 100 ? 'moderate' : 'high';
      case 'no2':
        return value <= 53 ? 'low' : value <= 100 ? 'moderate' : 'high';
      case 'so2':
        return value <= 35 ? 'low' : value <= 75 ? 'moderate' : 'high';
      case 'co':
        return value <= 4.4 ? 'low' : value <= 9.4 ? 'moderate' : 'high';
      default:
        return 'moderate';
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchData();
  };
  
  // If data is still loading, show a loading state for the entire dashboard
  if (loading && !airQualityData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // If there's no data even after loading, show an error
  if (!airQualityData) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error || "Failed to load air quality data. Please try refreshing the page."}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-purple-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-blue-500/5 p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Air Quality - Gurugram
            </h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center mt-2">
              <Clock size={16} className="mr-1" />
              Last updated: {lastUpdated}
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors flex items-center justify-center md:self-start"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg border border-gray-100 dark:border-gray-700">
          <AQIGauge value={airQualityData.aqi} loading={loading} />
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg border border-gray-100 dark:border-gray-700">
          <WeatherWidget 
            temperature={airQualityData.weather.temperature}
            humidity={airQualityData.weather.humidity}
            windSpeed={airQualityData.weather.windSpeed}
            loading={loading}
          />
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg md:col-span-2 border border-gray-100 dark:border-gray-700">
          <PollutantLevels pollutants={airQualityData.pollutants} loading={loading} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg lg:col-span-2 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <MapPin size={20} className="mr-2 text-blue-500 dark:text-blue-400" />
            Air Quality Map
          </h2>
          <AQIMap loading={loading} />
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <Heart size={20} className="mr-2 text-blue-500 dark:text-blue-400" />
            Health Recommendations
          </h2>
          <HealthRecommendations aqi={airQualityData.aqi} loading={loading} />
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <AQILegend />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg lg:col-span-2 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <Activity size={20} className="mr-2 text-blue-500 dark:text-blue-400" />
            24-Hour AQI Trend
          </h2>
          <TrendChart loading={loading} data={hourlyTrendData} />
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <Bell size={20} className="mr-2 text-blue-500 dark:text-blue-400" />
            Recent Updates
          </h2>
          <RecentUpdates updates={airQualityData.updates} loading={loading} />
        </div>
      </div>
      
      {/* Pollution Time Machine Features */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-xl p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Pollution Time Machine
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered predictive system for pollution management and intervention
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Micro-Zone Prediction */}
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 group">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Micro-Zone Prediction</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Predicts specific 100×100m zones that will experience pollution spikes in the next 4 hours
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">3 high-risk zones detected</span>
                <Link 
                  to="/micro-zone-prediction" 
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors shadow-sm"
                >
                  View Predictions
                </Link>
              </div>
            </div>
          </div>
          
          {/* Infrastructure Control */}
          <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 group">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Infrastructure Control</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                AI-controlled traffic signals, water sprinklers, and public transit to mitigate pollution
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">2 systems actively mitigating</span>
                <Link 
                  to="/infrastructure-control" 
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-colors shadow-sm"
                >
                  Manage Systems
                </Link>
              </div>
            </div>
          </div>
          
          {/* Source Attribution */}
          <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 group">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                  <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Source Attribution</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Identifies pollution sources and their contributions with recommended interventions
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">5 major sources identified</span>
                <Link 
                  to="/pollution-source-attribution" 
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm transition-colors shadow-sm"
                >
                  View Sources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;