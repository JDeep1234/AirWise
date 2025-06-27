import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  
  // Add smooth scrolling to the document
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);
  
  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          
          {/* Add a scroll to top button */}
          <button 
            onClick={() => window.scrollTo({ top: 0 })}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 z-40"
            aria-label="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;