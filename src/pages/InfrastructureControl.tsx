import React, { useState, useEffect } from 'react';
import { Clock, Activity, AlertTriangle, Zap, RefreshCw, CheckCircle, XCircle, Droplets, Map, ToggleLeft } from 'lucide-react';
import AQIMap from '../components/dashboard/AQIMap';

interface InfrastructureSystem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  type: 'traffic' | 'irrigation' | 'transit';
  location: string;
  coordinates: [number, number];
  currentAqi: number;
  impact: 'high' | 'medium' | 'low';
  action: string;
  lastActivated: string;
  estimatedReduction: number;
}

const InfrastructureControl: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systems, setSystems] = useState<InfrastructureSystem[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<InfrastructureSystem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'activating' | 'success' | 'error'>('idle');
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(true);
  
  // Mock data for infrastructure systems
  const mockSystems: InfrastructureSystem[] = [
    {
      id: '1',
      name: 'IFFCO Chowk Traffic Signals',
      status: 'active',
      type: 'traffic',
      location: 'IFFCO Chowk',
      coordinates: [28.4736, 77.0723],
      currentAqi: 185,
      impact: 'high',
      action: 'Modify signal timing to reduce congestion and idling',
      lastActivated: '2 hours ago',
      estimatedReduction: 18
    },
    {
      id: '2',
      name: 'Sector 29 Water Sprinklers',
      status: 'inactive',
      type: 'irrigation',
      location: 'Sector 29',
      coordinates: [28.4698, 77.0622],
      currentAqi: 210,
      impact: 'medium',
      action: 'Activate mist sprayers to capture particulate matter',
      lastActivated: 'Yesterday',
      estimatedReduction: 12
    },
    {
      id: '3',
      name: 'MG Road Bus Routes',
      status: 'pending',
      type: 'transit',
      location: 'MG Road',
      coordinates: [28.4773, 77.0497],
      currentAqi: 168,
      impact: 'medium',
      action: 'Reroute buses to avoid highly polluted corridors',
      lastActivated: '3 days ago',
      estimatedReduction: 8
    },
    {
      id: '4',
      name: 'Golf Course Road Signals',
      status: 'inactive',
      type: 'traffic',
      location: 'Golf Course Road',
      coordinates: [28.4321, 77.1025],
      currentAqi: 155,
      impact: 'low',
      action: 'Optimize signal timing for peak hours',
      lastActivated: 'Last week',
      estimatedReduction: 5
    },
    {
      id: '5',
      name: 'Udyog Vihar Industrial Zone Sprinklers',
      status: 'active',
      type: 'irrigation',
      location: 'Udyog Vihar',
      coordinates: [28.5015, 77.0854],
      currentAqi: 195,
      impact: 'high',
      action: 'Continuous mist spraying near factories',
      lastActivated: '30 minutes ago',
      estimatedReduction: 22
    }
  ];
  
  useEffect(() => {
    // Simulate API call
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        setSystems(mockSystems);
        setLastUpdated(new Date().toLocaleString());
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSystemSelect = (system: InfrastructureSystem) => {
    setSelectedSystem(system);
    setActivationStatus('idle');
  };
  
  const toggleSystem = () => {
    if (!selectedSystem) return;
    
    // Simulate activating or deactivating a system
    setActivationStatus('activating');
    setTimeout(() => {
      setSystems(systems.map(system => {
        if (system.id === selectedSystem.id) {
          const newStatus = system.status === 'active' ? 'inactive' : 'active';
          return { ...system, status: newStatus };
        }
        return system;
      }));
      
      setSelectedSystem(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: prev.status === 'active' ? 'inactive' : 'active'
        };
      });
      
      setActivationStatus('success');
    }, 2000);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-gray-500';
      case 'pending': return 'text-amber-500';
      default: return 'text-gray-500';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': 
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
      case 'inactive': 
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Inactive</span>;
      case 'pending': 
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">Pending</span>;
      default: 
        return null;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'traffic': 
        return <Activity size={16} className="text-blue-500" />;
      case 'irrigation': 
        return <Droplets size={16} className="text-blue-500" />;
      case 'transit': 
        return <Map size={16} className="text-blue-500" />;
      default: 
        return null;
    }
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-blue-500';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Infrastructure AI Controller
          </h1>
          <button 
            onClick={() => {
              setSystems(mockSystems);
              setLastUpdated(new Date().toLocaleString());
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm transition-colors flex items-center"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Systems'}
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Automated control of civic infrastructure to mitigate high pollution events
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <p className="text-gray-500 dark:text-gray-400 flex items-center mr-6">
              <Clock size={16} className="mr-1" />
              Last updated: {lastUpdated || 'Never'}
            </p>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Auto-Pilot:</span>
              <button
                onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
                className="relative inline-flex items-center cursor-pointer"
              >
                <div 
                  className={`w-11 h-6 ${autoPilotEnabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} rounded-full transition-colors duration-200`}
                >
                  <div 
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transform transition-transform duration-200 ${autoPilotEnabled ? 'translate-x-5 ml-0.5' : 'left-0.5'}`} 
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {autoPilotEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </button>
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Infrastructure Network</h2>
          <div className="h-[500px]">
            <AQIMap loading={loading} />
          </div>
        </div>
        
        {/* Infrastructure Systems List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Control Systems</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a system to view details and take action</p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading systems...</p>
              </div>
            ) : systems.length > 0 ? (
              systems.map((system) => (
                <div 
                  key={system.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 cursor-pointer ${selectedSystem?.id === system.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleSystemSelect(system)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                        {getTypeIcon(system.type)}
                        <span className="ml-2">{system.name}</span>
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                          {system.location}
                        </span>
                        {getStatusBadge(system.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">AQI: </span>
                        <span className="font-bold text-red-500">
                          {system.currentAqi}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last active: {system.lastActivated}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No infrastructure systems available.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Selected System Details */}
      {selectedSystem && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{selectedSystem.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedSystem.location}</p>
            </div>
            <div className={`flex items-center ${getStatusColor(selectedSystem.status)}`}>
              {selectedSystem.status === 'active' ? <CheckCircle size={18} className="mr-2" /> : <XCircle size={18} className="mr-2" />}
              <span className="font-medium">{selectedSystem.status.charAt(0).toUpperCase() + selectedSystem.status.slice(1)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">System Type</h3>
                  <p className="mt-1 text-lg font-medium text-gray-800 dark:text-white flex items-center">
                    {getTypeIcon(selectedSystem.type)}
                    <span className="ml-2">
                      {selectedSystem.type.charAt(0).toUpperCase() + selectedSystem.type.slice(1)} Control
                    </span>
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current AQI</h3>
                  <p className="mt-1 text-lg font-medium text-red-500">{selectedSystem.currentAqi}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Predicted Impact</h3>
                  <div className="mt-1 flex items-center">
                    <span className={`text-lg font-medium ${getImpactColor(selectedSystem.impact)}`}>
                      {selectedSystem.impact.charAt(0).toUpperCase() + selectedSystem.impact.slice(1)}
                    </span>
                    <span className="ml-3 text-green-500 flex items-center">
                      <span className="mr-1">-</span>
                      {selectedSystem.estimatedReduction} AQI points
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Activated</h3>
                  <p className="mt-1 font-medium text-gray-800 dark:text-white">{selectedSystem.lastActivated}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Control Action</h3>
                <div className="mt-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-300">{selectedSystem.action}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Manual Control</h3>
                <button 
                  onClick={toggleSystem} 
                  disabled={activationStatus === 'activating'}
                  className={`w-full px-4 py-3 rounded-md flex items-center justify-center
                    ${activationStatus === 'activating' 
                      ? 'bg-blue-300 cursor-not-allowed' 
                      : selectedSystem.status === 'active'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  {activationStatus === 'activating' ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" /> 
                      Processing...
                    </>
                  ) : selectedSystem.status === 'active' ? (
                    <>
                      <Zap size={16} className="mr-2" /> 
                      Deactivate System
                    </>
                  ) : (
                    <>
                      <Zap size={16} className="mr-2" /> 
                      Activate System
                    </>
                  )}
                </button>
                
                {activationStatus === 'success' && (
                  <p className="text-center text-sm mt-2 text-green-600 dark:text-green-400">
                    System {selectedSystem.status === 'active' ? 'activated' : 'deactivated'} successfully.
                  </p>
                )}
                
                {activationStatus === 'error' && (
                  <p className="text-center text-sm mt-2 text-red-600 dark:text-red-400">
                    Failed to update system status. Please try again.
                  </p>
                )}
              </div>
              
              {autoPilotEnabled && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <p className="text-amber-800 dark:text-amber-300">
                      Auto-Pilot is enabled. System will automatically activate when AQI reaches trigger thresholds.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfrastructureControl; 