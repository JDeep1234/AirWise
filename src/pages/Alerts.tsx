import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, ShieldAlert, CheckSquare, Sliders, RefreshCw, Info, MapPin } from 'lucide-react';
import { fetchAlerts, fetchGeospatialData, fetchUserPreferences, saveUserPreferences, updateUserPreferences, UserPreferences } from '../services/api';

// Define types
type AlertLevel = 'low' | 'moderate' | 'high' | 'severe';

type Alert = {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
  location?: string;
};

type LocationData = {
  location: string;
  coordinates: [number, number];
  aqi: number;
  pm25: number;
};

// Default user ID (in a real app, this would come from auth)
const DEFAULT_USER_ID = 'user123';

const Alerts: React.FC = () => {
  const [alertLevel, setAlertLevel] = useState('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sensitivityProfile, setSensitivityProfile] = useState('normal');
  const [alertThreshold, setAlertThreshold] = useState('all');
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [extremeConditionsOnly, setExtremeConditionsOnly] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  // Load alerts and geospatial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch alerts data
      const alertsData = await fetchAlerts();
      setAlerts(alertsData);
      
      // Fetch geospatial data for location selection
      const geospatialData = await fetchGeospatialData();
      setLocations(geospatialData);
      
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching alerts data:', err);
      setError('Failed to load alerts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load user preferences from database
  const loadUserPreferences = async () => {
    try {
      const preferences = await fetchUserPreferences(DEFAULT_USER_ID);
      
      // Update state with user preferences
      setNotificationsEnabled(preferences.notificationsEnabled);
      setSelectedLocation(preferences.selectedLocation);
      setSensitivityProfile(preferences.sensitivityProfile);
      setAlertThreshold(preferences.alertThreshold);
      setRealTimeAlerts(preferences.realTimeAlerts);
      setDailySummary(preferences.dailySummary);
      setWeeklyReport(preferences.weeklyReport);
      setExtremeConditionsOnly(preferences.extremeConditionsOnly);
      
      console.log('User preferences loaded successfully');
    } catch (err) {
      console.error('Error loading user preferences:', err);
      // If preferences don't exist yet, use defaults (current state values)
    }
  };
  
  // Save user preferences to database
  const savePreferences = async () => {
    try {
      setSaveStatus('Saving...');
      
      const preferences: UserPreferences = {
        userId: DEFAULT_USER_ID,
        notificationsEnabled,
        alertThreshold,
        realTimeAlerts,
        dailySummary,
        weeklyReport,
        extremeConditionsOnly,
        selectedLocation,
        sensitivityProfile
      };
      
      await updateUserPreferences(preferences);
      
      setSaveStatus('Preferences saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setSaveStatus('Failed to save preferences. Please try again.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };
  
  useEffect(() => {
    loadData();
    loadUserPreferences();
    
    // Set up a refresh interval (every 15 minutes)
    const intervalId = setInterval(() => {
      loadData();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter alerts based on selected level and location
  const filteredAlerts = alerts
    .filter(alert => alertLevel === 'all' || alert.level === alertLevel)
    .filter(alert => selectedLocation === 'all' || alert.location === selectedLocation || !alert.location);
    
  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };
  
  // Generate recommendations based on location and alert levels
  const generateRecommendations = () => {
    // Get the highest alert level
    const highestLevel = alerts.reduce((highest, alert) => {
      const levels = { low: 1, moderate: 2, high: 3, severe: 4 };
      return Math.max(highest, levels[alert.level as AlertLevel] || 0);
    }, 0);
    
    // Location-specific recommendations
    const locationRecommendations = [];
    if (selectedLocation !== 'all') {
      const locationData = locations.find(loc => loc.location === selectedLocation);
      if (locationData) {
        if (locationData.aqi > 200) {
          locationRecommendations.push(`${selectedLocation} is experiencing very unhealthy air quality (AQI: ${locationData.aqi}). Avoid all outdoor activities in this area.`);
        } else if (locationData.aqi > 150) {
          locationRecommendations.push(`${selectedLocation} currently has unhealthy air quality (AQI: ${locationData.aqi}). Limit time outdoors in this area.`);
        } else if (locationData.aqi > 100) {
          locationRecommendations.push(`${selectedLocation} has moderate air quality concerns (AQI: ${locationData.aqi}). Sensitive groups should take precautions.`);
        }
      }
    }
    
    // General recommendations based on highest alert level
    const generalRecommendations = [];
    
    if (highestLevel >= 4) { // Severe
      generalRecommendations.push(
        "Minimize outdoor activities, especially during morning and evening hours",
        "Keep windows closed and use air purifiers",
        "Wear N95/N99 masks when going outdoors",
        "Stay hydrated and maintain good respiratory hygiene",
        "Consider temporarily relocating if you have severe respiratory conditions"
      );
    } else if (highestLevel >= 3) { // High
      generalRecommendations.push(
        "Limit outdoor activities, especially for sensitive groups",
        "Keep windows closed during peak pollution hours (8-10 AM and 6-8 PM)",
        "Use air purifiers indoors if available",
        "Wear masks when going outdoors",
        "Monitor symptoms if you have respiratory conditions"
      );
    } else if (highestLevel >= 2) { // Moderate
      generalRecommendations.push(
        "Sensitive groups should reduce prolonged outdoor exertion",
        "Consider keeping windows closed during rush hours",
        "Stay updated on air quality changes throughout the day",
        "Keep medications handy if you have asthma or other respiratory conditions"
      );
    } else {
      generalRecommendations.push(
        "Air quality is acceptable, but watch for changes",
        "Continue with normal activities and stay informed",
        "Check air quality before planning extended outdoor activities",
        "Monitor for any unusual respiratory symptoms"
      );
    }
    
    return { locationRecommendations, generalRecommendations };
  };
  
  const getAlertColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'low': return <Info className="text-green-500" size={18} />;
      case 'moderate': return <MessageSquare className="text-yellow-500" size={18} />;
      case 'high': return <Bell className="text-orange-500" size={18} />;
      case 'severe': return <ShieldAlert className="text-red-500" size={18} />;
      default: return <Bell className="text-gray-500" size={18} />;
    }
  };
  
  const { locationRecommendations, generalRecommendations } = generateRecommendations();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Alerts & Recommendations</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Stay informed about air quality alerts and get personalized recommendations.
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 text-blue-500" size={20} />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Current Alerts</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  className="appearance-none pl-2 pr-6 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={alertLevel}
                  onChange={(e) => setAlertLevel(e.target.value)}
                >
                  <option value="all">All Alerts</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="severe">Severe</option>
                </select>
                
                <select
                  className="appearance-none pl-2 pr-6 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.location} value={loc.location}>{loc.location}</option>
                  ))}
                </select>
                
                <button 
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  onClick={loadData}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Loading alerts...</p>
                </div>
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                    <div className="flex justify-between">
                      <div className="flex">
                        <div className="mt-1 mr-3">
                          {getAlertIcon(alert.level)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">{alert.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                          <div className="flex items-center mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getAlertColor(alert.level)}`}>
                              {alert.level.charAt(0).toUpperCase() + alert.level.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {formatTimestamp(alert.timestamp)}
                            </span>
                            {alert.location && (
                              <span className="text-xs text-blue-500 dark:text-blue-400 ml-2 flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {alert.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CheckSquare size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No alerts match your filter. Try selecting a different category or location.
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated || 'N/A'}
                </div>
                <button 
                  onClick={loadData}
                  className="text-blue-500 hover:text-blue-600 font-medium flex items-center text-sm"
                >
                  Refresh Alerts
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Mitigation Strategies</h2>
            <div className="space-y-4">
              {locationRecommendations.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300">Location-Specific Recommendation</h3>
                  <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400 list-disc pl-5">
                    {locationRecommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-medium text-blue-800 dark:text-blue-300">Current Recommendations</h3>
                <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400 list-disc pl-5">
                  {generalRecommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-white">Long-term Strategies for Gurugram Residents</h3>
                <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-400 list-disc pl-5">
                  <li>Use public transportation or carpool to reduce vehicle emissions</li>
                  <li>Support and participate in local afforestation initiatives</li>
                  <li>Avoid burning garbage or other materials</li>
                  <li>Consider installing air quality monitors in your home</li>
                  <li>Join community efforts addressing industrial pollution sources</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications and settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h2>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="toggle" 
                  name="toggle" 
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  style={{ 
                    transform: notificationsEnabled ? 'translateX(100%)' : 'translateX(0)',
                    borderColor: notificationsEnabled ? '#3B82F6' : ''
                  }}
                />
                <label 
                  htmlFor="toggle" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  style={{ backgroundColor: notificationsEnabled ? '#93C5FD' : '' }}
                ></label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-gray-700 dark:text-gray-300">Real-time Alerts</div>
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4" 
                  checked={realTimeAlerts} 
                  onChange={() => setRealTimeAlerts(!realTimeAlerts)} 
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-700 dark:text-gray-300">Daily Summary</div>
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4" 
                  checked={dailySummary} 
                  onChange={() => setDailySummary(!dailySummary)} 
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-700 dark:text-gray-300">Weekly Report</div>
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4" 
                  checked={weeklyReport}
                  onChange={() => setWeeklyReport(!weeklyReport)}
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-700 dark:text-gray-300">Extreme Conditions Only</div>
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4" 
                  checked={extremeConditionsOnly}
                  onChange={() => setExtremeConditionsOnly(!extremeConditionsOnly)}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2">Alert Threshold</h3>
              <select 
                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!notificationsEnabled}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="moderate">Moderate and above</option>
                <option value="high">High and above</option>
                <option value="severe">Severe only</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Personalization</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Location</label>
                <select 
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">Gurugram (All Areas)</option>
                  {locations.map(loc => (
                    <option key={loc.location} value={loc.location}>{loc.location}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Sensitivity Profile</label>
                <select 
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sensitivityProfile}
                  onChange={(e) => setSensitivityProfile(e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="sensitive">Sensitive (Children/Elderly)</option>
                  <option value="respiratory">Respiratory Conditions</option>
                  <option value="athlete">Outdoor Athlete</option>
                </select>
              </div>
            </div>
            
            {saveStatus && (
              <div className={`mt-3 p-2 text-center text-sm rounded ${
                saveStatus === 'Saving...' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                  : saveStatus.includes('success') 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {saveStatus}
              </div>
            )}
            
            <button 
              className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors"
              onClick={savePreferences}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;