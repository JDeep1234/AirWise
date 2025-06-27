#!/usr/bin/env python
"""
Helper script to check if your OpenWeatherMap API key is working correctly.
This can be used to verify your setup before running the main application.
"""

import os
import requests
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENWEATHER_API_KEY = os.getenv("34349811a3c16e3d3bf7b4fc186816cc")
GURUGRAM_LAT = 28.4595
GURUGRAM_LON = 77.0266

def check_api_key():
    """Check if the OpenWeatherMap API key is working correctly."""
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_api_key_here":
        print("Error: API key not found. Please set the OPENWEATHERMAP_API_KEY environment variable.")
        print("You can get a free API key from https://openweathermap.org/api")
        print("\nSet the API key in one of the following ways:")
        print("1. Create a .env file in the backend directory with the line:")
        print("   OPENWEATHERMAP_API_KEY=your_api_key_here")
        print("2. Set it as an environment variable before running the app:")
        print("   export OPENWEATHERMAP_API_KEY=your_api_key_here")
        return False
    
    try:
        # Test the API key with a simple weather request
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={GURUGRAM_LAT}&lon={GURUGRAM_LON}&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            city = data.get('name', 'Unknown')
            temp = data.get('main', {}).get('temp', 'N/A')
            print(f"API key is working correctly!")
            print(f"Successfully retrieved weather data for {city}")
            print(f"Current temperature (Kelvin): {temp}")
            return True
        elif response.status_code == 401:
            print("Error: Invalid API key. Please check your OpenWeatherMap API key.")
            return False
        else:
            print(f"Error: Unexpected response (code {response.status_code})")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: Failed to connect to OpenWeatherMap API: {e}")
        return False

if __name__ == "__main__":
    print("OpenWeatherMap API Key Checker")
    print("==============================")
    
    success = check_api_key()
    
    if success:
        # Also test air quality endpoint
        try:
            url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={GURUGRAM_LAT}&lon={GURUGRAM_LON}&appid={OPENWEATHER_API_KEY}"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if 'list' in data and len(data['list']) > 0:
                    aqi = data['list'][0]['main']['aqi']
                    pm25 = data['list'][0]['components']['pm2_5']
                    print("\nAir Quality API is also working!")
                    print(f"Current AQI index for Gurugram: {aqi} (on a scale of 1-5)")
                    print(f"Current PM2.5 level: {pm25} μg/m³")
                else:
                    print("\nWarning: Air Quality API response format unexpected")
            else:
                print(f"\nWarning: Air Quality API returned status code {response.status_code}")
        except Exception as e:
            print(f"\nWarning: Failed to test Air Quality API: {e}")
        
        print("\nYour setup is ready. Run app.py to start the server.")
        sys.exit(0)
    else:
        print("\nPlease fix the issues above and try again.")
        sys.exit(1) 