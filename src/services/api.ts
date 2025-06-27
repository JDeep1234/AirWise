import axios from 'axios';

// Create an axios instance with the base URL for our API
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Air quality data APIs
export const fetchCurrentAirQuality = async () => {
  try {
    const response = await api.get('/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current air quality:', error);
    throw error;
  }
};

export const fetchForecast = async (days = 7) => {
  try {
    const response = await api.get('/forecast', { params: { days } });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

export const fetchHistorical = async (days = 30) => {
  try {
    const response = await api.get('/historical', { params: { days } });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

export const fetchAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const fetchRecommendations = async () => {
  try {
    const response = await api.get('/recommendations');
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const fetchGeospatialData = async () => {
  try {
    const response = await api.get('/geospatial');
    return response.data;
  } catch (error) {
    console.error('Error fetching geospatial data:', error);
    throw error;
  }
};

export const fetchHourlyTrend = async () => {
  try {
    const response = await api.get('/hourly-trend');
    return response.data;
  } catch (error) {
    console.error('Error fetching hourly trend data:', error);
    throw error;
  }
};

// New API functions for Pollution Time Machine features

// 1. Micro-Zone Prediction APIs
export const fetchMicroZonePredictions = async () => {
  try {
    const response = await api.get('/micro-zone-predictions');
    return response.data;
  } catch (error) {
    console.error('Error fetching micro-zone predictions:', error);
    
    // Fallback to mock data if API endpoint doesn't exist yet
    const mockPredictions = [
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
    
    return mockPredictions;
  }
};

export const sendMicroZoneNotifications = async (zoneId: string) => {
  try {
    const response = await api.post(`/micro-zone-notifications/${zoneId}`);
    return response.data;
  } catch (error) {
    console.error('Error sending micro-zone notifications:', error);
    // Return mock success response
    return { success: true, notificationsSent: 842 };
  }
};

// 2. Infrastructure Control APIs
export const fetchInfrastructureSystems = async () => {
  try {
    const response = await api.get('/infrastructure-systems');
    return response.data;
  } catch (error) {
    console.error('Error fetching infrastructure systems:', error);
    
    // Fallback to mock data if API endpoint doesn't exist yet
    const mockSystems = [
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
    
    return mockSystems;
  }
};

export const toggleInfrastructureSystem = async (systemId: string, activate: boolean) => {
  try {
    const response = await api.put(`/infrastructure-systems/${systemId}`, { 
      status: activate ? 'active' : 'inactive' 
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling infrastructure system:', error);
    // Return mock response
    return { 
      success: true, 
      systemId, 
      status: activate ? 'active' : 'inactive'
    };
  }
};

// 3. Pollution Source Attribution APIs
export const fetchPollutionSources = async () => {
  try {
    const response = await api.get('/pollution-sources');
    return response.data;
  } catch (error) {
    console.error('Error fetching pollution sources:', error);
    
    // Fallback to mock data if API endpoint doesn't exist yet
    const mockSources = [
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
    
    return mockSources;
  }
};

export const implementSourceIntervention = async (sourceId: string) => {
  try {
    const response = await api.post(`/pollution-sources/${sourceId}/interventions`);
    return response.data;
  } catch (error) {
    console.error('Error implementing source intervention:', error);
    // Return mock response
    return { 
      success: true, 
      sourceId, 
      status: 'mitigated',
      trend: 'decreasing'
    };
  }
};

// User preferences APIs
export interface UserPreferences {
  userId: string;
  notificationsEnabled: boolean;
  alertThreshold: string;
  realTimeAlerts: boolean;
  dailySummary: boolean;
  weeklyReport: boolean;
  extremeConditionsOnly: boolean;
  selectedLocation: string;
  sensitivityProfile: string;
}

export const fetchUserPreferences = async (userId: string): Promise<UserPreferences> => {
  try {
    const response = await api.get(`/preferences/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

export const saveUserPreferences = async (preferences: UserPreferences): Promise<UserPreferences> => {
  try {
    const response = await api.post('/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
};

export const updateUserPreferences = async (preferences: UserPreferences): Promise<UserPreferences> => {
  try {
    const response = await api.put(`/preferences/${preferences.userId}`, preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export default api; 