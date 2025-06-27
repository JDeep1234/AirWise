import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind, Moon, Sun, Menu, X, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'warning',
      message: 'Air quality has significantly decreased in your area',
      time: '10 minutes ago'
    },
    {
      id: 2,
      type: 'info',
      message: 'Weather forecast updated for tomorrow',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'alert',
      message: 'High pollution alert: Consider wearing masks outdoors',
      time: '2 hours ago'
    }
  ];

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Wind className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">AirWise</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 dark:border-blue-400 text-sm font-medium text-gray-900 dark:text-white">
                Dashboard
              </Link>
              <Link to="/forecast" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500">
                Forecast
              </Link>
              <Link to="/historical" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500">
                Historical
              </Link>
              <Link to="/alerts" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500">
                Alerts
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <button 
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
                onClick={toggleNotifications}
                aria-label="View notifications"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <div className="flex items-start">
                            <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${
                              notification.type === 'warning' ? 'bg-orange-500' : 
                              notification.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <Link 
                      to="/alerts" 
                      className="block text-center text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 dark:border-blue-400 text-base font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/forecast" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Forecast
            </Link>
            <Link 
              to="/historical" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Historical
            </Link>
            <Link 
              to="/alerts" 
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Alerts
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-around">
              <button
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="relative">
                <button 
                  className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
                  onClick={toggleNotifications}
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                
                {/* Mobile Notification Dropdown */}
                {notificationsOpen && mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <div className="flex items-start">
                            <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${
                              notification.type === 'warning' ? 'bg-orange-500' : 
                              notification.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <Link 
                        to="/alerts" 
                        className="block text-center text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                        onClick={() => {
                          setNotificationsOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;