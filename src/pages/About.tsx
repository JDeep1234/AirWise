import React from 'react';
import { Wind, BarChart, Activity, AlertTriangle, Info, GitBranch, Users, Shield, Code, Database } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">About AirWise</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          AirWise is a comprehensive air quality monitoring dashboard that provides real-time data, forecasts, 
          historical trends, and health recommendations based on air quality conditions in Gurugram.
        </p>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Info className="mr-2 text-blue-500" size={24} />
          About the Project
        </h2>
        <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            AirWise was developed to provide Gurugram residents with accurate, real-time air quality information
            to help them make informed decisions about outdoor activities and health protection measures.
          </p>
          <p>
            Our platform integrates real-time air quality data from OpenWeatherMap's Air Pollution API, providing
            accurate measurements of key pollutants including PM2.5, PM10, ozone, nitrogen dioxide, sulfur dioxide,
            and carbon monoxide.
          </p>
          <p>
            The AQI (Air Quality Index) is calculated based on international standards, taking into account the
            concentrations of various pollutants and their impact on human health.
          </p>
        </div>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Database className="mr-2 text-blue-500" size={24} />
          Data Sources
        </h2>
        <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            AirWise uses the following data sources to provide accurate air quality information:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Real-time Air Quality Data:</strong> OpenWeatherMap's Air Pollution API, which provides current
              concentrations of major pollutants and an overall Air Quality Index.
            </li>
            <li>
              <strong>Weather Data:</strong> OpenWeatherMap's Weather API, providing temperature, humidity, wind speed,
              and wind direction data for Gurugram.
            </li>
            <li>
              <strong>Forecast Data:</strong> OpenWeatherMap's Air Pollution Forecast API, offering predictions for
              air quality over the next 7 days.
            </li>
            <li>
              <strong>Geospatial Data:</strong> Real-time data is interpolated across different areas of Gurugram to
              provide location-specific air quality information.
            </li>
          </ul>
          <p className="mt-2">
            All data is updated in real-time, ensuring you always have the most current air quality information
            available for Gurugram.
          </p>
        </div>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Activity className="mr-2 text-blue-500" size={24} />
          Understanding the AQI
        </h2>
        <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            The Air Quality Index (AQI) is a numerical scale used to communicate how polluted the air is and
            what associated health effects might be of concern. The AQI ranges from 0 to 500, with higher values
            indicating more severe air pollution.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-500 flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                Good (0-50)
              </h3>
              <p className="text-sm mt-2">
                Air quality is satisfactory, and air pollution poses little or no risk to health.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-500 flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                Moderate (51-100)
              </h3>
              <p className="text-sm mt-2">
                Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-orange-500 flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                Unhealthy for Sensitive Groups (101-150)
              </h3>
              <p className="text-sm mt-2">
                Members of sensitive groups may experience health effects. The general public is less likely to be affected.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-red-500 flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                Unhealthy (151-200)
              </h3>
              <p className="text-sm mt-2">
                Health effects may be experienced by all people; sensitive groups may experience more serious effects.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-purple-500 flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                Very Unhealthy (201-300)
              </h3>
              <p className="text-sm mt-2">
                Health alert: The risk of health effects is increased for everyone.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 flex items-center">
                <div className="w-4 h-4 bg-red-900 rounded-full mr-2"></div>
                Hazardous (301-500)
              </h3>
              <p className="text-sm mt-2">
                Health warning of emergency conditions: everyone is more likely to be affected.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Shield className="mr-2 text-blue-500" size={24} />
          Protecting Your Health
        </h2>
        <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            When air quality is poor, consider taking the following precautions:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Limit outdoor activities, especially strenuous exercise</li>
            <li>Keep windows and doors closed to prevent outdoor air from coming inside</li>
            <li>Use air purifiers with HEPA filters indoors</li>
            <li>Wear N95 masks when outdoors during high pollution episodes</li>
            <li>Stay hydrated and maintain a healthy diet rich in antioxidants</li>
            <li>Follow medication plans if you have respiratory conditions like asthma</li>
            <li>Stay informed about air quality forecasts and plan activities accordingly</li>
          </ul>
        </div>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Code className="mr-2 text-blue-500" size={24} />
          Technical Information
        </h2>
        <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            AirWise is built using modern web technologies:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Frontend:</strong> React with TypeScript, TailwindCSS for styling, and Vite for the build system
            </li>
            <li>
              <strong>Backend:</strong> Flask (Python) providing RESTful API endpoints
            </li>
            <li>
              <strong>APIs:</strong> Integration with OpenWeatherMap for real-time air quality and weather data
            </li>
            <li>
              <strong>Deployment:</strong> Docker containers for easy deployment and scaling
            </li>
          </ul>
          <p className="mt-2">
            The application is designed to be responsive, performant, and accessible on all devices.
          </p>
        </div>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <GitBranch className="mr-2 text-blue-500" size={24} />
          Future Development
        </h2>
        <div className="mt-4 space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            We're continuously improving AirWise with planned features including:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>User accounts with personalized health recommendations</li>
            <li>Push notifications for air quality alerts</li>
            <li>Mobile applications for iOS and Android</li>
            <li>Integration with wearable devices for personalized exposure tracking</li>
            <li>Expanded coverage to more cities across India</li>
            <li>Advanced ML-based forecasting models</li>
          </ul>
          <p className="mt-2">
            Your feedback is valuable in helping us prioritize these features. Feel free to contact us with suggestions!
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;