import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  MapPin, 
  RefreshCw, 
  Copy, 
  CheckCircle, 
  X,
  Bell,
  Info,
  Car,
  TreePine,
  Wind,
  Coins,
  Leaf,
  Calculator,
  Lightbulb,
  Target,
  Award,
  DollarSign,
  Timer,
  Users,
  Building,
  ChevronRight,
  ExternalLink,
  Activity,
  Calendar,
  BarChart3,
  Zap,
  Navigation,
  Train,
  Bike,
  MapIcon
} from 'lucide-react';
import { pollutionPassportAPI } from '../services/pollutionPassportApi';
import type { 
  PollutionScoreResponse, 
  GeospatialResponse, 
  LeaderboardResponse, 
  RewardApplicationResponse,
  PollutionAlert,
  HotspotLocation,
  LeaderboardEntry
} from '../services/pollutionPassportApi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Auto-refresh component for map data
function MapAutoRefresh({ onRefresh, interval = 300000 }: { onRefresh: () => void; interval?: number }) {
  useEffect(() => {
    const timer = setInterval(() => {
      onRefresh();
    }, interval);

    return () => clearInterval(timer);
  }, [onRefresh, interval]);

  return null;
}

// Types
interface PollutionScore {
  currentScore: number;
  previousScore: number;
  category: 'excellent' | 'good' | 'moderate' | 'poor' | 'hazardous';
  lastUpdated: string;
  weeklyChange: number;
  monthlyChange: number;
  breakdown: ScoreBreakdown;
  improvementTips: string[];
  dataSources: string[];
}

interface ScoreBreakdown {
  aqi_exposure: { score: number; weight: number; description: string };
  transport_mode: { score: number; weight: number; description: string };
  time_in_green_zones: { score: number; weight: number; description: string };
  behavior_pattern: { score: number; weight: number; description: string };
}

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'insurance' | 'loan' | 'government' | 'transport' | 'health' | 'utility' | 'retail';
  value: string;
  eligibilityScore: number;
  claimed: boolean;
  expiryDate: string;
  provider: string;
  qrCode?: string;
  couponCode?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  change: number;
  badge: 'green' | 'yellow' | 'red';
  location: string;
  achievements?: string[];
  streak_days?: number;
}

interface PollutionAlert {
  id: string;
  type: 'score_drop' | 'reward_available' | 'zone_warning' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

interface QRCodeModal {
  isOpen: boolean;
  reward: Reward | null;
  qrCodeImage: string;
  couponCode: string;
}

interface TipsModal {
  isOpen: boolean;
}

interface NotificationsDrawer {
  isOpen: boolean;
}

interface TransportModal {
  isOpen: boolean;
}

interface ParksModal {
  isOpen: boolean;
}

interface NearbyPark {
  id: string;
  name: string;
  distance: string;
  cleanAirScore: number;
  activities: string[];
  location: { lat: number; lng: number };
}

interface TransportOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  carbonFootprint: string;
  scoreImpact: number;
}

const PollutionPassport: React.FC = () => {
  // State management
  const [pollutionScore, setPollutionScore] = useState<PollutionScore | null>(null);
  const [hotspots, setHotspots] = useState<HotspotLocation[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<PollutionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [leaderboardCategory, setLeaderboardCategory] = useState<'individual' | 'society' | 'corporate'>('individual');
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  // Modal states
  const [qrModal, setQrModal] = useState<QRCodeModal>({
    isOpen: false,
    reward: null,
    qrCodeImage: '',
    couponCode: ''
  });
  const [tipsModal, setTipsModal] = useState<TipsModal>({ isOpen: false });
  const [notificationsDrawer, setNotificationsDrawer] = useState<NotificationsDrawer>({ isOpen: false });
  const [transportModal, setTransportModal] = useState<TransportModal>({ isOpen: false });
  const [parksModal, setParksModal] = useState<ParksModal>({ isOpen: false });

  // Transport and Parks data
  const [nearbyParks] = useState<NearbyPark[]>([
    {
      id: '1',
      name: 'Leisure Valley Park',
      distance: '1.2 km',
      cleanAirScore: 85,
      activities: ['Walking', 'Cycling', 'Yoga'],
      location: { lat: 28.4595, lng: 77.0266 }
    },
    {
      id: '2',
      name: 'Tau Devi Lal Bio Diversity Park',
      distance: '2.5 km',
      cleanAirScore: 92,
      activities: ['Nature Walk', 'Bird Watching', 'Photography'],
      location: { lat: 28.4595, lng: 77.0266 }
    },
    {
      id: '3',
      name: 'Aravalli Bio Diversity Park',
      distance: '3.8 km',
      cleanAirScore: 88,
      activities: ['Hiking', 'Wildlife Spotting', 'Meditation'],
      location: { lat: 28.4595, lng: 77.0266 }
    }
  ]);

  const [transportOptions] = useState<TransportOption[]>([
    {
      id: 'metro',
      name: 'Metro/Subway',
      icon: <Train className="w-5 h-5" />,
      carbonFootprint: '41g CO₂/km',
      scoreImpact: 8
    },
    {
      id: 'bus',
      name: 'Public Bus',
      icon: <Car className="w-5 h-5" />,
      carbonFootprint: '89g CO₂/km',
      scoreImpact: 6
    },
    {
      id: 'bike',
      name: 'Bicycle',
      icon: <Bike className="w-5 h-5" />,
      carbonFootprint: '0g CO₂/km',
      scoreImpact: 10
    },
    {
      id: 'walk',
      name: 'Walking',
      icon: <Users className="w-5 h-5" />,
      carbonFootprint: '0g CO₂/km',
      scoreImpact: 10
    },
    {
      id: 'car',
      name: 'Private Car',
      icon: <Car className="w-5 h-5" />,
      carbonFootprint: '192g CO₂/km',
      scoreImpact: -3
    }
  ]);

  // Load pollution data
  const loadPollutionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [scoreResponse, hotspotsResponse, rewardsResponse] = await Promise.all([
        pollutionPassportAPI.getPollutionScore().catch(e => {
          console.error('Score API failed:', e);
          return {
            user_id: 'default_user',
            current_score: 77,
            previous_score: 73,
            category: 'good' as const,
            last_updated: new Date().toISOString(),
            weekly_change: 4,
            monthly_change: 8,
            breakdown: {
              aqi_exposure: { score: 75, weight: 0.4, description: 'Real-time AQI exposure tracking' },
              transport_mode: { score: 80, weight: 0.25, description: 'GPS-tracked transport analysis' },
              time_in_green_zones: { score: 70, weight: 0.2, description: 'Time in parks and clean areas' },
              behavior_pattern: { score: 85, weight: 0.15, description: 'AI behavior pattern analysis' }
            },
            improvement_tips: [
              'Use public transport during peak hours',
              'Visit parks for green zone credits',
              'Check AQI before outdoor activities'
            ],
            data_sources: ['OpenWeatherMap API', 'GPS tracking', 'IoT sensors']
          };
        }),
        pollutionPassportAPI.getGeospatialHotspots().catch(e => {
          console.error('Hotspots API failed:', e);
          return {
            timestamp: new Date().toISOString(),
            source: 'Mock Data',
            coverage_area: 'Gurugram, Haryana',
            resolution: '1km grid',
            hotspots: [
              {
                id: '1',
                location: { lat: 28.4595, lng: 77.0266, name: 'City Center' },
                current_aqi: 165,
                dominant_pollutant: 'PM2.5',
                risk_level: 'high' as const,
                last_sync: '2 minutes ago',
                recommendation: 'Limit outdoor activities'
              }
            ],
            air_quality_zones: { green_zones: [], yellow_zones: [], red_zones: [] },
            weather_influence: {
              wind_speed: '12 km/h',
              wind_direction: 'NW',
              humidity: '68%',
              temperature: '28°C',
              visibility: '4.2 km'
            }
          };
        }),
        fetch('/api/rewards/available').then(r => r.json()).catch(e => {
          console.error('Rewards API failed:', e);
          return {
            rewards: [
              {
                id: '1',
                title: '10% Health Insurance Discount',
                description: 'Annual premium discount for maintaining good air quality score',
                type: 'insurance' as const,
                value: '₹12,000 savings',
                eligibilityScore: 75,
                claimed: false,
                expiryDate: '2024-12-31',
                provider: 'HDFC ERGO'
              },
              {
                id: '2',
                title: 'Green Vehicle Loan - 0.5% Rate Reduction',
                description: 'Special interest rate for electric/hybrid vehicle purchase',
                type: 'loan' as const,
                value: '₹50,000 savings',
                eligibilityScore: 80,
                claimed: false,
                expiryDate: '2024-12-31',
                provider: 'HDFC Bank'
              },
              {
                id: '3',
                title: 'Free Metro Card (₹500)',
                description: 'Complimentary metro travel card for eco-friendly commuters',
                type: 'transport' as const,
                value: '₹500 credit',
                eligibilityScore: 70,
                claimed: false,
                expiryDate: '2024-11-30',
                provider: 'Delhi Metro'
              },
              {
                id: '4',
                title: 'Pollution Warrior Certificate',
                description: 'Government recognition for environmental contribution',
                type: 'government' as const,
                value: 'Official Recognition',
                eligibilityScore: 85,
                claimed: false,
                expiryDate: '2024-12-31',
                provider: 'Haryana Govt'
              },
              {
                id: '5',
                title: 'Air Purifier 25% Discount',
                description: 'Premium HEPA air purifier at discounted price',
                type: 'retail' as const,
                value: '₹7,500 discount',
                eligibilityScore: 65,
                claimed: false,
                expiryDate: '2024-10-31',
                provider: 'Croma Electronics'
              },
              {
                id: '6',
                title: 'Free Health Checkup',
                description: 'Comprehensive respiratory health screening',
                type: 'health' as const,
                value: '₹3,000 value',
                eligibilityScore: 60,
                claimed: false,
                expiryDate: '2024-12-31',
                provider: 'Apollo Hospitals'
              },
              {
                id: '7',
                title: 'Electricity Bill 10% Discount',
                description: 'Monthly electricity bill reduction for green behavior',
                type: 'utility' as const,
                value: '₹300/month savings',
                eligibilityScore: 75,
                claimed: false,
                expiryDate: '2024-12-31',
                provider: 'DHBVN'
              },
              {
                id: '8',
                title: 'Organic Food Store 15% Off',
                description: 'Discount on organic and sustainable food products',
                type: 'retail' as const,
                value: '₹2,000 savings',
                eligibilityScore: 65,
                claimed: false,
                expiryDate: '2024-11-30',
                provider: 'Nature\'s Basket'
              }
            ]
          };
        })
      ]);

      // Process score data
      const scoreData: PollutionScore = {
        currentScore: scoreResponse.current_score,
        previousScore: scoreResponse.previous_score,
        category: scoreResponse.category,
        lastUpdated: scoreResponse.last_updated,
        weeklyChange: scoreResponse.weekly_change,
        monthlyChange: scoreResponse.monthly_change,
        breakdown: scoreResponse.breakdown,
        improvementTips: scoreResponse.improvement_tips,
        dataSources: scoreResponse.data_sources
      };

      setPollutionScore(scoreData);
      setHotspots(hotspotsResponse.hotspots);
      setRewards(rewardsResponse.rewards || []);
      setLastUpdate(new Date().toLocaleString());

      // Generate mock notifications
      setNotifications([
        {
          id: '1',
          type: 'achievement',
          title: 'New Achievement Unlocked!',
          message: 'You\'ve maintained a green score for 7 days straight!',
          timestamp: new Date().toISOString(),
          severity: 'success'
        },
        {
          id: '2',
          type: 'reward_available',
          title: 'Reward Available',
          message: 'You can now claim a 10% insurance discount!',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'info'
        }
      ]);

    } catch (err) {
      console.error('Error loading pollution data:', err);
      setError('Failed to load pollution data. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const response = await pollutionPassportAPI.fetchLeaderboard(leaderboardCategory, leaderboardTimeframe);
      setLeaderboard(response.leaderboard);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      // Fallback leaderboard data
      setLeaderboard([
        {
          id: '1',
          name: 'Rahul Sharma',
          score: 92,
          rank: 1,
          change: 2,
          badge: 'green',
          location: 'Sector 29',
          achievements: ['Eco Warrior']
        },
        {
          id: '2',
          name: 'You',
          score: pollutionScore?.currentScore || 77,
          rank: 12,
          change: 3,
          badge: 'green',
          location: 'Your Location',
          achievements: ['Green Starter']
        }
      ]);
    }
  };

  // Utility functions
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 55) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-cyan-600';
    if (score >= 55) return 'from-yellow-500 to-amber-600';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'green': return <Award className="w-4 h-4 text-green-500" />;
      case 'yellow': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'red': return <Award className="w-4 h-4 text-red-500" />;
      default: return <Award className="w-4 h-4 text-gray-400" />;
    }
  };

  const claimReward = async (rewardId: string) => {
    try {
      const response = await pollutionPassportAPI.applyForReward(rewardId);
      
      if (response.status === 'success') {
        setQrModal({
          isOpen: true,
          reward: rewards.find(r => r.id === rewardId) || null,
          qrCodeImage: response.qr_code_image,
          couponCode: response.coupon_code
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const refreshData = () => {
    loadPollutionData();
    loadLeaderboard();
  };

  // Calculate savings and metrics
  const calculateSavings = () => {
    const score = pollutionScore?.currentScore || 0;
    const co2Saved = Math.round(score * 2.3); // kg CO2 saved this month
    const moneySaved = Math.round(score * 45); // rupees saved this month
    const treesEquivalent = Math.round(co2Saved / 22); // trees equivalent
    return { co2Saved, moneySaved, treesEquivalent };
  };

  // Load data on component mount and auto-refresh
  useEffect(() => {
    loadPollutionData();
    loadLeaderboard();
  }, [leaderboardCategory, leaderboardTimeframe]);

  const { co2Saved, moneySaved, treesEquivalent } = calculateSavings();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Pollution Passport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🌱 Pollution Passport</h1>
            <p className="text-slate-300">Your personalized air quality and environmental impact tracker</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setNotificationsDrawer({ isOpen: true })}
              className="relative p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={refreshData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-slate-400 text-sm mt-2">Last updated: {lastUpdate}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Section - Score and Key Metrics */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pollution Credit Score */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  Pollution Credit Score
                </h2>
                <button
                  onClick={() => setTipsModal({ isOpen: true })}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              {pollutionScore && (
                <div className="text-center">
                  {/* Score Display */}
                  <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreBackground(pollutionScore.currentScore)} bg-clip-text text-transparent mb-2`}>
                    {pollutionScore.currentScore}
                  </div>
                  <div className="text-slate-400 mb-4">out of 100</div>
                  
                  {/* Score Category */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    pollutionScore.category === 'excellent' ? 'bg-green-900 text-green-300' :
                    pollutionScore.category === 'good' ? 'bg-blue-900 text-blue-300' :
                    pollutionScore.category === 'moderate' ? 'bg-yellow-900 text-yellow-300' :
                    pollutionScore.category === 'poor' ? 'bg-orange-900 text-orange-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {pollutionScore.category.toUpperCase()}
                  </div>
                  
                  {/* Weekly Change */}
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    {pollutionScore.weeklyChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={pollutionScore.weeklyChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {pollutionScore.weeklyChange > 0 ? '+' : ''}{pollutionScore.weeklyChange} this week
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Impact Metrics */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700">
              <div className="flex items-center justify-between mb-2">
                <Leaf className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{co2Saved}kg</span>
              </div>
              <p className="text-green-300 text-sm">CO₂ Saved This Month</p>
              <p className="text-green-400 text-xs mt-1">≈ {treesEquivalent} trees planted</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">₹{moneySaved}</span>
              </div>
              <p className="text-blue-300 text-sm">Money Saved</p>
              <p className="text-blue-400 text-xs mt-1">Transport + Health costs</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">18</span>
              </div>
              <p className="text-purple-300 text-sm">Clean Air Days</p>
              <p className="text-purple-400 text-xs mt-1">Current streak</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Updated Layout */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Score Breakdown & Algorithm */}
          <div className="space-y-6">
            {/* Score Breakdown */}
            {pollutionScore && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  Score Breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(pollutionScore.breakdown).map(([key, data]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium">{data.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreBackground(data.score)}`}
                          style={{ width: `${data.score}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400">{data.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Algorithm Explanation */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-500" />
                How Score is Calculated
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-blue-300">AQI Exposure (40%)</p>
                    <p className="text-slate-400">Real-time tracking using OpenWeatherMap API with exponential decay for high pollution exposure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-green-300">Transport Mode (25%)</p>
                    <p className="text-slate-400">GPS tracking of eco-friendly transport usage and carbon footprint analysis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-yellow-300">Green Zone Time (20%)</p>
                    <p className="text-slate-400">Geofencing technology tracks time spent in parks and clean air zones</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-purple-300">Behavior Pattern (15%)</p>
                    <p className="text-slate-400">AI analysis of pollution-conscious choices and consistency tracking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 border border-indigo-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                Did You Know?
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-indigo-200">🌿 A single tree can absorb 22kg of CO₂ per year</p>
                <p className="text-indigo-200">🚇 Metro emits 70% less CO₂ than private cars</p>
                <p className="text-indigo-200">🏃 Walking 1km saves ₹8 in transport costs</p>
                <p className="text-indigo-200">💨 Good air quality can increase lifespan by 2-3 years</p>
              </div>
            </div>
          </div>

          {/* Center and Right Columns - Full Height Map */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                Real-Time Pollution Map
              </h3>
              <p className="text-sm text-slate-400">Live AQI data from OpenWeatherMap + GDI • Auto-refreshes every 5 minutes</p>
            </div>
            <div style={{ height: '700px' }}>
              <MapContainer
                center={[28.4595, 77.0266]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {hotspots.map((hotspot) => (
                  <CircleMarker
                    key={hotspot.id}
                    center={[hotspot.location.lat, hotspot.location.lng]}
                    radius={8}
                    fillColor={
                      hotspot.risk_level === 'low' ? '#10b981' :
                      hotspot.risk_level === 'moderate' ? '#f59e0b' :
                      hotspot.risk_level === 'high' ? '#ef4444' : '#dc2626'
                    }
                    color="#ffffff"
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.6}
                  >
                    <Popup>
                      <div className="text-slate-900">
                        <h4 className="font-semibold">{hotspot.location.name}</h4>
                        <p>AQI: {hotspot.current_aqi}</p>
                        <p>Dominant: {hotspot.dominant_pollutant}</p>
                        <p className="text-sm text-slate-600">{hotspot.recommendation}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
                <MapAutoRefresh onRefresh={refreshData} />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section - Rewards, Leaderboard, and Quick Actions */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Rewards */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-yellow-500" />
              Available Rewards ({rewards.length})
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {rewards.slice(0, 6).map((reward) => (
                <div key={reward.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{reward.title}</h4>
                    <span className="text-xs text-green-400">{reward.value}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{reward.description}</p>
                  <p className="text-xs text-slate-500 mb-3">Provider: {reward.provider}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Min Score: {reward.eligibilityScore}</span>
                    <button
                      onClick={() => claimReward(reward.id)}
                      disabled={!pollutionScore || pollutionScore.currentScore < reward.eligibilityScore}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-xs transition-colors"
                    >
                      {!pollutionScore || pollutionScore.currentScore < reward.eligibilityScore ? 'Locked' : 'Claim'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Leaderboard
              </h3>
              <select 
                value={leaderboardCategory}
                onChange={(e) => setLeaderboardCategory(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs"
              >
                <option value="individual">Individual</option>
                <option value="society">Society</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leaderboard.slice(0, 10).map((entry) => (
                <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.name === 'You' ? 'bg-blue-900 border border-blue-700' : 'bg-slate-700'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-6">#{entry.rank}</span>
                    {getBadgeIcon(entry.badge)}
                    <div>
                      <p className="text-sm font-medium">{entry.name}</p>
                      <p className="text-xs text-slate-400">{entry.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{entry.score}</p>
                    <div className="flex items-center text-xs">
                      {entry.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={entry.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTransportModal({ isOpen: true })}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm flex flex-col items-center space-y-2"
              >
                <Car className="w-5 h-5" />
                <span>Log Transport</span>
              </button>
              <button 
                onClick={() => setParksModal({ isOpen: true })}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm flex flex-col items-center space-y-2"
              >
                <TreePine className="w-5 h-5" />
                <span>Visit Park</span>
              </button>
              <button className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm flex flex-col items-center space-y-2">
                <Target className="w-5 h-5" />
                <span>Set Goals</span>
              </button>
              <button className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm flex flex-col items-center space-y-2">
                <Users className="w-5 h-5" />
                <span>Invite Friends</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Reward Claimed! 🎉</h3>
              <button 
                onClick={() => setQrModal({ isOpen: false, reward: null, qrCodeImage: '', couponCode: '' })}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {qrModal.qrCodeImage && (
              <div className="text-center mb-4">
                <img 
                  src={qrModal.qrCodeImage} 
                  alt="QR Code" 
                  className="mx-auto mb-4 max-w-48 max-h-48 bg-white p-4 rounded-lg"
                />
                <div className="bg-slate-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-300 mb-2">Coupon Code:</p>
                  <div className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
                    <code className="text-green-400 font-mono">{qrModal.couponCode}</code>
                    <button 
                      onClick={() => copyToClipboard(qrModal.couponCode)}
                      className="p-1 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  Present this QR code or coupon code to claim your reward
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips Modal */}
      {tipsModal.isOpen && pollutionScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                How to Improve Your Score
              </h3>
              <button 
                onClick={() => setTipsModal({ isOpen: false })}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-2">Personalized Recommendations</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  {pollutionScore.improvementTips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium text-green-300 mb-2">Data Sources</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  {pollutionScore.dataSources.map((source, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <ExternalLink className="w-3 h-3 text-green-500" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {notificationsDrawer.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-slate-800 h-full w-96 p-6 border-l border-slate-700 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-500" />
                Notifications
              </h3>
              <button 
                onClick={() => setNotificationsDrawer({ isOpen: false })}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 rounded-lg border ${
                  notification.severity === 'success' ? 'bg-green-900 border-green-700' :
                  notification.severity === 'warning' ? 'bg-yellow-900 border-yellow-700' :
                  notification.severity === 'error' ? 'bg-red-900 border-red-700' :
                  'bg-blue-900 border-blue-700'
                }`}>
                  <h4 className="font-medium mb-1">{notification.title}</h4>
                  <p className="text-sm text-slate-300 mb-2">{notification.message}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transport Modal */}
      {transportModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-500" />
                Log Today's Transport
              </h3>
              <button 
                onClick={() => setTransportModal({ isOpen: false })}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">
              Select the primary mode of transport you used today to update your pollution score:
            </p>
            
            <div className="space-y-3">
              {transportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    // Log transport and update score
                    console.log(`Logged transport: ${option.name}`);
                    setTransportModal({ isOpen: false });
                    // Show success notification
                  }}
                  className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {option.icon}
                      <div>
                        <p className="font-medium">{option.name}</p>
                        <p className="text-xs text-slate-400">{option.carbonFootprint}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        option.scoreImpact > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {option.scoreImpact > 0 ? '+' : ''}{option.scoreImpact} pts
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Parks Modal */}
      {parksModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <TreePine className="w-5 h-5 mr-2 text-green-500" />
                Nearby Parks & Green Zones
              </h3>
              <button 
                onClick={() => setParksModal({ isOpen: false })}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-4">
              Visit these parks to earn green zone credits and improve your pollution score:
            </p>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {nearbyParks.map((park) => (
                <div key={park.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-green-300">{park.name}</h4>
                      <p className="text-sm text-slate-400">{park.distance} away</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        park.cleanAirScore >= 85 ? 'text-green-400' : 
                        park.cleanAirScore >= 70 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {park.cleanAirScore}/100
                      </div>
                      <p className="text-xs text-slate-500">Clean Air Score</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Available Activities:</p>
                    <div className="flex flex-wrap gap-1">
                      {park.activities.map((activity, index) => (
                        <span key={index} className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        console.log(`Getting directions to ${park.name}`);
                        setParksModal({ isOpen: false });
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </button>
                    <button 
                      onClick={() => {
                        console.log(`Checking in at ${park.name}`);
                        setParksModal({ isOpen: false });
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Check In</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollutionPassport; 