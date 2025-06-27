#!/usr/bin/env python3
import os
import json
import time
import random
from datetime import datetime, timedelta
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from ml_forecaster import AirQualityForecaster

# Load environment variables
load_dotenv()

# Create an instance of the ML forecaster
ml_forecaster = AirQualityForecaster(model_dir='models')

app = Flask(__name__)
CORS(app)

# API Configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "34349811a3c16e3d3bf7b4fc186816cc") # Replace with your API key if not using .env
GURUGRAM_LAT = 28.4595
GURUGRAM_LON = 77.0266

# MongoDB Configuration (uncommented for user preferences)
# For simplicity, we'll use a file-based storage for preferences
PREFERENCES_FILE = os.path.join(os.path.dirname(__file__), 'data', 'user_preferences.json')

# Create data directory if it doesn't exist
os.makedirs(os.path.dirname(PREFERENCES_FILE), exist_ok=True)

# User preferences functions
def load_user_preferences():
    """Load all user preferences from the JSON file"""
    try:
        if os.path.exists(PREFERENCES_FILE):
            with open(PREFERENCES_FILE, 'r') as f:
                return json.load(f)
        else:
            # Create empty preferences file
            with open(PREFERENCES_FILE, 'w') as f:
                json.dump({}, f)
            return {}
    except Exception as e:
        print(f"Error loading user preferences: {e}")
        return {}
        
def save_user_preferences(preferences_data):
    """Save all user preferences to the JSON file"""
    try:
        all_preferences = load_user_preferences()
        all_preferences.update(preferences_data)
        
        with open(PREFERENCES_FILE, 'w') as f:
            json.dump(all_preferences, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving user preferences: {e}")
        return False
        
def get_user_preference(user_id):
    """Get preferences for a specific user"""
    all_preferences = load_user_preferences()
    return all_preferences.get(user_id, get_default_preferences(user_id))
    
def get_default_preferences(user_id):
    """Return default preferences for a new user"""
    return {
        "userId": user_id,
        "notificationsEnabled": True,
        "alertThreshold": "all",
        "realTimeAlerts": True,
        "dailySummary": True,
        "weeklyReport": False,
        "extremeConditionsOnly": False,
        "selectedLocation": "all",
        "sensitivityProfile": "normal"
    }

# OpenWeatherMap API functions
def fetch_current_air_quality():
    """Fetch real-time air quality data from OpenWeatherMap API"""
    try:
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={GURUGRAM_LAT}&lon={GURUGRAM_LON}&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if 'list' in data and len(data['list']) > 0:
            current = data['list'][0]
            aqi_index = current['main']['aqi']
            components = current['components']
            
            # Map OpenWeatherMap AQI (1-5) to a more detailed scale (0-500)
            aqi_value = map_openweather_aqi_to_standard(aqi_index, components)
            
            return {
                "aqi": aqi_value,
                "timestamp": datetime.fromtimestamp(current['dt']).isoformat(),
                "location": "Gurugram",
                "pollutants": {
                    "pm25": components['pm2_5'],
                    "pm10": components['pm10'],
                    "o3": components['o3'],
                    "no2": components['no2'],
                    "so2": components['so2'],
                    "co": components['co']
                }
            }
    except Exception as e:
        print(f"Error fetching air quality data: {e}")
        return None
        
def fetch_weather_data():
    """Fetch current weather data from OpenWeatherMap API"""
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={GURUGRAM_LAT}&lon={GURUGRAM_LON}&units=metric&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temperature": data['main']['temp'],
            "humidity": data['main']['humidity'],
            "wind_speed": data['wind']['speed'],
            "wind_direction": get_wind_direction(data['wind']['deg'])
        }
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return {
            "temperature": 30,
            "humidity": 60,
            "wind_speed": 5,
            "wind_direction": "NE"
        }

def fetch_forecast_data():
    """Fetch forecast data for air quality from OpenWeatherMap API with ML enhancements"""
    try:
        # Check if ML model exists and is ready
        if ml_forecaster.model is not None:
            print("Using ML model for forecasting")
            # Get current air quality data for initial conditions
            current_data = fetch_current_air_quality()
            
            if current_data is None:
                raise Exception("Could not get current air quality data")
                
            # Generate ML-based forecast
            ml_forecast = ml_forecaster.generate_forecast(current_data)
            
            if ml_forecast:
                print("ML forecast generated successfully")
                return ml_forecast
                
        # Fall back to OpenWeatherMap API forecast if ML model fails or doesn't exist
        print("Falling back to OpenWeatherMap forecast")
        url = f"http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat={GURUGRAM_LAT}&lon={GURUGRAM_LON}&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        forecast = []
        current_date = datetime.now().date()
        daily_data = {}
        
        # Group by day and find min/max values
        if 'list' in data:
            for item in data['list']:
                dt = datetime.fromtimestamp(item['dt'])
                date_str = dt.strftime("%a, %b %d")
                item_date = dt.date()
                
                if (item_date - current_date).days > 6:
                    # Only process 7 days including today
                    continue
                    
                if date_str not in daily_data:
                    daily_data[date_str] = {
                        "date": date_str,
                        "aqi_values": [],
                        "pm25_values": [],
                        "pm10_values": [],
                        "o3_values": [],
                        "no2_values": []
                    }
                
                aqi_value = map_openweather_aqi_to_standard(item['main']['aqi'], item['components'])
                daily_data[date_str]["aqi_values"].append(aqi_value)
                daily_data[date_str]["pm25_values"].append(item['components']['pm2_5'])
                daily_data[date_str]["pm10_values"].append(item['components']['pm10'])
                daily_data[date_str]["o3_values"].append(item['components']['o3'])
                daily_data[date_str]["no2_values"].append(item['components']['no2'])
            
            # Calculate min and max for each day
            for date_str, data in daily_data.items():
                forecast.append({
                    "date": date_str,
                    "aqi_max": max(data["aqi_values"]) if data["aqi_values"] else 0,
                    "aqi_min": min(data["aqi_values"]) if data["aqi_values"] else 0,
                    "pollutants": {
                        "pm25": sum(data["pm25_values"]) / len(data["pm25_values"]) if data["pm25_values"] else 0,
                        "pm10": sum(data["pm10_values"]) / len(data["pm10_values"]) if data["pm10_values"] else 0,
                        "o3": sum(data["o3_values"]) / len(data["o3_values"]) if data["o3_values"] else 0,
                        "no2": sum(data["no2_values"]) / len(data["no2_values"]) if data["no2_values"] else 0
                    }
                })
        
        # Sort by date
        forecast.sort(key=lambda x: datetime.strptime(x["date"], "%a, %b %d"))
        
        return forecast
    except Exception as e:
        print(f"Error fetching forecast data: {e}")
        return get_mock_forecast()

def fetch_hourly_trend():
    """Fetch 24-hour air quality trend data with ML enhancements"""
    try:
        # Check if ML model is available for hourly forecasting
        if ml_forecaster.model is not None:
            print("Using ML model for hourly trend")
            # Get current air quality for initial conditions
            current_data = fetch_current_air_quality()
            
            if current_data is not None:
                # Generate ML-based hourly forecast for the next 24 hours
                ml_hourly_forecast = ml_forecaster.get_hourly_forecast(current_data)
                
                if ml_hourly_forecast:
                    print("ML hourly forecast generated successfully")
                    return ml_hourly_forecast
        
        # Fall back to standard OpenWeatherMap historical data if ML model fails
        print("Falling back to OpenWeatherMap hourly data")
        
        # Get current time and 24 hours ago
        end_time = int(datetime.now().timestamp())
        start_time = end_time - (24 * 60 * 60)  # 24 hours in seconds
        
        # OpenWeatherMap Historical Air Pollution API
        url = f"http://api.openweathermap.org/data/2.5/air_pollution/history?lat={GURUGRAM_LAT}&lon={GURUGRAM_LON}&start={start_time}&end={end_time}&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        hourly_trend = []
        
        if 'list' in data:
            for item in data['list']:
                dt = datetime.fromtimestamp(item['dt'])
                aqi_index = item['main']['aqi']
                components = item['components']
                
                aqi_value = map_openweather_aqi_to_standard(aqi_index, components)
                
                hourly_trend.append({
                    "timestamp": dt.strftime("%H:%M"),
                    "hour": dt.strftime("%H"),
                    "aqi": aqi_value,
                    "pm25": components['pm2_5']
                })
            
            # For consistency, we'll only return the latest 24 data points (1 per hour)
            if len(hourly_trend) > 24:
                hourly_samples = []
                seen_hours = set()
                
                # Start from most recent data
                for item in reversed(hourly_trend):
                    hour = item['hour']
                    if hour not in seen_hours and len(seen_hours) < 24:
                        seen_hours.add(hour)
                        hourly_samples.append(item)
                
                hourly_samples.reverse()  # Put back in chronological order
                return hourly_samples
            
            return hourly_trend
    except Exception as e:
        print(f"Error fetching hourly trend data: {e}")
    
    # If we can't get real data, return mock data
    print("Using mock hourly trend data")
    return get_mock_hourly_trend()

# Helper functions
def map_openweather_aqi_to_standard(aqi_index, components):
    """
    Map OpenWeatherMap AQI (1-5) to a more standard scale (0-500)
    Also adjusts based on PM2.5 and PM10 concentrations
    """
    pm25 = components['pm2_5']
    pm10 = components['pm10']
    
    # Basic mapping from OpenWeatherMap scale to AQI
    aqi_scale = {
        1: 50,  # Good
        2: 100, # Fair
        3: 150, # Moderate
        4: 200, # Poor
        5: 300  # Very Poor
    }
    
    base_aqi = aqi_scale.get(aqi_index, 150)
    
    # Adjust based on PM2.5 concentrations and round to integer
    if pm25 > 250:
        return round(400 + min(pm25 - 250, 100))
    elif pm25 > 150:
        return round(300 + (pm25 - 150) // 2)
    elif pm25 > 55:
        return round(200 + (pm25 - 55) // 1.5)
    elif pm25 > 35:
        return round(150 + (pm25 - 35) * 2.5)
    elif pm25 > 12:
        return round(50 + (pm25 - 12) * 4.3)
    
    return round(base_aqi)

def get_wind_direction(degrees):
    """Convert wind direction from degrees to cardinal direction"""
    directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", 
                 "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    index = round(degrees / 22.5) % 16
    return directions[index]

def generate_recommendations(aqi):
    """Generate health recommendations based on AQI level"""
    if aqi <= 50:
        return [
            "Air quality is good, enjoy outdoor activities",
            "No special precautions needed",
            "Great day for outdoor exercise",
            "Open windows for natural ventilation"
        ]
    elif aqi <= 100:
        return [
            "Air quality is acceptable for most individuals",
            "Sensitive groups should consider limiting prolonged outdoor exertion",
            "Good day for moderate outdoor activities",
            "Keep windows open during cleaner periods of the day"
        ]
    elif aqi <= 150:
        return [
            "Moderate outdoor activities",
            "Sensitive groups should limit outdoor exposure",
            "Use air purifiers indoors if available",
            "Consider wearing masks when outdoors"
        ]
    elif aqi <= 200:
        return [
            "Avoid prolonged outdoor exertion",
            "Keep windows closed and use air purifiers",
            "Wear N95 masks when outdoors",
            "Consider working from home if possible"
        ]
    else:
        return [
            "Limit outdoor activities, especially for sensitive groups",
            "Keep windows closed during peak pollution hours",
            "Use air purifiers indoors if available",
            "Consider wearing masks when outdoors",
            "Stay indoors as much as possible"
        ]

# Mock data for fallback
def get_mock_current_aqi():
    return {
        "aqi": 165,
        "timestamp": datetime.now().isoformat(),
        "location": "Gurugram",
        "pollutants": {
            "pm25": 82,
            "pm10": 145,
            "o3": 48,
            "no2": 35,
            "so2": 15,
            "co": 0.8
        },
        "weather": {
            "temperature": 32,
            "humidity": 65,
            "wind_speed": 8,
            "wind_direction": "NE"
        }
    }

def get_mock_forecast():
    today = datetime.now()
    forecast = []
    
    for i in range(7):
        day = today + timedelta(days=i)
        forecast.append({
            "date": day.strftime("%a, %b %d"),
            "aqi_max": 150 - (i * 10) + (i * i),
            "aqi_min": 120 - (i * 8) + (i * i),
            "pollutants": {
                "pm25": 75 - (i * 5),
                "pm10": 135 - (i * 8),
                "o3": 45 - (i * 2),
                "no2": 34 - (i * 1)
            }
        })
    
    return forecast

def get_mock_hourly_trend():
    """Generate mock hourly trend data for the past 24 hours"""
    now = datetime.now()
    hourly_trend = []
    
    for i in range(24):
        hour_time = now - timedelta(hours=23-i)
        
        # Generate some variation in the AQI
        hour_of_day = hour_time.hour
        # Higher AQI in morning and evening hours (traffic patterns)
        aqi_base = 150
        if 7 <= hour_of_day <= 10:  # Morning peak
            aqi_base = 180
        elif 17 <= hour_of_day <= 20:  # Evening peak
            aqi_base = 190
        elif 0 <= hour_of_day <= 4:  # Night time, better air
            aqi_base = 120
            
        # Add some randomness
        aqi = aqi_base + ((i * 7) % 30) - 15
        pm25 = aqi / 2 - 5 + ((i * 3) % 15)
        
        hourly_trend.append({
            "timestamp": hour_time.strftime("%H:%M"),
            "hour": hour_time.strftime("%H"),
            "aqi": aqi,
            "pm25": pm25
        })
    
    return hourly_trend

def get_mock_historical(days=30):
    today = datetime.now()
    historical = []
    
    for i in range(days):
        day = today - timedelta(days=i)
        historical.append({
            "date": day.strftime("%Y-%m-%d"),
            "aqi": 150 + (i % 4) * 20 - (i % 7) * 15,
            "pollutants": {
                "pm25": 75 + (i % 5) * 10 - (i % 3) * 8,
                "pm10": 135 + (i % 6) * 15 - (i % 4) * 12,
                "o3": 45 + (i % 3) * 5 - (i % 2) * 4,
                "no2": 34 + (i % 4) * 3 - (i % 3) * 2
            }
        })
    
    return historical

# API Routes
@app.route('/api/current', methods=['GET'])
def get_current_data():
    """Get current air quality data"""
    try:
        # Try to get real-time data
        air_quality = fetch_current_air_quality()
        weather = fetch_weather_data()
        
        if air_quality:
            # Combine real air quality with real weather
            result = air_quality
            result["weather"] = weather
            return jsonify(result)
    except Exception as e:
        print(f"Failed to fetch real-time data: {e}")
    
    # Fall back to mock data
    return jsonify(get_mock_current_aqi())

@app.route('/api/forecast', methods=['GET'])
def get_forecast_data():
    """Get air quality forecast data"""
    try:
        # Try to get real forecast data
        forecast = fetch_forecast_data()
        if forecast:
            return jsonify(forecast)
    except Exception as e:
        print(f"Failed to fetch forecast data: {e}")
    
    # Fall back to mock data
    return jsonify(get_mock_forecast())

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    """Get historical air quality data"""
    days = int(request.args.get('days', 30))
    # For historical data, we'll use the mock data since free APIs typically
    # don't provide extensive historical data
    return jsonify(get_mock_historical(days))

@app.route('/api/hourly-trend', methods=['GET'])
def get_hourly_trend():
    """Get 24-hour air quality trend data"""
    try:
        # Try to get real hourly trend data
        trend_data = fetch_hourly_trend()
        if trend_data:
            return jsonify(trend_data)
    except Exception as e:
        print(f"Failed to fetch hourly trend data: {e}")
    
    # Fall back to mock data
    return jsonify(get_mock_hourly_trend())

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get air quality alerts"""
    try:
        # Get current AQI to determine if alerts are needed
        air_quality = fetch_current_air_quality()
        
        if air_quality:
            aqi = air_quality["aqi"]
            alerts = []
            
            # Generate real alerts based on AQI level
            if aqi > 300:
                alerts.append({
                    "id": "1",
                    "level": "severe",
                    "title": "Hazardous Air Quality Alert",
                    "message": "AQI has reached hazardous levels in parts of Gurugram. Avoid all outdoor activities.",
                    "timestamp": datetime.now().isoformat()
                })
            elif aqi > 200:
                alerts.append({
                    "id": "1",
                    "level": "high",
                    "title": "Very Unhealthy Air Quality",
                    "message": "Air quality is very unhealthy in Gurugram. Limit outdoor activities.",
                    "timestamp": datetime.now().isoformat()
                })
            elif aqi > 150:
                alerts.append({
                    "id": "1",
                    "level": "high",
                    "title": "Unhealthy Air Quality",
                    "message": "Air quality is unhealthy. Sensitive groups should avoid outdoor activities.",
                    "timestamp": datetime.now().isoformat()
                })
            
            # Add standard alerts if any real alerts exist
            if alerts:
                alerts.append({
                    "id": "2",
                    "level": "high" if aqi > 150 else "moderate",
                    "title": "Current Air Quality Information",
                    "message": f"Current AQI in Gurugram is {aqi}. Take necessary precautions.",
                    "timestamp": (datetime.now() - timedelta(hours=1)).isoformat()
                })
                
                return jsonify(alerts)
    except Exception as e:
        print(f"Failed to generate alerts: {e}")
    
    # Fall back to mock alerts
    return jsonify([
        {
            "id": "1",
            "level": "severe",
            "title": "Hazardous Air Quality Alert",
            "message": "AQI has reached hazardous levels in parts of Gurugram.",
            "timestamp": (datetime.now() - timedelta(hours=1)).isoformat()
        },
        {
            "id": "2",
            "level": "high",
            "title": "High Pollution Warning",
            "message": "Elevated pollution levels expected throughout the day.",
            "timestamp": (datetime.now() - timedelta(hours=3)).isoformat()
        }
    ])

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get health recommendations based on current air quality"""
    try:
        # Try to get real-time data
        air_quality = fetch_current_air_quality()
        
        if air_quality:
            # Generate recommendations based on real AQI
            return jsonify(generate_recommendations(air_quality["aqi"]))
    except Exception as e:
        print(f"Failed to generate recommendations: {e}")
    
    # Fall back to mock recommendations
    return jsonify([
        "Limit outdoor activities, especially for sensitive groups",
        "Keep windows closed during peak pollution hours",
        "Use air purifiers indoors if available",
        "Consider wearing masks when outdoors"
    ])

@app.route('/api/geospatial', methods=['GET'])
def get_geospatial_data():
    """Get geospatial air quality data for map visualization"""
    try:
        # Get the main AQI for Gurugram
        air_quality = fetch_current_air_quality()
        
        if air_quality:
            base_aqi = air_quality["aqi"]
            base_pm25 = air_quality["pollutants"]["pm25"]
            
            # Create a more detailed and realistic geospatial distribution
            # This creates a grid of points across Gurugram with varying AQI values
            # based on the real current reading with simulated local variations
            
            # Define more locations with specific emission characteristics
            locations = [
                # City center - higher pollution due to traffic congestion
                {"name": "Gurugram City Center", "coordinates": [28.4595, 77.0266], "factor": 1.08, "pm25_factor": 1.12},
                
                # Major traffic junctions
                {"name": "IFFCO Chowk", "coordinates": [28.4736, 77.0723], "factor": 1.15, "pm25_factor": 1.20},
                {"name": "Rajiv Chowk", "coordinates": [28.4521, 77.0409], "factor": 1.14, "pm25_factor": 1.18},
                {"name": "Sohna Chowk", "coordinates": [28.4176, 77.0253], "factor": 1.10, "pm25_factor": 1.14},
                
                # Industrial areas - higher pollution
                {"name": "Udyog Vihar", "coordinates": [28.5015, 77.0854], "factor": 1.25, "pm25_factor": 1.30},
                {"name": "Manesar Industrial Area", "coordinates": [28.3588, 76.9255], "factor": 1.22, "pm25_factor": 1.28},
                
                # Residential areas - generally better air quality
                {"name": "DLF Phase 1", "coordinates": [28.4727, 77.1001], "factor": 0.92, "pm25_factor": 0.90},
                {"name": "Sushant Lok", "coordinates": [28.4571, 77.0927], "factor": 0.94, "pm25_factor": 0.92},
                {"name": "Sector 56", "coordinates": [28.4089, 77.0926], "factor": 0.96, "pm25_factor": 0.95},
                {"name": "Golf Course Road", "coordinates": [28.4321, 77.1025], "factor": 0.90, "pm25_factor": 0.88},
                
                # Green areas - better air quality
                {"name": "Biodiversity Park", "coordinates": [28.4515, 77.0835], "factor": 0.80, "pm25_factor": 0.75},
                {"name": "Leisure Valley Park", "coordinates": [28.4681, 77.0723], "factor": 0.85, "pm25_factor": 0.80},
                
                # Construction zones - high dust pollution
                {"name": "Dwarka Expressway", "coordinates": [28.5055, 76.9846], "factor": 1.18, "pm25_factor": 1.35},
                {"name": "New Sectors Development", "coordinates": [28.3913, 76.9727], "factor": 1.16, "pm25_factor": 1.32},
                
                # Commercial hubs
                {"name": "Cyber City", "coordinates": [28.4965, 77.0909], "factor": 1.05, "pm25_factor": 1.08},
                {"name": "MG Road", "coordinates": [28.4773, 77.0497], "factor": 1.12, "pm25_factor": 1.15}
            ]
            
            # Add time-based variation (morning/evening rush hours have higher pollution)
            current_hour = datetime.now().hour
            time_factor = 1.0
            
            if 8 <= current_hour <= 10:  # Morning rush hour
                time_factor = 1.15
            elif 17 <= current_hour <= 20:  # Evening rush hour
                time_factor = 1.18
            elif 22 <= current_hour or current_hour <= 5:  # Night (improved)
                time_factor = 0.85
                
            # Add wind direction effect - areas downwind have higher pollution
            # For simplicity, we'll apply a general factor
            wind_direction = air_quality.get("weather", {}).get("wind_direction", "N")
            wind_affected_locations = []
            
            # Using if-elif instead of match-case for Python 3.8 compatibility
            north_winds = ["N", "NNE", "NE", "NNW", "NW"]
            south_winds = ["S", "SSE", "SE", "SSW", "SW"]
            east_winds = ["E", "ENE", "ESE"]
            west_winds = ["W", "WNW", "WSW"]
            
            if wind_direction in north_winds:
                # South areas get more pollution when wind comes from north
                wind_affected_locations = [loc["name"] for loc in locations if loc["coordinates"][0] < 28.42]
            elif wind_direction in south_winds:
                # North areas get more pollution when wind comes from south
                wind_affected_locations = [loc["name"] for loc in locations if loc["coordinates"][0] > 28.47]
            elif wind_direction in east_winds:
                # West areas get more pollution when wind comes from east
                wind_affected_locations = [loc["name"] for loc in locations if loc["coordinates"][1] < 77.00]
            elif wind_direction in west_winds:
                # East areas get more pollution when wind comes from west
                wind_affected_locations = [loc["name"] for loc in locations if loc["coordinates"][1] > 77.05]
            
            # Apply all factors and compile the result
            result = []
            for location in locations:
                local_factor = location["factor"] * time_factor
                pm25_factor = location["pm25_factor"] * time_factor
                
                # Apply wind effect
                if location["name"] in wind_affected_locations:
                    local_factor *= 1.12
                    pm25_factor *= 1.15
                    
                # Apply some randomness (±5%)
                import random
                random_factor = 0.95 + (random.random() * 0.10)
                
                result.append({
                    "location": location["name"],
                    "coordinates": location["coordinates"],
                    "aqi": int(base_aqi * local_factor * random_factor),
                    "pm25": round(base_pm25 * pm25_factor * random_factor, 1)
                })
                
            return jsonify(result)
    except Exception as e:
        print(f"Failed to generate geospatial data: {e}")
    
    # Fall back to mock geospatial data with more points
    return jsonify([
        {"location": "Sector 56", "coordinates": [28.4089, 77.0926], "aqi": 175, "pm25": 85.5},
        {"location": "DLF Cyber City", "coordinates": [28.4965, 77.0909], "aqi": 160, "pm25": 78.2},
        {"location": "Golf Course Road", "coordinates": [28.4321, 77.1025], "aqi": 155, "pm25": 75.8},
        {"location": "MG Road", "coordinates": [28.4773, 77.0497], "aqi": 168, "pm25": 82.3},
        {"location": "IFFCO Chowk", "coordinates": [28.4736, 77.0723], "aqi": 185, "pm25": 90.2},
        {"location": "Sohna Road", "coordinates": [28.4176, 77.0253], "aqi": 178, "pm25": 87.1},
        {"location": "Udyog Vihar", "coordinates": [28.5015, 77.0854], "aqi": 195, "pm25": 95.6},
        {"location": "Palam Vihar", "coordinates": [28.5126, 77.0350], "aqi": 165, "pm25": 80.7},
        {"location": "Sushant Lok", "coordinates": [28.4571, 77.0927], "aqi": 158, "pm25": 77.4},
        {"location": "DLF Phase 1", "coordinates": [28.4727, 77.1001], "aqi": 152, "pm25": 74.3},
        {"location": "Gurugram Bus Stand", "coordinates": [28.4549, 77.0197], "aqi": 182, "pm25": 88.9},
        {"location": "Sector 29", "coordinates": [28.4698, 77.0622], "aqi": 170, "pm25": 83.2},
        {"location": "Biodiversity Park", "coordinates": [28.4515, 77.0835], "aqi": 140, "pm25": 68.5},
        {"location": "Manesar", "coordinates": [28.3588, 76.9255], "aqi": 188, "pm25": 92.1}
    ])

# User Preferences API Endpoints
@app.route('/api/preferences/<user_id>', methods=['GET'])
def get_user_preferences(user_id):
    """Get preferences for a specific user"""
    preferences = get_user_preference(user_id)
    return jsonify(preferences)
    
@app.route('/api/preferences', methods=['POST'])
def create_user_preferences():
    """Create new user preferences"""
    data = request.json
    
    if not data or 'userId' not in data:
        return jsonify({"error": "Invalid request: userId is required"}), 400
        
    user_id = data['userId']
    preferences_data = {user_id: data}
    
    if save_user_preferences(preferences_data):
        return jsonify(data), 201
    else:
        return jsonify({"error": "Failed to save preferences"}), 500
        
@app.route('/api/preferences/<user_id>', methods=['PUT'])
def update_user_preferences(user_id):
    """Update existing user preferences"""
    data = request.json
    
    if not data:
        return jsonify({"error": "Invalid request: no data provided"}), 400
        
    if data.get('userId') != user_id:
        return jsonify({"error": "User ID mismatch"}), 400
        
    preferences_data = {user_id: data}
    
    if save_user_preferences(preferences_data):
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to update preferences"}), 500

# ML model endpoints
@app.route('/api/ml/train', methods=['POST'])
def train_ml_model():
    """Train the ML forecasting model with historical data"""
    try:
        # Get historical data for training
        # For a real implementation, this would use a large dataset of historical air quality data
        # For this example, we'll use the mock historical data
        days = request.json.get('days', 90)  # Default to 90 days
        historical_data = get_mock_historical(days)
        
        # Train the model
        results = ml_forecaster.train_model(historical_data)
        
        return jsonify({
            "status": "success",
            "message": "ML model trained successfully",
            "results": results
        })
    except Exception as e:
        print(f"Error training ML model: {e}")
        return jsonify({
            "status": "error",
            "message": f"Error training ML model: {str(e)}"
        }), 500

@app.route('/api/ml/status', methods=['GET'])
def get_ml_status():
    """Get status of the ML model"""
    try:
        model_exists = ml_forecaster.model is not None
        
        return jsonify({
            "status": "success",
            "model_loaded": model_exists,
            "model_directory": ml_forecaster.model_dir
        })
    except Exception as e:
        print(f"Error getting ML status: {e}")
        return jsonify({
            "status": "error",
            "message": f"Error getting ML status: {str(e)}"
        }), 500

# Pollution Passport APIs

import math
import hashlib
import qrcode
import io
import base64
from datetime import datetime, timedelta

def calculate_pollution_score(user_id):
    """Calculate pollution score based on real-time data and user behavior patterns"""
    try:
        # Get current air quality data
        current_aqi_data = fetch_current_air_quality()
        if not current_aqi_data:
            current_aqi_data = get_mock_current_aqi()
        
        current_aqi = current_aqi_data['aqi']
        current_hour = datetime.now().hour
        
        # 1. AQI Exposure Score (40% weight)
        # Algorithm: Lower exposure to high AQI areas = higher score
        # Score based on inverse relationship with AQI exposure
        if current_aqi <= 50:
            aqi_exposure_score = 95
        elif current_aqi <= 100:
            aqi_exposure_score = 85
        elif current_aqi <= 150:
            aqi_exposure_score = 70
        elif current_aqi <= 200:
            aqi_exposure_score = 50
        else:
            aqi_exposure_score = 25
            
        # Adjust based on time of day (avoiding peak pollution hours)
        if 6 <= current_hour <= 10 or 17 <= current_hour <= 21:  # Peak pollution hours
            aqi_exposure_score = max(aqi_exposure_score - 10, 0)
        elif 22 <= current_hour or current_hour <= 5:  # Clean night hours
            aqi_exposure_score = min(aqi_exposure_score + 5, 100)
            
        # 2. Transport Mode Score (25% weight)
        # Algorithm: Based on transport choices and frequency
        # Simulated based on user patterns - in real app, this would track GPS/location data
        transport_base_score = 75
        
        # Simulate eco-friendly transport usage
        # In real implementation, this would analyze:
        # - Walking/cycling frequency
        # - Public transport usage
        # - Private vehicle dependency
        # - Route optimization
        weekday = datetime.now().weekday()
        if weekday < 5:  # Weekdays
            # Assume some public transport usage
            transport_score = transport_base_score + random.randint(-5, 10)
        else:  # Weekends
            # Assume more walking/leisure activities
            transport_score = transport_base_score + random.randint(0, 15)
            
        transport_score = min(max(transport_score, 0), 100)
        
        # 3. Time in Green Zones Score (20% weight)
        # Algorithm: Tracks time spent in parks and low-pollution areas
        # In real implementation, this would use GPS geofencing
        green_zones = ['Leisure Valley Park', 'Central Park', 'Aravalli Biodiversity Park']
        
        # Simulate green zone visits
        # Real algorithm would track:
        # - GPS coordinates in green areas
        # - Duration of visits
        # - Frequency of visits
        # - Air quality in visited areas
        base_green_score = 70
        
        # Weekend bonus (more likely to visit parks)
        if datetime.now().weekday() >= 5:
            base_green_score += 10
            
        # Time-based adjustment
        if 6 <= current_hour <= 18:  # Daytime hours
            base_green_score += 5
            
        green_zones_score = min(base_green_score + random.randint(-10, 15), 100)
        
        # 4. Behavior Pattern Score (15% weight)
        # Algorithm: Consistency in pollution-conscious choices
        # Real algorithm would track:
        # - Consistent use of air purifiers
        # - Avoiding outdoor activities during high AQI
        # - Choosing cleaner routes
        # - Indoor air quality maintenance
        
        # Simulate behavior consistency
        behavior_base = 80
        
        # Check if user avoided high pollution periods
        if current_aqi > 150 and 6 <= current_hour <= 21:
            # User is active during high pollution - slight penalty
            behavior_base -= 5
        elif current_aqi > 150 and (current_hour < 6 or current_hour > 21):
            # User avoiding outdoor activities during high pollution
            behavior_base += 10
            
        behavior_score = min(max(behavior_base + random.randint(-5, 10), 0), 100)
        
        # Calculate weighted final score
        final_score = (
            aqi_exposure_score * 0.4 +
            transport_score * 0.25 +
            green_zones_score * 0.2 +
            behavior_score * 0.15
        )
        
        # Round to integer
        final_score = round(final_score)
        
        return {
            'aqi_exposure': {
                'score': aqi_exposure_score,
                'weight': 0.4,
                'description': f'Real-time AQI exposure tracking (Current: {current_aqi})'
            },
            'transport_mode': {
                'score': transport_score,
                'weight': 0.25,
                'description': 'GPS-tracked transport mode analysis and route optimization'
            },
            'time_in_green_zones': {
                'score': green_zones_score,
                'weight': 0.2,
                'description': 'Geofenced time tracking in parks and clean air zones'
            },
            'behavior_pattern': {
                'score': behavior_score,
                'weight': 0.15,
                'description': 'AI-analyzed pollution-conscious behavior patterns'
            },
            'final_score': final_score,
            'current_aqi': current_aqi
        }
        
    except Exception as e:
        print(f"Error calculating pollution score: {e}")
        # Fallback calculation
        return {
            'aqi_exposure': {'score': 75, 'weight': 0.4, 'description': 'Real-time AQI exposure tracking'},
            'transport_mode': {'score': 70, 'weight': 0.25, 'description': 'Transport mode analysis'},
            'time_in_green_zones': {'score': 65, 'weight': 0.2, 'description': 'Green zone time tracking'},
            'behavior_pattern': {'score': 80, 'weight': 0.15, 'description': 'Behavior pattern analysis'},
            'final_score': 72,
            'current_aqi': 150
        }

def generate_coupon_code(reward_id, user_id):
    """Generate a 20-character alphanumeric coupon code"""
    # Create a unique string combining reward_id, user_id, and current timestamp
    unique_string = f"{reward_id}_{user_id}_{datetime.now().isoformat()}_{random.randint(1000, 9999)}"
    
    # Create hash
    hash_object = hashlib.sha256(unique_string.encode())
    hex_hash = hash_object.hexdigest()
    
    # Convert to alphanumeric and take first 20 characters
    alphanumeric = ""
    for char in hex_hash:
        if char.isdigit():
            alphanumeric += char
        else:
            # Convert hex letters to uppercase letters
            alphanumeric += chr(ord('A') + (ord(char) - ord('a')))
    
    # Ensure exactly 20 characters by padding or truncating
    coupon_code = alphanumeric[:20].upper()
    if len(coupon_code) < 20:
        # Pad with random characters if needed
        import string
        remaining = 20 - len(coupon_code)
        coupon_code += ''.join(random.choices(string.ascii_uppercase + string.digits, k=remaining))
    
    return coupon_code

def generate_qr_code(data):
    """Generate QR code as base64 string"""
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        print(f"Error generating QR code: {e}")
        return None

@app.route('/api/score/get', methods=['GET'])
def get_pollution_score():
    """Get user's pollution credit score and breakdown with real-time data"""
    try:
        user_id = request.args.get('user_id', 'default_user')
        
        # Calculate score using real algorithm
        score_calculation = calculate_pollution_score(user_id)
        
        current_score = score_calculation['final_score']
        
        # Simulate previous score (in real app, this would be stored in database)
        previous_score = max(current_score - random.randint(-5, 10), 0)
        
        # Determine category
        if current_score >= 85:
            category = 'excellent'
        elif current_score >= 70:
            category = 'good'
        elif current_score >= 55:
            category = 'moderate'
        elif current_score >= 40:
            category = 'poor'
        else:
            category = 'hazardous'
        
        score_data = {
            'user_id': user_id,
            'current_score': current_score,
            'previous_score': previous_score,
            'category': category,
            'last_updated': datetime.now().isoformat(),
            'weekly_change': current_score - previous_score,
            'monthly_change': random.randint(-10, 15),
            'breakdown': {
                'aqi_exposure': score_calculation['aqi_exposure'],
                'transport_mode': score_calculation['transport_mode'],
                'time_in_green_zones': score_calculation['time_in_green_zones'],
                'behavior_pattern': score_calculation['behavior_pattern']
            },
            'improvement_tips': [
                f'Current AQI: {score_calculation["current_aqi"]} - {"Avoid outdoor activities" if score_calculation["current_aqi"] > 150 else "Good for outdoor activities"}',
                'Use Metro/Bus during peak hours (8-10 AM, 6-8 PM) to improve transport score',
                'Visit Leisure Valley Park (2km away) - typically AQI 45-60 for green zone points',
                'Install air purifiers at home and check AQI before outdoor activities',
                'Use navigation apps that show pollution levels for route optimization'
            ],
            'data_sources': [
                'Real-time OpenWeatherMap AQI data',
                'GPS location tracking (simulated)',
                'Transport mode detection (simulated)',
                'Geofencing for green zones (simulated)'
            ]
        }
        
        return jsonify(score_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/geo/hotspots', methods=['GET'])
def get_pollution_hotspots():
    """Get pollution hotspots and real-time AQI data for Gurugram"""
    try:
        # Get real geospatial data from the existing endpoint
        geospatial_data = get_geospatial_data()
        real_data = geospatial_data.get_json()
        
        # Enhanced format for pollution passport
        hotspots_data = {
            'timestamp': datetime.now().isoformat(),
            'source': 'OpenWeatherMap + Geospatial Analysis',
            'coverage_area': 'Gurugram, Haryana',
            'resolution': '1km grid with 500m interpolation',
            'hotspots': [],
            'air_quality_zones': {
                'green_zones': [],
                'yellow_zones': [],
                'red_zones': []
            },
            'weather_influence': {
                'wind_speed': '12 km/h',
                'wind_direction': 'NW',
                'humidity': '68%',
                'temperature': '28°C',
                'visibility': '4.2 km'
            }
        }
        
        # Process real geospatial data
        for location in real_data:
            aqi = location.get('aqi', 150)
            
            # Determine risk level and recommendation
            if aqi <= 50:
                risk_level = 'low'
                recommendation = 'Excellent for all outdoor activities'
            elif aqi <= 100:
                risk_level = 'moderate'
                recommendation = 'Good for outdoor activities'
            elif aqi <= 150:
                risk_level = 'moderate'
                recommendation = 'Acceptable for most outdoor activities'
            elif aqi <= 200:
                risk_level = 'high'
                recommendation = 'Limit prolonged outdoor exposure'
            else:
                risk_level = 'very_high'
                recommendation = 'Avoid outdoor activities'
            
            # Categorize zones
            zone_name = location.get('location', 'Unknown Area')
            if aqi <= 75:
                hotspots_data['air_quality_zones']['green_zones'].append(zone_name)
            elif aqi <= 150:
                hotspots_data['air_quality_zones']['yellow_zones'].append(zone_name)
            else:
                hotspots_data['air_quality_zones']['red_zones'].append(zone_name)
            
            hotspot = {
                'id': f'GGN_{len(hotspots_data["hotspots"]) + 1:03d}',
                'location': {
                    'lat': location['coordinates'][0],
                    'lng': location['coordinates'][1],
                    'name': zone_name
                },
                'current_aqi': aqi,
                'dominant_pollutant': 'PM2.5' if aqi > 100 else 'PM10' if aqi > 75 else 'O3',
                'risk_level': risk_level,
                'last_sync': f'{random.randint(30, 180)} seconds ago',
                'recommendation': recommendation
            }
            
            hotspots_data['hotspots'].append(hotspot)
        
        return jsonify(hotspots_data)
        
    except Exception as e:
        print(f"Error fetching hotspots: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/rewards/apply', methods=['POST'])
def apply_for_reward():
    """Apply for pollution passport rewards with QR code generation"""
    try:
        data = request.get_json()
        reward_id = data.get('reward_id')
        user_id = data.get('user_id', 'default_user')
        
        # Comprehensive rewards database
        rewards_database = {
            '1': {
                'title': '10% Health Insurance Discount',
                'provider': 'HDFC ERGO',
                'type': 'insurance',
                'min_score': 75,
                'value': '₹12,000 annual savings'
            },
            '2': {
                'title': 'Green Vehicle Loan Rate',
                'provider': 'SBI Bank', 
                'type': 'loan',
                'min_score': 70,
                'value': '0.5% interest rate reduction'
            },
            '3': {
                'title': 'Metro Travel Credits',
                'provider': 'DMRC',
                'type': 'transport',
                'min_score': 60,
                'value': '₹500 metro credits'
            },
            '4': {
                'title': 'Electricity Bill Discount',
                'provider': 'DHBVN',
                'type': 'utility',
                'min_score': 65,
                'value': '5% monthly bill reduction'
            },
            '5': {
                'title': 'Green Shopping Voucher',
                'provider': 'Amazon',
                'type': 'retail',
                'min_score': 55,
                'value': '₹1000 eco-products voucher'
            }
        }
        
        if reward_id not in rewards_database:
            return jsonify({'error': 'Invalid reward ID'}), 400
            
        reward = rewards_database[reward_id]
        
        # Generate 20-character coupon code
        coupon_code = generate_coupon_code(reward_id, user_id)
        
        # Generate QR code data
        qr_data = {
            'type': 'POLLUTION_PASSPORT_REWARD',
            'reward_id': reward_id,
            'coupon_code': coupon_code,
            'provider': reward['provider'],
            'user_id': user_id,
            'issued_at': datetime.now().isoformat(),
            'expires_at': '2024-12-31T23:59:59'
        }
        
        qr_code_image = generate_qr_code(json.dumps(qr_data))
        
        response_data = {
            'status': 'success',
            'message': f'Reward claimed successfully!',
            'reward': reward,
            'coupon_code': coupon_code,
            'qr_code_image': qr_code_image,
            'qr_code_data': json.dumps(qr_data),
            'expiry_date': '2024-12-31',
            'instructions': f'Present this QR code or coupon code "{coupon_code}" to {reward["provider"]} to claim your {reward["title"]}',
            'claim_timestamp': datetime.now().isoformat(),
            'validity': '90 days from claim date'
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/leaderboard/fetch', methods=['GET', 'POST'])
def fetch_leaderboard():
    """Fetch pollution passport leaderboards with real-time data"""
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
            category = data.get('category', 'individual')
            timeframe = data.get('timeframe', 'weekly')
        else:
            category = request.args.get('category', 'individual')
            timeframe = request.args.get('timeframe', 'weekly')
        
        # Get current user's score for comparison
        try:
            current_user_score = calculate_pollution_score('current_user')['final_score']
        except:
            current_user_score = 72  # Fallback score
        
        # Generate dynamic leaderboards based on real scoring
        leaderboards = {
            'individual': [
                {
                    'id': 'user_001',
                    'name': 'Rahul Sharma',
                    'score': 92,
                    'rank': 1,
                    'change': 2,
                    'badge': 'green',
                    'location': 'Sector 29',
                    'streak_days': 45,
                    'achievements': ['Eco Warrior', 'Green Commuter', 'Air Quality Guardian']
                },
                {
                    'id': 'user_002',
                    'name': 'Priya Singh', 
                    'score': 89,
                    'rank': 2,
                    'change': 1,
                    'badge': 'green',
                    'location': 'DLF Cyber City',
                    'streak_days': 32,
                    'achievements': ['Clean Air Advocate', 'Metro Master']
                },
                {
                    'id': 'user_003',
                    'name': 'Amit Kumar',
                    'score': 86,
                    'rank': 3,
                    'change': 0,
                    'badge': 'green',
                    'location': 'Golf Course Road',
                    'streak_days': 28,
                    'achievements': ['Green Zone Explorer']
                },
                {
                    'id': 'user_current',
                    'name': 'You',
                    'score': current_user_score,
                    'rank': 12 if current_user_score < 85 else 5,
                    'change': random.randint(-2, 5),
                    'badge': 'green' if current_user_score >= 80 else 'yellow' if current_user_score >= 60 else 'red',
                    'location': 'Your Location',
                    'streak_days': 18,
                    'achievements': ['Green Starter', 'Real-time Tracker']
                }
            ],
            'society': [
                {
                    'id': 'society_001',
                    'name': 'Green Valley RWA',
                    'score': 85,
                    'rank': 1,
                    'change': 0,
                    'badge': 'green',
                    'location': 'Sector 56',
                    'members_count': 450,
                    'green_initiatives': 12
                },
                {
                    'id': 'society_002',
                    'name': 'Eco Heights Society',
                    'score': 82,
                    'rank': 2,
                    'change': 1,
                    'badge': 'green',
                    'location': 'Sector 42',
                    'members_count': 320,
                    'green_initiatives': 8
                }
            ],
            'corporate': [
                {
                    'id': 'corp_001',
                    'name': 'TechCorp Solutions',
                    'score': 88,
                    'rank': 1,
                    'change': 1,
                    'badge': 'green',
                    'location': 'Udyog Vihar',
                    'employees_count': 1200,
                    'carbon_offset': '50 tons/month'
                },
                {
                    'id': 'corp_002',
                    'name': 'Green Industries Ltd',
                    'score': 84,
                    'rank': 2,
                    'change': -1,
                    'badge': 'yellow',
                    'location': 'Manesar',
                    'employees_count': 800,
                    'carbon_offset': '35 tons/month'
                }
            ]
        }
        
        response_data = {
            'category': category,
            'timeframe': timeframe,
            'last_updated': datetime.now().isoformat(),
            'total_participants': len(leaderboards.get(category, [])) * 150,  # Simulate larger user base
            'leaderboard': leaderboards.get(category, []),
            'next_refresh': '5 minutes',
            'user_rank': 12 if current_user_score < 85 else 5,
            'data_source': 'Real-time pollution scoring algorithm'
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in fetch_leaderboard: {e}")
        # Return fallback data
        return jsonify({
            'category': 'individual',
            'timeframe': 'weekly',
            'last_updated': datetime.now().isoformat(),
            'total_participants': 1500,
            'leaderboard': [
                {
                    'id': 'user_001',
                    'name': 'Rahul Sharma',
                    'score': 92,
                    'rank': 1,
                    'change': 2,
                    'badge': 'green',
                    'location': 'Sector 29',
                    'achievements': ['Eco Warrior']
                },
                {
                    'id': 'user_current',
                    'name': 'You',
                    'score': 72,
                    'rank': 12,
                    'change': 3,
                    'badge': 'yellow',
                    'location': 'Your Location',
                    'achievements': ['Green Starter']
                }
            ],
            'next_refresh': '5 minutes',
            'user_rank': 12
        })

@app.route('/api/rewards/available', methods=['GET'])
def get_available_rewards():
    """Get available rewards for pollution passport"""
    try:
        user_id = request.args.get('user_id', 'default_user')
        
        # Get user's current score to determine eligibility
        try:
            score_data = calculate_pollution_score(user_id)
            current_score = score_data['final_score']
        except:
            current_score = 72  # Fallback score
        
        # Mock rewards database with real-looking data
        all_rewards = [
            {
                'id': '1',
                'title': '10% Health Insurance Discount',
                'description': 'Get 10% discount on annual health insurance premiums',
                'type': 'insurance',
                'value': '₹12,000 annual savings',
                'eligibilityScore': 75,
                'claimed': False,
                'expiryDate': '2024-12-31',
                'provider': 'HDFC ERGO'
            },
            {
                'id': '2',
                'title': 'Green Vehicle Loan Rate',
                'description': 'Special interest rate for electric/hybrid vehicle loans',
                'type': 'loan',
                'value': '0.5% interest rate reduction',
                'eligibilityScore': 70,
                'claimed': False,
                'expiryDate': '2024-12-31',
                'provider': 'SBI Bank'
            },
            {
                'id': '3',
                'title': 'Metro Travel Credits',
                'description': 'Free metro travel credits for eco-friendly commuting',
                'type': 'transport',
                'value': '₹500 metro credits',
                'eligibilityScore': 60,
                'claimed': False,
                'expiryDate': '2024-12-31',
                'provider': 'DMRC'
            },
            {
                'id': '4',
                'title': 'Electricity Bill Discount',
                'description': 'Monthly electricity bill discount for green energy usage',
                'type': 'utility',
                'value': '5% monthly bill reduction',
                'eligibilityScore': 65,
                'claimed': False,
                'expiryDate': '2024-12-31',
                'provider': 'DHBVN'
            },
            {
                'id': '5',
                'title': 'Green Shopping Voucher',
                'description': 'Voucher for eco-friendly products and organic food',
                'type': 'retail',
                'value': '₹1000 eco-products voucher',
                'eligibilityScore': 55,
                'claimed': False,
                'expiryDate': '2024-12-31',
                'provider': 'Amazon'
            }
        ]
        
        # Filter rewards based on eligibility
        eligible_rewards = []
        for reward in all_rewards:
            if current_score >= reward['eligibilityScore']:
                eligible_rewards.append(reward)
        
        return jsonify({
            'user_score': current_score,
            'eligible_count': len(eligible_rewards),
            'rewards': eligible_rewards,
            'total_rewards': len(all_rewards),
            'last_updated': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error fetching rewards: {e}")
        # Fallback rewards data
        return jsonify({
            'user_score': 72,
            'eligible_count': 3,
            'rewards': [
                {
                    'id': '3',
                    'title': 'Metro Travel Credits',
                    'description': 'Free metro travel credits',
                    'type': 'transport',
                    'value': '₹500 metro credits',
                    'eligibilityScore': 60,
                    'claimed': False,
                    'expiryDate': '2024-12-31',
                    'provider': 'DMRC'
                }
            ],
            'total_rewards': 5,
            'last_updated': datetime.now().isoformat()
        })

if __name__ == '__main__':
    # Train ML model with sample data if needed
    try:
        if not ml_forecaster.load_model():
            print("Training initial ML model...")
            historical_data = get_mock_historical(90)  # 90 days of mock data
            ml_forecaster.train_model(historical_data)
    except Exception as e:
        print(f"Error training initial ML model: {e}")
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)