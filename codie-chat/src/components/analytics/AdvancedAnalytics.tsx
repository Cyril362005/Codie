import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiShield, FiCode, FiClock } from 'react-icons/fi';

interface AnalyticsData {
  timeSeriesData: Array<{
    date: string;
    vulnerabilities: number;
    codeCoverage: number;
    complexityScore: number;
    securityScore: number;
  }>;
  vulnerabilityTrends: Array<{
    severity: string;
    count: number;
    color: string;
  }>;
  languageDistribution: Array<{
    language: string;
    lines: number;
    percentage: number;
    color: string;
  }>;
  securityMetrics: {
    totalVulnerabilities: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    securityScore: number;
    improvementRate: number;
  };
  performanceMetrics: {
    averageComplexity: number;
    maintainabilityIndex: number;
    codeCoverage: number;
    technicalDebt: number;
  };
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const timeSeriesData = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        timeSeriesData.push({
          date: date.toISOString().split('T')[0],
          vulnerabilities: Math.floor(Math.random() * 20) + 5,
          codeCoverage: Math.floor(Math.random() * 30) + 70,
          complexityScore: Math.floor(Math.random() * 10) + 5,
          securityScore: Math.floor(Math.random() * 30) + 70,
        });
      }

      const data: AnalyticsData = {
        timeSeriesData,
        vulnerabilityTrends: [
          { severity: 'Critical', count: 3, color: '#ef4444' },
          { severity: 'High', count: 8, color: '#f97316' },
          { severity: 'Medium', count: 15, color: '#eab308' },
          { severity: 'Low', count: 25, color: '#22c55e' },
        ],
        languageDistribution: [
          { language: 'JavaScript', lines: 15000, percentage: 35, color: '#f7df1e' },
          { language: 'Python', lines: 12000, percentage: 28, color: '#3776ab' },
          { language: 'TypeScript', lines: 8000, percentage: 19, color: '#3178c6' },
          { language: 'Java', lines: 6000, percentage: 14, color: '#ed8b00' },
          { language: 'Other', lines: 2000, percentage: 4, color: '#6b7280' },
        ],
        securityMetrics: {
          totalVulnerabilities: 51,
          criticalIssues: 3,
          highIssues: 8,
          mediumIssues: 15,
          lowIssues: 25,
          securityScore: 78,
          improvementRate: 12.5,
        },
        performanceMetrics: {
          averageComplexity: 7.2,
          maintainabilityIndex: 65,
          codeCoverage: 82.5,
          technicalDebt: 45,
        },
      };

      setAnalyticsData(data);
      setLoading(false);
    };

    setTimeout(generateMockData, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into your codebase health</p>
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.securityMetrics.securityScore}
              </p>
              <div className="flex items-center mt-2">
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  +{analyticsData.securityMetrics.improvementRate}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Code Coverage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.performanceMetrics.codeCoverage}%
              </p>
              <div className="flex items-center mt-2">
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">+5.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FiCode className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintainability</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.performanceMetrics.maintainabilityIndex}
              </p>
              <div className="flex items-center mt-2">
                <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600 dark:text-red-400">-2.1%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <FiActivity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Technical Debt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.performanceMetrics.technicalDebt}h
              </p>
              <div className="flex items-center mt-2">
                <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">-8.3%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="securityScore" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Security Score"
              />
              <Line 
                type="monotone" 
                dataKey="codeCoverage" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Code Coverage"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vulnerability Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vulnerability Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.vulnerabilityTrends}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ severity, percentage }) => `${severity}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.vulnerabilityTrends.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.languageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="language" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value} lines`, 'Lines of Code']}
              />
              <Bar dataKey="lines" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Security Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</span>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                {analyticsData.securityMetrics.criticalIssues}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${(analyticsData.securityMetrics.criticalIssues / analyticsData.securityMetrics.totalVulnerabilities) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">High Issues</span>
              <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {analyticsData.securityMetrics.highIssues}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${(analyticsData.securityMetrics.highIssues / analyticsData.securityMetrics.totalVulnerabilities) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Medium Issues</span>
              <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {analyticsData.securityMetrics.mediumIssues}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(analyticsData.securityMetrics.mediumIssues / analyticsData.securityMetrics.totalVulnerabilities) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Low Issues</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                {analyticsData.securityMetrics.lowIssues}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(analyticsData.securityMetrics.lowIssues / analyticsData.securityMetrics.totalVulnerabilities) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics; 