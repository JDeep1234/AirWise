// Mock data for development purposes
// In production, this would be replaced with actual API calls

// Type definitions to ensure consistency with components
type PollutantLevel = 'high' | 'moderate' | 'low' | 'very-high' | 'hazardous';
type UpdateType = 'warning' | 'info' | 'success';

interface Pollutant {
  name: string;
  value: number;
  unit: string;
  level: PollutantLevel;
}

interface Update {
  id: string;
  type: UpdateType;
  message: string;
  time: string;
}

// Dashboard Data
export const mockAirQualityData = {
  aqi: 165,
  weather: {
    temperature: 32,
    humidity: 65,
    windSpeed: 8
  },
  pollutants: [
    { name: 'PM2.5', value: 82, unit: 'µg/m³', level: 'high' as PollutantLevel },
    { name: 'PM10', value: 145, unit: 'µg/m³', level: 'high' as PollutantLevel },
    { name: 'O₃', value: 48, unit: 'µg/m³', level: 'moderate' as PollutantLevel },
    { name: 'NO₂', value: 35, unit: 'µg/m³', level: 'moderate' as PollutantLevel },
    { name: 'SO₂', value: 15, unit: 'µg/m³', level: 'low' as PollutantLevel },
    { name: 'CO', value: 0.8, unit: 'mg/m³', level: 'low' as PollutantLevel }
  ],
  hourlyData: [
    { hour: '00:00', aqi: 145 },
    { hour: '04:00', aqi: 132 },
    { hour: '08:00', aqi: 178 },
    { hour: '12:00', aqi: 165 },
    { hour: '16:00', aqi: 152 },
    { hour: '20:00', aqi: 160 }
  ],
  updates: [
    { id: '1', type: 'warning' as UpdateType, message: 'AQI levels elevated due to increased traffic and industrial activity.', time: '2 hours ago' },
    { id: '2', type: 'info' as UpdateType, message: 'Weather forecast indicates light rain tonight which may improve air quality.', time: '4 hours ago' },
    { id: '3', type: 'success' as UpdateType, message: 'PM2.5 levels have decreased by 15% over the past 24 hours.', time: '8 hours ago' },
    { id: '4', type: 'info' as UpdateType, message: 'New air quality sensor installed in Sector 56.', time: '1 day ago' }
  ]
};

// Forecast Data
export const mockForecastData = [
  {
    date: 'Today (Oct 15)',
    maxAQI: 165,
    hourly: [
      { time: '06:00', aqi: 145, pm25: 72, pm10: 132, wind: 5 },
      { time: '12:00', aqi: 165, pm25: 82, pm10: 145, wind: 8 },
      { time: '18:00', aqi: 178, pm25: 88, pm10: 156, wind: 6 },
      { time: '00:00', aqi: 145, pm25: 72, pm10: 132, wind: 4 }
    ],
    recommendations: [
      'Limit outdoor activities, especially for sensitive groups',
      'Keep windows closed during peak pollution hours',
      'Use air purifiers indoors if available',
      'Consider wearing masks when outdoors'
    ]
  },
  {
    date: 'Tomorrow (Oct 16)',
    maxAQI: 182,
    hourly: [
      { time: '06:00', aqi: 155, pm25: 77, pm10: 140, wind: 4 },
      { time: '12:00', aqi: 182, pm25: 90, pm10: 160, wind: 7 },
      { time: '18:00', aqi: 175, pm25: 87, pm10: 154, wind: 6 },
      { time: '00:00', aqi: 150, pm25: 74, pm10: 135, wind: 3 }
    ],
    recommendations: [
      'Avoid prolonged outdoor exertion',
      'Keep windows closed and use air purifiers',
      'Wear N95 masks when outdoors',
      'Consider working from home if possible'
    ]
  },
  {
    date: 'Friday (Oct 17)',
    maxAQI: 145,
    hourly: [
      { time: '06:00', aqi: 125, pm25: 62, pm10: 115, wind: 8 },
      { time: '12:00', aqi: 145, pm25: 72, pm10: 130, wind: 10 },
      { time: '18:00', aqi: 138, pm25: 68, pm10: 125, wind: 9 },
      { time: '00:00', aqi: 120, pm25: 60, pm10: 110, wind: 7 }
    ],
    recommendations: [
      'Moderate outdoor activities',
      'Open windows during afternoon when AQI is slightly better',
      'Continue using air purifiers indoors',
      'Sensitive groups should still limit outdoor exposure'
    ]
  },
  {
    date: 'Saturday (Oct 18)',
    maxAQI: 120,
    hourly: [
      { time: '06:00', aqi: 105, pm25: 52, pm10: 95, wind: 12 },
      { time: '12:00', aqi: 120, pm25: 60, pm10: 110, wind: 15 },
      { time: '18:00', aqi: 115, pm25: 57, pm10: 105, wind: 14 },
      { time: '00:00', aqi: 100, pm25: 50, pm10: 90, wind: 10 }
    ],
    recommendations: [
      'Air quality improving - moderate outdoor activities acceptable',
      'Window ventilation recommended during cleaner periods',
      'Continue monitoring for sensitive individuals',
      'Good day for outdoor exercise in the morning'
    ]
  },
  {
    date: 'Sunday (Oct 19)',
    maxAQI: 95,
    hourly: [
      { time: '06:00', aqi: 85, pm25: 42, pm10: 78, wind: 14 },
      { time: '12:00', aqi: 95, pm25: 47, pm10: 88, wind: 16 },
      { time: '18:00', aqi: 90, pm25: 45, pm10: 82, wind: 15 },
      { time: '00:00', aqi: 80, pm25: 40, pm10: 75, wind: 12 }
    ],
    recommendations: [
      'Good day for outdoor activities',
      'Open windows for natural ventilation',
      'Sensitive groups can engage in light outdoor activities',
      'Enjoy parks and outdoor spaces'
    ]
  },
  {
    date: 'Monday (Oct 20)',
    maxAQI: 115,
    hourly: [
      { time: '06:00', aqi: 100, pm25: 50, pm10: 92, wind: 10 },
      { time: '12:00', aqi: 115, pm25: 57, pm10: 105, wind: 8 },
      { time: '18:00', aqi: 110, pm25: 55, pm10: 100, wind: 7 },
      { time: '00:00', aqi: 95, pm25: 47, pm10: 88, wind: 6 }
    ],
    recommendations: [
      'Moderate outdoor activities recommended',
      'Air quality acceptable for most individuals',
      'Monitor conditions if you have respiratory issues',
      'Keep windows open during cleaner periods of the day'
    ]
  },
  {
    date: 'Tuesday (Oct 21)',
    maxAQI: 132,
    hourly: [
      { time: '06:00', aqi: 115, pm25: 57, pm10: 105, wind: 7 },
      { time: '12:00', aqi: 132, pm25: 66, pm10: 120, wind: 6 },
      { time: '18:00', aqi: 125, pm25: 62, pm10: 115, wind: 5 },
      { time: '00:00', aqi: 110, pm25: 55, pm10: 100, wind: 4 }
    ],
    recommendations: [
      'Limit strenuous outdoor activities',
      'Keep windows closed during peak pollution periods',
      'Use air purifiers if available',
      'Sensitive groups should reduce prolonged outdoor exposure'
    ]
  }
];

// Historical Data
export const mockHistoricalData = [
  { date: 'Oct 14, 2024', aqi: 158, pm25: 78, pm10: 142, o3: 45, no2: 38 },
  { date: 'Oct 13, 2024', aqi: 172, pm25: 86, pm10: 155, o3: 48, no2: 41 },
  { date: 'Oct 12, 2024', aqi: 165, pm25: 82, pm10: 148, o3: 42, no2: 37 },
  { date: 'Oct 11, 2024', aqi: 145, pm25: 72, pm10: 131, o3: 40, no2: 35 },
  { date: 'Oct 10, 2024', aqi: 138, pm25: 69, pm10: 125, o3: 38, no2: 33 },
  { date: 'Oct 9, 2024', aqi: 152, pm25: 76, pm10: 137, o3: 43, no2: 36 },
  { date: 'Oct 8, 2024', aqi: 167, pm25: 83, pm10: 150, o3: 46, no2: 39 },
  { date: 'Oct 7, 2024', aqi: 175, pm25: 87, pm10: 158, o3: 49, no2: 42 },
  { date: 'Oct 6, 2024', aqi: 155, pm25: 77, pm10: 140, o3: 44, no2: 37 },
  { date: 'Oct 5, 2024', aqi: 135, pm25: 67, pm10: 122, o3: 37, no2: 32 }
];

// Alerts Data
export const mockAlerts = [
  {
    id: '1',
    level: 'severe',
    title: 'Hazardous Air Quality Alert',
    message: 'AQI has reached hazardous levels in parts of Gurugram. Avoid all outdoor activities and keep windows closed.',
    time: '1 hour ago'
  },
  {
    id: '2',
    level: 'high',
    title: 'High Pollution Warning',
    message: 'Elevated pollution levels expected throughout the day due to weather conditions and local emissions.',
    time: '3 hours ago'
  },
  {
    id: '3',
    level: 'moderate',
    title: 'Sensitive Groups Advisory',
    message: 'Children, elderly, and those with respiratory conditions should limit outdoor exposure today.',
    time: '6 hours ago'
  },
  {
    id: '4',
    level: 'low',
    title: 'Air Quality Improving',
    message: 'Air quality expected to improve throughout the afternoon due to increasing wind speeds.',
    time: '8 hours ago'
  },
  {
    id: '5',
    level: 'high',
    title: 'School Activity Warning',
    message: 'Recommend schools to limit outdoor activities for students until air quality improves.',
    time: '10 hours ago'
  },
  {
    id: '6',
    level: 'moderate',
    title: 'Evening Deterioration Expected',
    message: 'Air quality likely to worsen after sunset due to temperature inversion. Plan activities accordingly.',
    time: '12 hours ago'
  },
  {
    id: '7',
    level: 'high',
    title: 'Construction Site Advisory',
    message: 'All construction sites in Gurugram advised to implement dust control measures with increased vigilance.',
    time: '1 day ago'
  },
  {
    id: '8',
    level: 'low',
    title: 'Weekend Forecast Update',
    message: 'Air quality expected to improve over the weekend due to forecasted rainfall.',
    time: '1 day ago'
  }
];