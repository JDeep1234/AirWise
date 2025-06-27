// API Base URL configuration
const API_BASE_URL = 'http://localhost:5000';

// Pollution Passport API Types
export interface ScoreBreakdown {
  aqi_exposure: { score: number; weight: number; description: string };
  transport_mode: { score: number; weight: number; description: string };
  time_in_green_zones: { score: number; weight: number; description: string };
  behavior_pattern: { score: number; weight: number; description: string };
}

export interface PollutionScoreResponse {
  user_id: string;
  current_score: number;
  previous_score: number;
  category: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
  last_updated: string;
  weekly_change: number;
  monthly_change: number;
  breakdown: ScoreBreakdown;
  improvement_tips: string[];
  data_sources: string[];
}

export interface HotspotLocation {
  id: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  current_aqi: number;
  dominant_pollutant: string;
  risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  last_sync: string;
  recommendation: string;
}

export interface GeospatialResponse {
  timestamp: string;
  source: string;
  coverage_area: string;
  resolution: string;
  hotspots: HotspotLocation[];
  air_quality_zones: {
    green_zones: string[];
    yellow_zones: string[];
    red_zones: string[];
  };
  weather_influence: {
    wind_speed: string;
    wind_direction: string;
    humidity: string;
    temperature: string;
    visibility: string;
  };
}

export interface RewardApplicationResponse {
  status: 'success' | 'error';
  message: string;
  eligibility_check: boolean;
  qr_code_image: string;
  coupon_code: string;
  redemption_details?: {
    expires_at: string;
    terms_conditions: string[];
  };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  change: number;
  badge: 'green' | 'yellow' | 'red';
  location: string;
  streak_days?: number;
  achievements?: string[];
  members_count?: number;
  green_initiatives?: number;
  employees_count?: number;
  carbon_offset?: string;
}

export interface LeaderboardResponse {
  category: 'individual' | 'society' | 'corporate';
  timeframe: 'daily' | 'weekly' | 'monthly';
  last_updated: string;
  total_participants: number;
  leaderboard: LeaderboardEntry[];
  next_refresh: string;
  user_rank: number;
}

export interface PollutionAlert {
  id: string;
  type: 'score_drop' | 'reward_available' | 'zone_warning' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

// API Service Class
class PollutionPassportAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get user's pollution credit score and breakdown
   */
  async getPollutionScore(userId: string = 'default_user'): Promise<PollutionScoreResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/score/get?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching pollution score:', error);
      throw error;
    }
  }

  /**
   * Get pollution hotspots and real-time AQI data for Gurugram
   */
  async getGeospatialHotspots(): Promise<GeospatialResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/geo/hotspots`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching geospatial hotspots:', error);
      throw error;
    }
  }

  /**
   * Apply for a pollution passport reward with QR code generation
   */
  async applyForReward(rewardId: string, userId: string = 'default_user'): Promise<RewardApplicationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rewards/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reward_id: rewardId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error applying for reward:', error);
      throw error;
    }
  }

  /**
   * Fetch leaderboard data for different categories
   */
  async fetchLeaderboard(
    category: 'individual' | 'society' | 'corporate' = 'individual',
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<LeaderboardResponse> {
    try {
      // Use GET method with query parameters instead of POST
      const url = `${this.baseUrl}/api/leaderboard/fetch?category=${category}&timeframe=${timeframe}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        category: data.category || category,
        timeframe: data.timeframe || timeframe,
        last_updated: data.last_updated || new Date().toISOString(),
        total_participants: data.total_participants || 0,
        leaderboard: data.leaderboard || [],
        next_refresh: data.next_refresh || '5 minutes',
        user_rank: data.user_rank || 99
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Return fallback data
      return {
        category,
        timeframe,
        last_updated: new Date().toISOString(),
        total_participants: 1500,
        leaderboard: [
          {
            id: 'user_001',
            name: 'Rahul Sharma',
            score: 92,
            rank: 1,
            change: 2,
            badge: 'green',
            location: 'Sector 29',
            achievements: ['Eco Warrior']
          },
          {
            id: 'user_current',
            name: 'You',
            score: 72,
            rank: 12,
            change: 3,
            badge: 'yellow',
            location: 'Your Location',
            achievements: ['Green Starter']
          }
        ],
        next_refresh: '5 minutes',
        user_rank: 12
      };
    }
  }

  /**
   * Get real-time notifications for user
   */
  async getNotifications(userId: string = 'default_user'): Promise<PollutionAlert[]> {
    try {
      // Mock implementation - in real app, this would be a backend endpoint
      return [
        {
          id: '1',
          type: 'reward_available',
          title: 'New Reward Available!',
          message: 'You\'ve unlocked a ₹500 Metro Card reward. Claim now!',
          timestamp: '2 hours ago',
          severity: 'success'
        },
        {
          id: '2',
          type: 'zone_warning', 
          title: 'High Pollution Zone Alert',
          message: 'You\'re entering Sector 21 - AQI 185. Consider alternate route.',
          timestamp: '5 hours ago',
          severity: 'warning'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Week Streak Achieved!',
          message: 'Congratulations! You\'ve maintained a green score for 7 days.',
          timestamp: '1 day ago',
          severity: 'success'
        }
      ];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Update user's current location for real-time tracking
   */
  async updateUserLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/user/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  }
}

// Utility functions for UI styling
export const getPollutionCategoryColor = (category: string): string => {
  switch (category) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-green-500';
    case 'moderate': return 'text-yellow-500';
    case 'poor': return 'text-orange-500';
    case 'hazardous': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low': return 'text-green-500';
    case 'moderate': return 'text-yellow-500';
    case 'high': return 'text-orange-500';
    case 'very_high': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export const formatScoreChange = (change: number): { text: string; color: string } => {
  if (change > 0) {
    return { text: `+${change}`, color: 'text-green-500' };
  } else if (change < 0) {
    return { text: `${change}`, color: 'text-red-500' };
  } else {
    return { text: '0', color: 'text-gray-500' };
  }
};

// Export singleton instance
export const pollutionPassportAPI = new PollutionPassportAPI(); 