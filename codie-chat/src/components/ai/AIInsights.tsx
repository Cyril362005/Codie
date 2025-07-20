import React, { useState, useEffect } from 'react';
import { 
  FiShield, FiCode, 
  FiCheckCircle, FiBarChart,
  FiTarget, FiZap, FiEye, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface AIModel {
  name: string;
  type: string;
  accuracy: number;
  status: 'active' | 'training' | 'error';
  lastUpdated: string;
}

interface CodePattern {
  pattern_id: string;
  pattern_type: string;
  confidence: number;
  description: string;
  severity: string;
  suggestions: string[];
  code_snippet: string;
  line_numbers: number[];
}

interface VulnerabilityPrediction {
  file_path: string;
  risk_score: number;
  predicted_vulnerabilities: string[];
  confidence: number;
  mitigation_suggestions: string[];
}

interface CodeQualityMetrics {
  maintainability_index: number;
  cyclomatic_complexity: number;
  code_duplication: number;
  test_coverage: number;
  documentation_score: number;
  overall_score: number;
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  impact: string;
}

const AIInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'patterns' | 'predictions' | 'quality'>('overview');
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [codePatterns, setCodePatterns] = useState<CodePattern[]>([]);
  const [vulnerabilityPredictions, setVulnerabilityPredictions] = useState<VulnerabilityPrediction[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<CodeQualityMetrics[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelTraining, setModelTraining] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const mockModels: AIModel[] = [
        {
          name: 'Vulnerability Classifier',
          type: 'RandomForest',
          accuracy: 94.2,
          status: 'active',
          lastUpdated: '2024-01-20T10:30:00Z'
        },
        {
          name: 'Code Quality Regressor',
          type: 'RandomForest',
          accuracy: 87.5,
          status: 'active',
          lastUpdated: '2024-01-20T09:15:00Z'
        },
        {
          name: 'Pattern Detector',
          type: 'DBSCAN',
          accuracy: 91.8,
          status: 'training',
          lastUpdated: '2024-01-20T11:45:00Z'
        },
        {
          name: 'Anomaly Detector',
          type: 'IsolationForest',
          accuracy: 89.3,
          status: 'active',
          lastUpdated: '2024-01-20T08:20:00Z'
        }
      ];

      const mockPatterns: CodePattern[] = [
        {
          pattern_id: 'sec_001',
          pattern_type: 'security',
          confidence: 0.95,
          description: 'Potential SQL injection vulnerability',
          severity: 'high',
          suggestions: ['Use parameterized queries', 'Validate input data'],
          code_snippet: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
          line_numbers: [42]
        },
        {
          pattern_id: 'perf_001',
          pattern_type: 'performance',
          confidence: 0.87,
          description: 'Inefficient list comprehension',
          severity: 'medium',
          suggestions: ['Use generator expressions for large datasets'],
          code_snippet: '[item for item in large_list if condition]',
          line_numbers: [156]
        },
        {
          pattern_id: 'style_001',
          pattern_type: 'style',
          confidence: 0.92,
          description: 'Long function detected',
          severity: 'low',
          suggestions: ['Break function into smaller functions'],
          code_snippet: 'def long_function(): ...',
          line_numbers: [89, 90, 91]
        }
      ];

      const mockPredictions: VulnerabilityPrediction[] = [
        {
          file_path: 'auth_service.py',
          risk_score: 0.78,
          predicted_vulnerabilities: ['SQL Injection', 'Authentication Bypass'],
          confidence: 0.85,
          mitigation_suggestions: ['Use parameterized queries', 'Implement proper authentication']
        },
        {
          file_path: 'api_gateway.py',
          risk_score: 0.45,
          predicted_vulnerabilities: ['Input Validation'],
          confidence: 0.72,
          mitigation_suggestions: ['Add input validation', 'Sanitize user inputs']
        },
        {
          file_path: 'database.py',
          risk_score: 0.92,
          predicted_vulnerabilities: ['SQL Injection', 'Privilege Escalation'],
          confidence: 0.91,
          mitigation_suggestions: ['Use ORM', 'Implement proper access controls']
        }
      ];

      const mockQualityMetrics: CodeQualityMetrics[] = [
        {
          maintainability_index: 85.2,
          cyclomatic_complexity: 12.5,
          code_duplication: 8.3,
          test_coverage: 78.9,
          documentation_score: 72.1,
          overall_score: 81.4
        }
      ];

      const mockInsights: AIInsight[] = [
        {
          type: 'security',
          title: 'High Security Risk Detected',
          description: 'Multiple SQL injection vulnerabilities found in authentication module',
          confidence: 0.89,
          priority: 'critical',
          recommendations: [
            'Replace string concatenation with parameterized queries',
            'Implement input validation for all user inputs',
            'Add security headers to prevent XSS attacks'
          ],
          impact: 'Critical security vulnerability that could lead to data breaches'
        },
        {
          type: 'performance',
          title: 'Performance Optimization Opportunity',
          description: 'Inefficient database queries detected in user management',
          confidence: 0.76,
          priority: 'high',
          recommendations: [
            'Add database indexes for frequently queried fields',
            'Implement query result caching',
            'Optimize N+1 query patterns'
          ],
          impact: 'Significant performance improvement potential (40-60% faster queries)'
        },
        {
          type: 'quality',
          title: 'Code Quality Improvement',
          description: 'Low test coverage in critical modules',
          confidence: 0.82,
          priority: 'medium',
          recommendations: [
            'Increase test coverage to at least 80%',
            'Add integration tests for API endpoints',
            'Implement automated testing in CI/CD pipeline'
          ],
          impact: 'Improved code reliability and easier maintenance'
        }
      ];

      setAiModels(mockModels);
      setCodePatterns(mockPatterns);
      setVulnerabilityPredictions(mockPredictions);
      setQualityMetrics(mockQualityMetrics);
      setAiInsights(mockInsights);
      setLoading(false);
    };

    setTimeout(generateMockData, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'training':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'performance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'style':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'architecture':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleModelTraining = () => {
    setModelTraining(true);
    // Simulate training process
    setTimeout(() => {
      setModelTraining(false);
      // Update model status
      setAiModels(prev => prev.map(model => 
        model.status === 'training' 
          ? { ...model, status: 'active', accuracy: model.accuracy + Math.random() * 2 }
          : model
      ));
    }, 3000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Machine learning-powered code analysis and recommendations</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleModelTraining}
            disabled={modelTraining}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {modelTraining ? (
              <FiRefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FiShield className="w-4 h-4" />
            )}
            <span>{modelTraining ? 'Training...' : 'Train Models'}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            <FiDownload className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* AI Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {aiModels.map((model) => (
          <div key={model.name} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FiShield className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(model.status)}`}>
                {model.status}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{model.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{model.type}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{model.accuracy}%</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Accuracy</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: FiEye },
              { id: 'models', label: 'ML Models', icon: FiShield },
              { id: 'patterns', label: 'Code Patterns', icon: FiCode },
              { id: 'predictions', label: 'Predictions', icon: FiTarget },
              { id: 'quality', label: 'Quality Metrics', icon: FiBarChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'models' | 'patterns' | 'predictions' | 'quality')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* AI Insights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI-Generated Insights</h3>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <FiShield className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{insight.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          <strong>Impact:</strong> {insight.impact}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Confidence:</strong> {insight.confidence * 100}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recommendations:</p>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start space-x-2">
                              <FiCheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aiModels}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Risk Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: 2, color: '#EF4444' },
                          { name: 'High', value: 5, color: '#F97316' },
                          { name: 'Medium', value: 8, color: '#EAB308' },
                          { name: 'Low', value: 12, color: '#10B981' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[
                          { name: 'Critical', value: 2, color: '#EF4444' },
                          { name: 'High', value: 5, color: '#F97316' },
                          { name: 'Medium', value: 8, color: '#EAB308' },
                          { name: 'Low', value: 12, color: '#10B981' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Machine Learning Models</h3>
                <div className="space-y-4">
                  {aiModels.map((model) => (
                    <div key={model.name} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{model.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{model.type} • Last updated: {new Date(model.lastUpdated).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Accuracy</span>
                            <span>{model.accuracy}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${model.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detected Code Patterns</h3>
                <div className="space-y-4">
                  {codePatterns.map((pattern) => (
                    <div key={pattern.pattern_id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPatternTypeColor(pattern.pattern_type)}`}>
                            {pattern.pattern_type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(pattern.severity)}`}>
                            {pattern.severity}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {pattern.confidence * 100}% confidence
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{pattern.description}</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
                        <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{pattern.code_snippet}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Line {pattern.line_numbers.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Suggestions:</p>
                        <ul className="space-y-1">
                          {pattern.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start space-x-2">
                              <FiZap className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vulnerability Predictions</h3>
                <div className="space-y-4">
                  {vulnerabilityPredictions.map((prediction, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{prediction.file_path}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {prediction.predicted_vulnerabilities.join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(prediction.risk_score * 100)}%
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Risk Score</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Confidence</span>
                          <span>{prediction.confidence * 100}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${prediction.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Mitigation Suggestions:</p>
                        <ul className="space-y-1">
                          {prediction.mitigation_suggestions.map((suggestion, sugIndex) => (
                            <li key={sugIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start space-x-2">
                              <FiShield className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Code Quality Metrics</h3>
                {qualityMetrics.map((metrics, index) => (
                  <div key={index} className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {metrics.overall_score}
                      </div>
                      <div className="text-lg text-gray-600 dark:text-gray-400">Overall Quality Score</div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Maintainability', value: metrics.maintainability_index, color: 'blue' },
                        { label: 'Complexity', value: 100 - metrics.cyclomatic_complexity * 2, color: 'green' },
                        { label: 'Duplication', value: 100 - metrics.code_duplication, color: 'purple' },
                        { label: 'Test Coverage', value: metrics.test_coverage, color: 'orange' },
                        { label: 'Documentation', value: metrics.documentation_score, color: 'red' }
                      ].map((metric) => (
                        <div key={metric.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.label}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(metric.value)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`bg-${metric.color}-600 h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${Math.max(0, Math.min(100, metric.value))}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Radar Chart */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Quality Dimensions</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={[
                          {
                            subject: 'Maintainability',
                            A: metrics.maintainability_index,
                            fullMark: 100,
                          },
                          {
                            subject: 'Complexity',
                            A: Math.max(0, 100 - metrics.cyclomatic_complexity * 2),
                            fullMark: 100,
                          },
                          {
                            subject: 'Duplication',
                            A: Math.max(0, 100 - metrics.code_duplication),
                            fullMark: 100,
                          },
                          {
                            subject: 'Test Coverage',
                            A: metrics.test_coverage,
                            fullMark: 100,
                          },
                          {
                            subject: 'Documentation',
                            A: metrics.documentation_score,
                            fullMark: 100,
                          },
                        ]}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar name="Quality" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights; 