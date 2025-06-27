import React from 'react';
import { Wind, Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <Wind className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">AirWise</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
              Advanced air quality monitoring and prediction platform to help communities breathe cleaner air through data-driven solutions.
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">Resources</h3>
            <div className="flex flex-col space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">API Documentation</a>
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Data Sources</a>
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Research Papers</a>
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">FAQ</a>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <span className="mr-1">Made with</span>
              <Heart size={14} className="text-red-500 mx-1" />
              <span>for cleaner air</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-0">
            © {new Date().getFullYear()} AirWise. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;