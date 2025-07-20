import React, { useState } from 'react';
import { FiBell, FiSearch, FiSettings, FiHelpCircle, FiSun, FiMoon, FiMenu } from 'react-icons/fi';
import { useAuth } from '../contexts/useAuth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  onMenuClick, 
  showMenuButton = false 
}) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [notifications] = useState(3);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            )}
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="search-input pl-10 w-64"
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5" />
              ) : (
                <FiSun className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <FiBell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {notifications}
                </span>
              )}
            </button>

            {/* Help */}
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Help"
            >
              <FiHelpCircle className="w-5 h-5" />
            </button>

            {/* Settings */}
            <button
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {user ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-success-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" aria-label="User is online"></span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user ? user.username : 'Guest'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user ? user.email : 'Not signed in'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 