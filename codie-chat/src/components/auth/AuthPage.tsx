import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { FiCode, FiShield, FiZap } from 'react-icons/fi';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Left side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white">
        <div className="max-w-md mx-auto flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <FiCode className="h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold">Codie</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Intelligent Code Analysis & Security
            </h2>
            <p className="text-blue-100 text-lg">
              Discover vulnerabilities, improve code quality, and build more secure applications with AI-powered analysis.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">
                  <FiShield className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Security First</h3>
                <p className="text-blue-100">
                  Advanced vulnerability detection with real-time security scanning and automated fix suggestions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white">
                  <FiZap className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">AI-Powered Insights</h3>
                <p className="text-blue-100">
                  Get intelligent code recommendations, complexity analysis, and automated refactoring suggestions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white">
                  <FiCode className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Code Quality</h3>
                <p className="text-blue-100">
                  Comprehensive code coverage analysis, maintainability metrics, and performance optimization tips.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <blockquote className="text-blue-100 italic">
              "Codie has transformed how we approach code security. The AI-powered insights are invaluable for our development team."
            </blockquote>
            <div className="mt-4 flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">JD</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">John Developer</p>
                <p className="text-xs text-blue-200">Senior Software Engineer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FiCode className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Codie</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Intelligent Code Analysis & Security
            </p>
          </div>

          {/* Auth Forms */}
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 