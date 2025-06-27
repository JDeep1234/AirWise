import React, { useEffect, useState } from 'react';
import { fetchHourlyTrend } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HourlyData {
  timestamp: string;
  hour: string;
  aqi: number;
  pm25: number;
}

interface TrendChartProps {
  loading: boolean;
  data?: HourlyData[];
}

const TrendChart: React.FC<TrendChartProps> = ({ loading: initialLoading, data: initialData }) => {
  const [data, setData] = useState<HourlyData[]>(initialData || []);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'bar' | 'line'>('bar');
  
  useEffect(() => {
    const getTrendData = async () => {
      try {
        setLoading(true);
        const hourlyData = await fetchHourlyTrend();
        setData(hourlyData);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch hourly trend data:', error);
        setError('Failed to load hourly trend data');
        // If we have initial data, use it as fallback
        if (initialData && initialData.length > 0) {
          setData(initialData);
        } else {
          // Generate mock data as fallback
          const mockData = [];
          const now = new Date();
          for (let i = 0; i < 24; i++) {
            const hour = new Date(now);
            hour.setHours(hour.getHours() - (23 - i));
            mockData.push({
              timestamp: hour.toISOString(),
              hour: hour.getHours().toString().padStart(2, '0'),
              aqi: 150 + Math.floor(Math.random() * 50),
              pm25: 75 + Math.floor(Math.random() * 25)
            });
          }
          setData(mockData);
        }
      } finally {
        setLoading(false);
      }
    };
    
    getTrendData();
  }, [initialData]);
  
  // Prepare and format data for the chart
  const chartData = data.map(item => ({
    hour: item.hour,
    timestamp: item.timestamp,
    aqi: Math.round(item.aqi),
    pm25: Math.round(item.pm25),
    fill: getBarColor(item.aqi, false)
  }));
  
  // Utility function to get colors based on AQI value
  function getBarColor(aqi: number, forBar: boolean = true) {
    if (aqi <= 50) return forBar ? 'bg-green-500' : '#10B981'; // green-500
    if (aqi <= 100) return forBar ? 'bg-yellow-500' : '#F59E0B'; // yellow-500
    if (aqi <= 150) return forBar ? 'bg-orange-500' : '#F97316'; // orange-500
    if (aqi <= 200) return forBar ? 'bg-red-500' : '#EF4444'; // red-500
    if (aqi <= 300) return forBar ? 'bg-purple-500' : '#8B5CF6'; // purple-500
    return forBar ? 'bg-red-900' : '#7F1D1D'; // red-900
  }
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const aqi = data.aqi;
      const aqiColor = getBarColor(aqi, false);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 font-medium">{`${label}:00`}</p>
          <p className="font-medium" style={{ color: aqiColor }}>{`AQI: ${aqi}`}</p>
          <p className="text-gray-600 dark:text-gray-300">{`PM2.5: ${data.pm25} µg/m³`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Get AQI category label
  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    );
  }
  
  // Calculate mean AQI for summary
  const currentAQI = data.length > 0 ? data[data.length - 1].aqi : 0;
  const averageAQI = data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.aqi, 0) / data.length) : 0;
  const maxAQI = data.length > 0 ? Math.max(...data.map(item => item.aqi)) : 0;
  const aqiTrend = data.length > 1 ? (data[data.length - 1].aqi - data[0].aqi) : 0;
  
  return (
    <div className="h-64 relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
          {error}
          <button 
            className="ml-3 bg-red-200 px-2 py-1 rounded text-xs"
            onClick={() => setData(initialData || [])}
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="absolute top-0 right-0 z-10 flex items-center space-x-2">
        <button 
          className={`px-2 py-1 text-xs rounded-md ${displayMode === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          onClick={() => setDisplayMode('bar')}
        >
          Bar
        </button>
        <button 
          className={`px-2 py-1 text-xs rounded-md ${displayMode === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          onClick={() => setDisplayMode('line')}
        >
          Line
        </button>
      </div>
      
      {/* 24-hour summary */}
      <div className="absolute bottom-0 left-1 right-1 z-10 bg-gray-50 dark:bg-gray-750 rounded-t-lg border border-gray-200 dark:border-gray-700 p-2 flex justify-between text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Current: </span>
          <span className="font-medium" style={{ color: getBarColor(currentAQI, false) }}>{currentAQI}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Avg: </span>
          <span className="font-medium" style={{ color: getBarColor(averageAQI, false) }}>{averageAQI}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Max: </span>
          <span className="font-medium" style={{ color: getBarColor(maxAQI, false) }}>{maxAQI}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Trend: </span>
          <span className={aqiTrend > 0 ? 'text-red-500' : aqiTrend < 0 ? 'text-green-500' : 'text-gray-500'}>
            {aqiTrend > 0 ? '↑' : aqiTrend < 0 ? '↓' : '→'} {Math.abs(aqiTrend)}
          </span>
        </div>
      </div>
      
      {/* Chart container */}
      <div className="h-[calc(100%-28px)]">
        <ResponsiveContainer width="100%" height="100%">
          {displayMode === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.1} />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280" 
                tick={{ fill: '#6b7280', fontSize: 10 }} 
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fill: '#6b7280', fontSize: 10 }} 
                domain={[0, 'dataMax + 50']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="aqi" 
                name="AQI" 
                radius={[4, 4, 0, 0]}
                minPointSize={3}
              >
                {
                  chartData.map((entry, index) => (
                    <rect
                      key={`bar-${index}`}
                      fill={entry.fill}
                    />
                  ))
                }
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 35 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.1} />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280" 
                tick={{ fill: '#6b7280', fontSize: 10 }} 
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fill: '#6b7280', fontSize: 10 }} 
                domain={[0, 'dataMax + 50']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="aqi" 
                name="AQI" 
                stroke="#EF4444" 
                strokeWidth={2} 
                dot={{ stroke: '#EF4444', fill: '#EF4444', r: 3 }}
                activeDot={{ stroke: '#EF4444', fill: '#EF4444', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="pm25" 
                name="PM2.5" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                dot={{ stroke: '#8B5CF6', fill: '#8B5CF6', r: 3 }}
                activeDot={{ stroke: '#8B5CF6', fill: '#8B5CF6', r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;