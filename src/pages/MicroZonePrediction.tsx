import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Send, RefreshCw, AlertTriangle } from 'lucide-react';
import AQIMap from '../components/dashboard/AQIMap';

interface PredictionZone {
  id: string;
  location: string;
  coordinates: [number, number];
  currentAqi: number;
  predictedAqi: number;
  timeWindow: string;
  confidence: number;
  impactRadius: number;
  recommendation: string;
}

const MicroZonePrediction: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<PredictionZone | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [notificationSent, setNotificationSent] = useState<boolean>(false);
  
  // Mock data for predictions
  const mockPredictions: PredictionZone[] = [
    {
      id: '1',
      location: 'Sector 29',
      coordinates: [28.4698, 77.0622],
      currentAqi: 145,
      predictedAqi: 210,
      timeWindow: '14:00-18:00',
      confidence: 89,
      impactRadius: 800,
      recommendation: 'Avoid outdoor activities in this area between 2PM and 6PM today.'
    },
    {
      id: '2',
      location: 'Udyog Vihar',
      coordinates: [28.5015, 77.0854],
      currentAqi: 158,
      predictedAqi: 195,
      timeWindow: '16:00-20:00',
      confidence: 92,
      impactRadius: 1200,
      recommendation: 'Plan commute before 4PM or after 8PM to avoid high pollution exposure.'
    },
    {
      id: '3',
      location: 'Golf Course Road',
      coordinates: [28.4321, 77.1025],
      currentAqi: 132,
      predictedAqi: 188,
      timeWindow: '12:00-16:00',
      confidence: 85,
      impactRadius: 600,
      recommendation: 'Consider working from home during this period if possible.'
    }
  ];
  
  useEffect(() => {
    // Simulate API call
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        setPredictions(mockPredictions);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleZoneSelect = (zone: PredictionZone) => {
    setSelectedZone(zone);
    setNotificationSent(false);
  };
  
  const sendNotifications = () => {
    if (!selectedZone) return;
    
    // Simulate sending notifications
    setLoading(true);
    setTimeout(() => {
      setNotificationSent(true);
      setLoading(false);
    }, 1000);
  };
  
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-red-900';
  };
  
  const getAqiBackgroundColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-100 dark:bg-green-900/20';
    if (aqi <= 100) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (aqi <= 150) return 'bg-orange-100 dark:bg-orange-900/20';
    if (aqi <= 200) return 'bg-red-100 dark:bg-red-900/20';
    if (aqi <= 300) return 'bg-purple-100 dark:bg-purple-900/20';
    return 'bg-red-200 dark:bg-red-950/30';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Micro-Zone Prediction System
          </h1>
          <button 
            onClick={() => {
              setPredictions(mockPredictions);
              setLastUpdated(new Date().toLocaleString());
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors flex items-center"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Predictions'}
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Hyperlocal 4-hour pollution predictions for 100×100 meter zones in Gurugram
        </p>
        <div className="flex justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 flex items-center">
            <Clock size={16} className="mr-1" />
            Last updated: {lastUpdated || 'Never'}
          </p>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Predicted High Pollution Zones</h2>
          <div className="h-[500px]">
            <AQIMap loading={loading} />
          </div>
        </div>
        
        {/* Prediction List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">4-Hour Predictions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a zone to view details and take action</p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading predictions...</p>
              </div>
            ) : predictions.length > 0 ? (
              predictions.map((zone) => (
                <div 
                  key={zone.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 cursor-pointer ${selectedZone?.id === zone.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleZoneSelect(zone)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                        <MapPin size={16} className="mr-1" /> {zone.location}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                          Time: {zone.timeWindow}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {zone.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">AQI: </span>
                        <span className={`font-bold ${getAqiColor(zone.predictedAqi)}`}>
                          {zone.predictedAqi}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Current: {zone.currentAqi}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No pollution predictions for the next 4 hours.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Selected Zone Details */}
      {selectedZone && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Prediction Details: {selectedZone.location}</h2>
            <div 
              className={`px-3 py-1 rounded-full text-sm font-medium ${getAqiBackgroundColor(selectedZone.predictedAqi)}`}
            >
              Predicted AQI: {selectedZone.predictedAqi}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Window</h3>
                  <p className="mt-1 text-lg font-medium text-gray-800 dark:text-white">{selectedZone.timeWindow} Today</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">AQI Change</h3>
                  <div className="mt-1 flex items-center">
                    <span className="text-lg font-medium text-gray-800 dark:text-white">{selectedZone.currentAqi}</span>
                    <span className="mx-2 text-gray-500 dark:text-gray-400">→</span>
                    <span className={`text-lg font-medium ${getAqiColor(selectedZone.predictedAqi)}`}>
                      {selectedZone.predictedAqi}
                    </span>
                    <span className="ml-2 text-red-500">
                      (+{selectedZone.predictedAqi - selectedZone.currentAqi})
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Impact Radius</h3>
                  <p className="mt-1 text-lg font-medium text-gray-800 dark:text-white">{selectedZone.impactRadius}m</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Model Confidence</h3>
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${selectedZone.confidence}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm mt-1 text-gray-500 dark:text-gray-400">{selectedZone.confidence}%</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recommended Action</h3>
                <div className="mt-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <p className="text-amber-800 dark:text-amber-300">{selectedZone.recommendation}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notify Citizens in Zone</h3>
                <button 
                  onClick={sendNotifications} 
                  disabled={notificationSent || loading}
                  className={`w-full px-4 py-3 rounded-md flex items-center justify-center ${
                    notificationSent 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {notificationSent ? (
                    <>
                      <span className="mr-2">✓</span> Notifications Sent
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" /> 
                      Send SMS/App Alerts to Affected Areas
                    </>
                  )}
                </button>
                {notificationSent && (
                  <p className="text-center text-sm mt-2 text-green-600 dark:text-green-400">
                    Approximately 842 citizens in this zone have been notified.
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

export default MicroZonePrediction; 