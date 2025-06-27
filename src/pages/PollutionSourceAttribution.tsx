import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Search, RefreshCw, Zap, Filter, Tag, AlertTriangle, BarChart2, CheckCircle } from 'lucide-react';
import AQIMap from '../components/dashboard/AQIMap';

interface PollutionSource {
  id: string;
  name: string;
  type: 'industrial' | 'vehicular' | 'construction' | 'seasonal' | 'other';
  location: string;
  coordinates: [number, number];
  currentAqi: number;
  contributionPercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  interventions: string[];
  status: 'active' | 'mitigated' | 'pending';
}

const PollutionSourceAttribution: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<PollutionSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<PollutionSource | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [implementingAction, setImplementingAction] = useState(false);
  
  // Mock data for pollution sources
  const mockSources: PollutionSource[] = [
    {
      id: '1',
      name: 'Industrial Zone A',
      type: 'industrial',
      location: 'Udyog Vihar Phase 1',
      coordinates: [28.5055, 77.0953],
      currentAqi: 192,
      contributionPercentage: 28,
      trend: 'increasing',
      interventions: [
        'Implement stricter emission standards',
        'Install real-time monitoring systems',
        'Mandate air purification systems'
      ],
      status: 'active'
    },
    {
      id: '2',
      name: 'MG Road Traffic Junction',
      type: 'vehicular',
      location: 'MG Road',
      coordinates: [28.4773, 77.0497],
      currentAqi: 168,
      contributionPercentage: 22,
      trend: 'stable',
      interventions: [
        'Optimize traffic signal timing',
        'Promote public transportation',
        'Implement odd-even vehicle scheme'
      ],
      status: 'active'
    },
    {
      id: '3',
      name: 'Golf Course Extension Construction',
      type: 'construction',
      location: 'Golf Course Extension Road',
      coordinates: [28.4243, 77.0998],
      currentAqi: 204,
      contributionPercentage: 18,
      trend: 'increasing',
      interventions: [
        'Enforce water sprinkling protocols',
        'Install dust barriers',
        'Restrict heavy construction hours'
      ],
      status: 'pending'
    },
    {
      id: '4',
      name: 'Seasonal Crop Burning',
      type: 'seasonal',
      location: 'Outskirts of Gurugram',
      coordinates: [28.5213, 77.0263],
      currentAqi: 235,
      contributionPercentage: 32,
      trend: 'increasing',
      interventions: [
        'Subsidize alternative crop disposal methods',
        'Deploy community awareness teams',
        'Implement early warning system'
      ],
      status: 'active'
    },
    {
      id: '5',
      name: 'Waste Disposal Site',
      type: 'other',
      location: 'Sector 54',
      coordinates: [28.4355, 77.1125],
      currentAqi: 154,
      contributionPercentage: 12,
      trend: 'decreasing',
      interventions: [
        'Improve waste segregation',
        'Implement methane capture systems',
        'Upgrade to modern disposal technologies'
      ],
      status: 'mitigated'
    }
  ];
  
  useEffect(() => {
    // Simulate API call
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        setSources(mockSources);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSourceSelect = (source: PollutionSource) => {
    setSelectedSource(source);
    setImplementingAction(false);
  };
  
  const implementIntervention = () => {
    if (!selectedSource) return;
    
    // Simulate implementing an intervention
    setImplementingAction(true);
    setTimeout(() => {
      setSources(sources.map(source => {
        if (source.id === selectedSource.id) {
          return { ...source, status: 'mitigated', trend: 'decreasing' };
        }
        return source;
      }));
      
      setSelectedSource(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'mitigated',
          trend: 'decreasing'
        };
      });
      
      setImplementingAction(false);
    }, 2000);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'industrial': 
        return <BarChart2 size={16} className="text-gray-600" />;
      case 'vehicular': 
        return <Zap size={16} className="text-blue-500" />;
      case 'construction': 
        return <Tag size={16} className="text-orange-500" />;
      case 'seasonal': 
        return <Clock size={16} className="text-green-500" />;
      case 'other': 
        return <MapPin size={16} className="text-purple-500" />;
      default: 
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': 
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Active Source</span>;
      case 'mitigated': 
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Mitigated</span>;
      case 'pending': 
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">Action Pending</span>;
      default: 
        return null;
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': 
        return <div className="flex items-center text-red-500"><Zap size={14} className="mr-1" /> Increasing</div>;
      case 'decreasing': 
        return <div className="flex items-center text-green-500"><Zap size={14} className="mr-1 transform rotate-180" /> Decreasing</div>;
      case 'stable': 
        return <div className="flex items-center text-gray-500"><span className="mr-1">—</span> Stable</div>;
      default: 
        return null;
    }
  };
  
  const filteredSources = activeFilter === 'all' 
    ? sources 
    : sources.filter(source => source.type === activeFilter);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Pollution Source Attribution
          </h1>
          <button 
            onClick={() => {
              setSources(mockSources);
              setLastUpdated(new Date().toLocaleString());
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors flex items-center"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Sources'}
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          AI-powered analysis of pollution sources and recommended interventions
        </p>
        <div className="flex justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 flex items-center">
            <Clock size={16} className="mr-1" />
            Last updated: {lastUpdated || 'Never'}
          </p>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
      
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
            activeFilter === 'all' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter size={14} className="mr-1.5" />
          All Sources
        </button>
        <button
          onClick={() => setActiveFilter('industrial')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
            activeFilter === 'industrial' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <BarChart2 size={14} className="mr-1.5" />
          Industrial
        </button>
        <button
          onClick={() => setActiveFilter('vehicular')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
            activeFilter === 'vehicular' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Zap size={14} className="mr-1.5" />
          Vehicular
        </button>
        <button
          onClick={() => setActiveFilter('construction')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
            activeFilter === 'construction' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Tag size={14} className="mr-1.5" />
          Construction
        </button>
        <button
          onClick={() => setActiveFilter('seasonal')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
            activeFilter === 'seasonal' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Clock size={14} className="mr-1.5" />
          Seasonal
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Pollution Source Map</h2>
          <div className="h-[500px]">
            <AQIMap loading={loading} />
          </div>
        </div>
        
        {/* Source List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Pollution Sources</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Contributing to current air quality</p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Analyzing pollution sources...</p>
              </div>
            ) : filteredSources.length > 0 ? (
              filteredSources.map((source) => (
                <div 
                  key={source.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 cursor-pointer ${selectedSource?.id === source.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleSourceSelect(source)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                        {getTypeIcon(source.type)}
                        <span className="ml-2">{source.name}</span>
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                          {source.location}
                        </span>
                        {getStatusBadge(source.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">AQI: </span>
                        <span className="font-bold text-red-500">
                          {source.currentAqi}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {source.contributionPercentage}% contribution
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No pollution sources found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Selected Source Details */}
      {selectedSource && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{selectedSource.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedSource.location}</p>
            </div>
            <div className="flex items-center">
              {getStatusBadge(selectedSource.status)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Source Type</h3>
                  <p className="mt-1 text-lg font-medium text-gray-800 dark:text-white flex items-center">
                    {getTypeIcon(selectedSource.type)}
                    <span className="ml-2">
                      {selectedSource.type.charAt(0).toUpperCase() + selectedSource.type.slice(1)}
                    </span>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current AQI</h3>
                  <p className="mt-1 text-lg font-medium text-red-500">{selectedSource.currentAqi}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contribution to Pollution</h3>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{ width: `${selectedSource.contributionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm mt-1 text-gray-500 dark:text-gray-400">{selectedSource.contributionPercentage}%</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trend</h3>
                  <p className="mt-1 font-medium">
                    {getTrendIcon(selectedSource.trend)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recommended Interventions</h3>
                <div className="mt-2 space-y-2">
                  {selectedSource.interventions.map((intervention, index) => (
                    <div key={index} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-800 dark:text-blue-300">{intervention}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Take Action</h3>
                <button 
                  onClick={implementIntervention} 
                  disabled={implementingAction || selectedSource.status === 'mitigated'}
                  className={`w-full px-4 py-3 rounded-md flex items-center justify-center
                    ${implementingAction 
                      ? 'bg-blue-300 cursor-not-allowed' 
                      : selectedSource.status === 'mitigated'
                        ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  {implementingAction ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" /> 
                      Implementing...
                    </>
                  ) : selectedSource.status === 'mitigated' ? (
                    <>
                      <CheckCircle size={16} className="mr-2" /> 
                      Interventions Implemented
                    </>
                  ) : (
                    <>
                      <Zap size={16} className="mr-2" /> 
                      Implement Interventions
                    </>
                  )}
                </button>
                
                {selectedSource.status === 'mitigated' && (
                  <p className="text-center text-sm mt-2 text-green-600 dark:text-green-400">
                    Interventions have been successfully implemented.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollutionSourceAttribution; 