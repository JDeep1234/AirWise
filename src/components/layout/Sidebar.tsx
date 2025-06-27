import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Clock, 
  Bell, 
  Info,
  Settings,
  MapPin,
  Activity,
  Search,
  CreditCard,
  LucideIcon
} from 'lucide-react';

type NavigationItem = {
  name: string;
  href?: string;
  icon?: LucideIcon;
  type?: 'link' | 'divider';
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home, type: 'link' },
    { name: 'Forecast', href: '/forecast', icon: TrendingUp, type: 'link' },
    { name: 'Historical', href: '/historical', icon: Clock, type: 'link' },
    { name: 'Alerts', href: '/alerts', icon: Bell, type: 'link' },
    { type: 'divider', name: 'Pollution Time Machine' },
    { name: 'Micro-Zone Prediction', href: '/micro-zone-prediction', icon: MapPin, type: 'link' },
    { name: 'Infrastructure Control', href: '/infrastructure-control', icon: Activity, type: 'link' },
    { name: 'Source Attribution', href: '/pollution-source-attribution', icon: Search, type: 'link' },
    { type: 'divider', name: 'Smart City Initiative' },
    { name: 'Pollution Passport', href: '/pollution-passport', icon: CreditCard, type: 'link' },
    { name: 'About', href: '/about', icon: Info, type: 'link' },
  ];
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="px-4 space-y-4">
              {navigationItems.map((item) => {
                if (item.type === 'divider') {
                  return (
                    <div key={item.name} className="pt-2 space-y-2">
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                        {item.name}
                      </p>
                    </div>
                  );
                }
                
                if (item.href && item.icon) {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive 
                          ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <IconComponent
                        className={`mr-3 h-5 w-5 ${
                          isActive 
                            ? 'text-blue-500 dark:text-blue-400' 
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <Link to="/settings" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white">
              <Settings
                className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                aria-hidden="true"
              />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;