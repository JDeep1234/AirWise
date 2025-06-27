import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchHistorical } from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// Define types for our data
type PollutantData = {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
};

type HistoricalDay = {
  date: string;
  aqi: number;
  pollutants: PollutantData;
};

const Historical: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('30days');
  const [dataType, setDataType] = useState<string>('aqi');
  const [historicalData, setHistoricalData] = useState<HistoricalDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  const getChartColor = (value: number) => {
    if (value <= 50) return '#10B981'; // green-500
    if (value <= 100) return '#F59E0B'; // yellow-500
    if (value <= 150) return '#F97316'; // orange-500
    if (value <= 200) return '#EF4444'; // red-500
    if (value <= 300) return '#8B5CF6'; // purple-500
    return '#7F1D1D'; // red-900
  };
  
  const loadHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Extract days number from timeRange
      const days = parseInt(timeRange.replace('days', '').replace('year', '365'));
      const data = await fetchHistorical(days);
      setHistoricalData(data);
      setLastUpdated(new Date().toLocaleString());
      // Reset to first page when data changes
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to load historical data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadHistoricalData();
  }, [timeRange]); // Reload when time range changes
  
  const handleExportData = () => {
    try {
      // Convert data to CSV
      const headers = ['Date', 'AQI', 'PM2.5', 'PM10', 'O3', 'NO2'];
      const csvRows = [headers];
      
      historicalData.forEach(day => {
        const row = [
          day.date,
          day.aqi.toString(),
          day.pollutants.pm25.toString(),
          day.pollutants.pm10.toString(),
          day.pollutants.o3.toString(),
          day.pollutants.no2.toString()
        ];
        csvRows.push(row);
      });
      
      // Create CSV content
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `gurugram_air_quality_${timeRange}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };
  
  // Get data for chart based on selected dataType
  const getChartData = () => {
    return historicalData.map(day => {
      // Create an object with date and the selected data type
      const chartPoint: any = { date: day.date };
      
      // Set value based on selected data type
      if (dataType === 'aqi') {
        chartPoint.value = day.aqi;
        chartPoint.color = getChartColor(day.aqi);
      } else {
        // Handle pollutant data types
        chartPoint.value = day.pollutants[dataType as keyof PollutantData];
      }
      
      return chartPoint;
    });
  };
  
  // Calculate statistics
  const calculateStats = () => {
    if (historicalData.length === 0) return { max: 0, min: 0, avg: 0, unhealthyDays: 0 };
    
    let max = 0;
    let min = Number.MAX_VALUE;
    let sum = 0;
    let unhealthyDays = 0;
    
    historicalData.forEach(day => {
      const value = dataType === 'aqi' 
        ? day.aqi 
        : day.pollutants[dataType as keyof PollutantData];
      
      max = Math.max(max, value);
      min = Math.min(min, value);
      sum += value;
      
      if (dataType === 'aqi' && day.aqi > 100) {
        unhealthyDays++;
      }
    });
    
    return {
      max,
      min,
      avg: Math.round(sum / historicalData.length),
      unhealthyDays
    };
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historicalData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historicalData.length / itemsPerPage);
  
  // Chart rendering
  const renderChart = () => {
    const chartData = getChartData();
    const stats = calculateStats();
    
    if (loading) {
      return (
        <div className="h-80 w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading data...</p>
          </div>
        </div>
      );
    }
    
    if (error || chartData.length === 0) {
      return (
        <div className="h-80 w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-gray-500 dark:text-gray-400">
              {error || "No data available for the selected time period."}
            </p>
            <button 
              onClick={loadHistoricalData}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    
    const getStrokeColor = () => {
      if (dataType === 'aqi') return "#ef4444"; // red-500
      if (dataType === 'pm25') return "#8b5cf6"; // purple-500
      if (dataType === 'pm10') return "#f97316"; // orange-500
      if (dataType === 'o3') return "#3b82f6"; // blue-500
      return "#10b981"; // green-500 (default)
    };
    
    return (
      <div className="h-80 w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              tick={{ fill: '#6b7280' }} 
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fill: '#6b7280' }} 
              tickLine={{ stroke: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                borderColor: '#374151',
                color: '#f9fafb'
              }}
              itemStyle={{ color: '#f9fafb' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              name={dataType.toUpperCase()} 
              stroke={getStrokeColor()} 
              fill={getStrokeColor()} 
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Historical Air Quality Data</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">View and analyze past air quality trends for Gurugram.</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20} />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Historical Data</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last 12 months</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter size={16} className="text-gray-500" />
              </div>
            </div>
            
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                <option value="aqi">AQI</option>
                <option value="pm25">PM2.5</option>
                <option value="pm10">PM10</option>
                <option value="o3">Ozone (O₃)</option>
                <option value="no2">Nitrogen Dioxide (NO₂)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter size={16} className="text-gray-500" />
              </div>
            </div>
            
            <button 
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors"
              onClick={handleExportData}
              disabled={loading || historicalData.length === 0}
            >
              <Download size={16} className="mr-1" />
              Export Data
            </button>
          </div>
        </div>
        
        {renderChart()}
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Data Highlights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Highest {dataType.toUpperCase()}</div>
              <div className="text-2xl font-bold text-red-500 mt-1">{calculateStats().max}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {historicalData.length > 0 
                  ? `From ${historicalData[0].date} to ${historicalData[historicalData.length - 1].date}`
                  : 'No data available'}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Lowest {dataType.toUpperCase()}</div>
              <div className="text-2xl font-bold text-green-500 mt-1">{calculateStats().min}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {historicalData.length > 0 
                  ? `From ${historicalData[0].date} to ${historicalData[historicalData.length - 1].date}`
                  : 'No data available'}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Average {dataType.toUpperCase()}</div>
              <div className="text-2xl font-bold text-orange-500 mt-1">{calculateStats().avg}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {timeRange === '30days' ? 'Last 30 days' : 
                 timeRange === '7days' ? 'Last 7 days' : 
                 timeRange === '90days' ? 'Last 90 days' : 'Last 12 months'}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Unhealthy Days</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{calculateStats().unhealthyDays}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                AQI &gt; 100 in selected period
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Historical Data Records</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  AQI
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  PM2.5
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  PM10
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  O₃
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  NO₂
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                    </div>
                    <span className="block mt-2">Loading data...</span>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No data available
                  </td>
                </tr>
              ) : (
                currentItems.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                      {day.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2" 
                          style={{ backgroundColor: getChartColor(day.aqi) }}
                        ></div>
                        <span className="text-sm text-gray-800 dark:text-white">{day.aqi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white">
                      {day.pollutants.pm25} µg/m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white">
                      {day.pollutants.pm10} µg/m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white">
                      {day.pollutants.o3} µg/m³
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white">
                      {day.pollutants.no2} µg/m³
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="py-3 px-6 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {historicalData.length > 0 ? (
              `Showing ${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, historicalData.length)} of ${historicalData.length} records`
            ) : (
              'No records to display'
            )}
          </div>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading || historicalData.length === 0}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {`${currentPage} / ${totalPages || 1}`}
            </span>
            <button 
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading || historicalData.length === 0}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historical;