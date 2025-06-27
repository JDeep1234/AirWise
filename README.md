# AirWise - Air Quality Monitoring Dashboard

AirWise is a comprehensive air quality monitoring dashboard that provides real-time data, forecasts, historical trends, and health recommendations based on air quality conditions in Gurugram.

## Project Structure

The project consists of two main components:

- **Frontend**: A React application built with TypeScript, Vite, and TailwindCSS
- **Backend**: A Flask API that provides air quality data from OpenWeatherMap

## Features

- Real-time air quality index (AQI) monitoring
- Weather conditions (temperature, humidity, wind)
- Pollutant level tracking (PM2.5, PM10, O₃, NO₂, SO₂, CO)
- 7-day AQI forecasts
- Historical AQI data and trends
- Health recommendations based on current air quality
- Air quality alerts and notifications
- Map visualization of air quality across different areas

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Docker and Docker Compose (for containerized deployment)
- OpenWeatherMap API key (free tier works fine)

## Quick Start

We've provided convenient startup scripts to help you get up and running quickly:

### For Linux/macOS:
```bash
cd codebase
chmod +x start.sh  # Make the script executable if needed
./start.sh
```

### For Windows:
```
cd codebase
start.bat
```

The startup script will:
1. Check for required dependencies
2. Help you set up your OpenWeatherMap API key
3. Give you options to run the app in development or production mode
4. Validate your API key

## API Key Setup

The application uses OpenWeatherMap API to get real-time air quality data for Gurugram. You need to obtain a free API key:

1. Sign up for a free account at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
2. Go to your [API keys](https://home.openweathermap.org/api_keys) page and copy your key
3. Create a `.env` file in the `backend` directory with the following content:
   ```
   OPENWEATHERMAP_API_KEY=your_api_key_here
   ```
4. Replace `your_api_key_here` with your actual API key

To verify your API key is working correctly, run:
```bash
cd codebase/backend
python get_api_key.py
```

## Running the Application

### Development Mode

#### Frontend

```bash
# Navigate to the project root
cd codebase

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend development server will run on http://localhost:5173 by default.

#### Backend

```bash
# Navigate to the backend directory
cd codebase/backend

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend API will run on http://localhost:5000 by default.

### Production Mode (Docker)

To run the entire application stack using Docker:

```bash
# Navigate to the project root
cd codebase

# Add your OpenWeatherMap API key to Docker environment
# Edit docker-compose.yml and add your API key to the backend service:
# environment:
#   - PORT=5000
#   - OPENWEATHERMAP_API_KEY=your_api_key_here

# Build and start the containers
docker-compose up -d

# To stop the containers
docker-compose down
```

The application will be accessible at http://localhost.

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/current` - Get current air quality data
- `GET /api/forecast` - Get air quality forecast for the next 7 days
- `GET /api/historical` - Get historical air quality data
- `GET /api/alerts` - Get active air quality alerts
- `GET /api/recommendations` - Get health recommendations based on current AQI
- `GET /api/geospatial` - Get geospatial air quality data for map visualization

## Tech Stack

### Frontend
- React
- TypeScript
- TailwindCSS
- Vite
- Axios for API calls
- Leaflet for maps
- Lucide for icons

### Backend
- Flask
- Flask-CORS
- OpenWeatherMap API for real-time air quality data
- Python-dotenv for environment variables
- Requests for API communication

## Data Sources

- Real-time air quality data is fetched from OpenWeatherMap's Air Pollution API
- Weather data is fetched from OpenWeatherMap's Current Weather API
- Forecast data is fetched from OpenWeatherMap's Air Pollution Forecast API
- Historical data is currently simulated but could be extended to use a paid API or database storage

## Future Enhancements

- User authentication and personalized dashboards
- Push notifications for air quality alerts
- Integration with additional data sources
- Mobile application
- Comparative analysis with other cities
- Predictive modeling for long-term air quality trends
- MongoDB integration for storing historical data