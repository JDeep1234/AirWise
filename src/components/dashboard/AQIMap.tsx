import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import { fetchGeospatialData } from '../../services/api';
import L from 'leaflet';
import { Clock, RefreshCw } from 'lucide-react';

// We'll use a simpler approach without the heat map library for now
// The CircleMarkers already provide a good visualization

interface Location {
  location: string;
  coordinates: [number, number];
  aqi: number;
  pm25?: number;
}

interface AQIMapProps {
  loading: boolean;
}

// Component to add click event handling to the map
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to add a gradient overlay to the map
const GradientOverlay = ({ locations }: { locations: Location[] }) => {
  const map = useMap();
  
  useEffect(() => {
    // Create an overlay for heat-like visualization
    const bounds = map.getBounds();
    const overlay = L.rectangle(bounds, {
      fillOpacity: 0.5,
      fillColor: 'transparent',
      stroke: false
    }).addTo(map);
    
    // Update the overlay when the map is moved
    const updateOverlay = () => {
      overlay.setBounds(map.getBounds());
    };
    
    map.on('moveend', updateOverlay);
    
    return () => {
      map.removeLayer(overlay);
      map.off('moveend', updateOverlay);
    };
  }, [map, locations]);
  
  return null;
};

const AQIMap: React.FC<AQIMapProps> = ({ loading: initialLoading }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const mapRef = useRef<L.Map | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  
  // Function to fetch data
  const getMapData = async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchGeospatialData();
      setLocations(data);
      setLastUpdated(new Date().toLocaleString());
      setError(null);
    } catch (error) {
      console.error('Failed to fetch map data:', error);
      setError('Failed to load map data');
      // Fallback data
      setLocations([
        { location: 'Sector 56', coordinates: [28.4089, 77.0926], aqi: 175 },
        { location: 'DLF Cyber City', coordinates: [28.4595, 77.0266], aqi: 160 },
        { location: 'Golf Course Road', coordinates: [28.4321, 77.1025], aqi: 155 },
        { location: 'MG Road', coordinates: [28.4773, 77.0497], aqi: 168 }
      ]);
      setLastUpdated(new Date().toLocaleString() + ' (fallback data)');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setCountdown(300); // Reset countdown after refresh
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    getMapData();
  }, []);
  
  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshEnabled) {
      // Countdown timer - update every second
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // When countdown reaches zero, refresh data
            getMapData();
            return 300; // Reset to 5 minutes
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(countdownTimer);
      };
    }
  }, [autoRefreshEnabled]);
  
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const gurugramCenter: LatLngExpression = [28.4595, 77.0266];
  
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10B981'; // Green
    if (aqi <= 100) return '#F59E0B'; // Yellow
    if (aqi <= 150) return '#F97316'; // Orange
    if (aqi <= 200) return '#EF4444'; // Red
    if (aqi <= 300) return '#8B5CF6'; // Purple
    return '#991B1B'; // Dark Red
  };

  const getAQICategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Function to estimate AQI at a given point based on nearby locations
  // Using Inverse Distance Weighting (IDW) interpolation
  const estimateAQI = (lat: number, lng: number): number => {
    if (locations.length === 0) return 0;
    
    // If we click near an existing location, just return that value
    const nearbyLocation = locations.find(loc => {
      const [locLat, locLng] = loc.coordinates;
      // Check if clicked within ~500 meters (rough approximation)
      return Math.abs(lat - locLat) < 0.005 && Math.abs(lng - locLng) < 0.005;
    });
    
    if (nearbyLocation) return nearbyLocation.aqi;
    
    // Otherwise, calculate weighted average based on distance
    let weightSum = 0;
    let aqiSum = 0;
    
    // Inverse distance weighting calculation
    locations.forEach(loc => {
      const [locLat, locLng] = loc.coordinates;
      // Simple distance calculation (squared distance is sufficient for weighting)
      const distSquared = Math.pow(lat - locLat, 2) + Math.pow(lng - locLng, 2);
      const weight = distSquared === 0 ? 1 : 1 / distSquared;
      
      weightSum += weight;
      aqiSum += loc.aqi * weight;
    });
    
    return Math.round(aqiSum / weightSum);
  };
  
  const handleMapClick = (lat: number, lng: number) => {
    // Estimate AQI at clicked location
    const estimatedAQI = estimateAQI(lat, lng);
    
    // Get nearest address
    const locationName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    setClickedLocation({
      location: locationName,
      coordinates: [lat, lng],
      aqi: estimatedAQI
    });
    
    // Create a popup at the clicked location
    if (mapRef.current) {
      L.popup()
        .setLatLng([lat, lng])
        .setContent(`
          <div class="p-2">
            <h3 class="font-semibold">${locationName}</h3>
            <p class="text-sm">Estimated AQI: ${estimatedAQI}</p>
            <p class="text-sm">Level: ${getAQICategory(estimatedAQI)}</p>
          </div>
        `)
        .openOn(mapRef.current);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
      {error && (
        <div className="absolute top-2 left-2 right-2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}
      
      <div className="absolute top-2 left-2 z-[500] bg-white dark:bg-gray-800 p-2 rounded-md shadow-md pointer-events-none">
        <div className="text-xs text-gray-700 dark:text-gray-300">
          Click anywhere on the map to check AQI levels
        </div>
      </div>
      
      {/* Auto-refresh controls */}
      <div className="absolute top-2 right-2 z-[500] flex flex-col gap-2">
        <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md flex items-center text-xs">
          <Clock size={12} className="mr-1 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">Last updated: </span>
          <span className="ml-1 text-gray-900 dark:text-gray-100">{lastUpdated || 'Never'}</span>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700 dark:text-gray-300">Auto-refresh:</span>
            <button 
              onClick={toggleAutoRefresh}
              className={`text-xs px-2 py-0.5 rounded ${
                autoRefreshEnabled 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {autoRefreshEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {autoRefreshEnabled && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Next update in:</span>
              <span className="text-xs font-medium">{formatCountdown(countdown)}</span>
            </div>
          )}
          
          <button 
            onClick={() => getMapData()}
            disabled={isRefreshing}
            className="text-xs mt-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors"
          >
            {isRefreshing ? (
              <>
                <RefreshCw size={10} className="mr-1 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={10} className="mr-1" />
                Refresh Now
              </>
            )}
          </button>
        </div>
      </div>
      
      <MapContainer 
        center={gurugramCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={(map) => { 
          mapRef.current = map;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <GradientOverlay locations={locations} />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Create a heat map effect with overlapping circle markers */}
        {locations.map((location, index) => (
          <React.Fragment key={index}>
            {/* Large circle with low opacity for the heat effect */}
            <CircleMarker
              center={location.coordinates as LatLngExpression}
              radius={Math.max(location.aqi / 5, 30)} // Larger radius for heat effect
              pathOptions={{
                fillColor: getAQIColor(location.aqi),
                fillOpacity: 0.2,
                color: 'transparent'
              }}
            />
            
            {/* Medium circle with medium opacity */}
            <CircleMarker
              center={location.coordinates as LatLngExpression}
              radius={Math.max(location.aqi / 8, 20)} 
              pathOptions={{
                fillColor: getAQIColor(location.aqi),
                fillOpacity: 0.4,
                color: 'transparent'
              }}
            />
            
            {/* Small circle with high opacity to mark the center */}
            <CircleMarker
              center={location.coordinates as LatLngExpression}
              radius={Math.max(location.aqi / 15, 10)} 
              pathOptions={{
                fillColor: getAQIColor(location.aqi),
                fillOpacity: 0.8,
                color: getAQIColor(location.aqi),
                weight: 1
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{location.location}</h3>
                  <p className="text-sm">AQI: {Math.round(location.aqi)}</p>
                  <p className="text-sm">Level: {getAQICategory(location.aqi)}</p>
                  {location.pm25 && <p className="text-sm">PM2.5: {Math.round(location.pm25)} µg/m³</p>}
                </div>
              </Popup>
            </CircleMarker>
          </React.Fragment>
        ))}
        
        {/* Show marker at clicked location if we have one */}
        {clickedLocation && (
          <CircleMarker
            center={clickedLocation.coordinates as LatLngExpression}
            radius={8}
            pathOptions={{
              fillColor: getAQIColor(clickedLocation.aqi),
              fillOpacity: 1,
              color: '#ffffff',
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{clickedLocation.location}</h3>
                <p className="text-sm">Estimated AQI: {Math.round(clickedLocation.aqi)}</p>
                <p className="text-sm">Level: {getAQICategory(clickedLocation.aqi)}</p>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

export default AQIMap;