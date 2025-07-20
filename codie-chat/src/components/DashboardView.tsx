import React, { useState, useEffect } from 'react'
import VulnerabilityTable from './VulnerabilityTable'
import VulnerabilityChart from './VulnerabilityChart'
import { FiRefreshCw, FiPlus, FiTrendingUp, FiTrendingDown, FiShield, FiCode, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { analysisAPI, monitoringAPI } from '../services/api'
import { useAuth } from '../contexts/useAuth'

import type { AnalysisData } from '../types';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  [key: string]: unknown;
}

const DashboardView: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [progress, setProgress] = useState(0)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90))
        }, 500)

        // Fetch system health
        try {
          const healthResponse = await monitoringAPI.getHealth(token || undefined)
          if (healthResponse.data && !healthResponse.error) {
            setSystemHealth(healthResponse.data as SystemHealth)
          }
        } catch (healthError) {
          console.warn('Failed to fetch system health:', healthError)
        }

        // Start analysis
        const response = await analysisAPI.startAnalysis({
          git_url: 'https://github.com/facebook/react', // Hardcoded public repo for demo
          chat_id: 'demo-chat-123',
          token: token || undefined
        })

        clearInterval(progressInterval)
        setProgress(100)

        if (response.data && !response.error) {
          setAnalysisData(response.data as AnalysisData)
        } else {
          throw new Error(response.error || 'Failed to get analysis data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis data')
        console.error('Error fetching analysis data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleRefresh = () => {
    setProgress(0)
    setAnalysisData(null)
    setError(null)
    setLoading(true)
    
    // Re-fetch data
    const fetchData = async () => {
      try {
        const response = await analysisAPI.startAnalysis({
          git_url: 'https://github.com/facebook/react',
          chat_id: 'demo-chat-123',
          token: token || undefined
        })

        if (response.data && !response.error) {
          setAnalysisData(response.data as AnalysisData)
        } else {
          throw new Error(response.error || 'Failed to get analysis data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }

  if (loading) {
    return (
      <div className="h-full p-6 flex items-center justify-center gradient-bg">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analyzing Repository</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Scanning for vulnerabilities and code quality issues</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mx-auto mb-4">
            <div 
              className="progress-fill transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{progress}% complete</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full p-6 flex items-center justify-center gradient-bg">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="w-8 h-8 text-danger-600 dark:text-danger-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analysis Failed</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="btn-primary"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="h-full p-6 flex items-center justify-center gradient-bg">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No analysis data available</p>
        </div>
      </div>
    )
  }

  // Calculate metrics from analysis data
  const totalVulnerabilities = analysisData.vulnerabilities.length
  const criticalVulnerabilities = analysisData.vulnerabilities.filter(v => v.severity === 'critical').length
  const highVulnerabilities = analysisData.vulnerabilities.filter(v => v.severity === 'high').length
  // const resolvedVulnerabilities = Math.floor(totalVulnerabilities * 0.3) // Mock resolved count
  const avgFixTime = Math.round((criticalVulnerabilities * 3 + highVulnerabilities * 1.5) / totalVulnerabilities || 2)

  // Get top refactoring candidate code
  const topCandidateCode = analysisData.file_contents[analysisData.top_refactoring_candidate.file] || 
    '// Code preview not available'

  return (
    <div className="h-full p-6 space-y-6 overflow-auto gradient-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Live analysis of React repository</p>
          {systemHealth && (
            <div className="flex items-center space-x-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${systemHealth.status === 'healthy' ? 'bg-success-500' : 'bg-danger-500'}`}></span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                System Status: {systemHealth.status}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="btn-secondary"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button 
            onClick={handleRefresh}
            className="btn-primary"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            New Scan
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex items-center space-x-1">
              <FiTrendingDown className="w-4 h-4 text-success-500" />
              <span className="text-xs text-success-600 dark:text-success-400 font-medium">-12%</span>
            </div>
          </div>
          <div className="metric-value">{totalVulnerabilities}</div>
          <div className="metric-label">Total Vulnerabilities</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {criticalVulnerabilities} critical, {highVulnerabilities} high
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <div className="flex items-center space-x-1">
              <FiTrendingUp className="w-4 h-4 text-success-500" />
              <span className="text-xs text-success-600 dark:text-success-400 font-medium">+8%</span>
            </div>
          </div>
          <div className="metric-value">{analysisData.code_coverage_percentage || 0}%</div>
          <div className="metric-label">Code Coverage</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Target: 80%
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/20 rounded-lg flex items-center justify-center">
              <FiCode className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="flex items-center space-x-1">
              <FiTrendingDown className="w-4 h-4 text-success-500" />
              <span className="text-xs text-success-600 dark:text-success-400 font-medium">-5%</span>
            </div>
          </div>
          <div className="metric-value">{analysisData.top_refactoring_candidate.score}</div>
          <div className="metric-label">Complexity Score</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Top candidate for refactoring
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-danger-100 dark:bg-danger-900/20 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            </div>
            <div className="flex items-center space-x-1">
              <FiTrendingUp className="w-4 h-4 text-danger-500" />
              <span className="text-xs text-danger-600 dark:text-danger-400 font-medium">+2</span>
            </div>
          </div>
          <div className="metric-value">{avgFixTime}h</div>
          <div className="metric-label">Avg Fix Time</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Based on severity
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Chart */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vulnerability Trends</h3>
            <div className="flex space-x-2">
              <span className="badge badge-danger">Critical</span>
              <span className="badge badge-warning">High</span>
              <span className="badge badge-primary">Medium</span>
            </div>
          </div>
          <VulnerabilityChart vulnerabilities={analysisData.vulnerabilities} />
        </div>

        {/* Top Refactoring Candidate */}
        <div className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Refactoring Candidate</h3>
            <span className="badge badge-warning">High Priority</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{analysisData.top_refactoring_candidate.file}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Complexity score: {analysisData.top_refactoring_candidate.score}</p>
              </div>
              <button className="btn-secondary text-xs">
                View Code
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
              <pre className="text-sm text-gray-100 font-mono">
                <code>{topCandidateCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Table */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Vulnerabilities</h3>
          <button className="btn-secondary text-sm">
            View All
          </button>
        </div>
        <VulnerabilityTable vulnerabilities={analysisData.vulnerabilities.slice(0, 5)} />
      </div>
    </div>
  );
};

export default DashboardView
