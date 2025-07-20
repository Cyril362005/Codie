import { useEffect, useState, lazy, Suspense, useCallback, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/ui/Toast'
import CommandPalette from './components/ui/CommandPalette'
import AuthPage from './components/auth/AuthPage'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/useAuth'
import { mockAnalysisData } from './mocks/analysisData'

// Lazy load components for better performance
const DashboardView = lazy(() => import('./components/DashboardView'));
const ChatPanel = lazy(() => import('./components/ChatPanel'));
const IntegrationsView = lazy(() => import('./components/IntegrationsView'));
const CodeExplorerView = lazy(() => import('./components/CodeExplorerView'));
const ProjectManagement = lazy(() => import('./components/ProjectManagement'));
const AdvancedAnalytics = lazy(() => import('./components/analytics/AdvancedAnalytics'));
const ReportGenerator = lazy(() => import('./components/reports/ReportGenerator'));
const SystemMonitor = lazy(() => import('./components/monitoring/SystemMonitor'));
const EnterpriseDashboard = lazy(() => import('./components/enterprise/EnterpriseDashboard'));
const AIInsights = lazy(() => import('./components/ai/AIInsights'));

type ViewType = 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations' | 'code-explorer' | 'projects' | 'analytics' | 'reports' | 'monitoring' | 'enterprise' | 'ai-insights'

interface AnalysisResponse {
  hotspots: Record<string, number>
  vulnerabilities: Array<{
    title: string
    severity: string
    file_path: string
    line_number: number
    cvss_score: number
  }>
  complexity_reports: Record<string, {
    cyclomatic_complexity: number
    maintainability_index: number
  }>
  code_coverage_percentage: number
  top_refactoring_candidate: {
    file: string
    score: number
  }
}

// Use Vite's environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const DEFAULT_GIT_URL = import.meta.env.VITE_DEFAULT_GIT_URL || 'https://github.com/jules-ai/codie-sample-app'

/**
 * Main application component that handles routing and authentication
 */
function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [loading, setLoading] = useState(true)
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { user, loading: authLoading, token } = useAuth()

  // Fetch analysis data with proper error handling and auth
  useEffect(() => {
    if (!user || !token) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const fetchAnalysisData = async () => {
      try {
        setAnalysisError(null)
        const response = await fetch(`${API_URL}/start-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            git_url: DEFAULT_GIT_URL,
            chat_id: `chat_${Date.now()}` // Generate unique chat ID
          }),
          signal: controller.signal
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data: AnalysisResponse = await response.json()
        setAnalysisData(data)
        
        // Only log in development
        if (import.meta.env.DEV) {
          console.log('Analysis data loaded:', data)
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            setAnalysisError(err.message)
            console.error('Failed to fetch analysis data:', err)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysisData()
    
    // Cleanup on unmount
    return () => controller.abort()
  }, [user, token]);

  // Keyboard shortcut handler with cross-platform support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Check for Cmd+K on Mac, Ctrl+K on others
      const isModifierPressed = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey
      if (isModifierPressed && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Memoize view components to prevent unnecessary re-renders
  const viewComponents = useMemo(() => {
    const effectiveAnalysisData = analysisData || mockAnalysisData
    
    return {
      dashboard: <DashboardView />,
      projects: <ProjectManagement />,
      vulnerabilities: <DashboardView />, // TODO: Create dedicated vulnerabilities view
      chat: <ChatPanel repoPath="/tmp/mock-repo" analysisData={effectiveAnalysisData} />,
      analytics: <AdvancedAnalytics />,
      reports: <ReportGenerator />,
      monitoring: <SystemMonitor />,
      enterprise: <EnterpriseDashboard />,
      'ai-insights': <AIInsights />,
      integrations: <IntegrationsView />,
      'code-explorer': <CodeExplorerView analysisData={effectiveAnalysisData} />,
    }
  }, [analysisData])

  const renderMainContent = useCallback(() => {
    if (loading || authLoading) {
      return (
        <div className="h-full flex items-center justify-center gradient-bg" role="status" aria-live="polite">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" aria-hidden="true"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Loading Codie</h2>
            <p className="text-gray-600 dark:text-gray-400">Initializing AI-powered code review platform...</p>
          </div>
        </div>
      )
    }
    
    if (analysisError) {
      return (
        <div className="h-full flex items-center justify-center gradient-bg" role="alert">
          <div className="text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Analysis Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{analysisError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              aria-label="Retry loading analysis"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    
    return viewComponents[currentView] || viewComponents.dashboard
  }, [loading, authLoading, analysisError, currentView, viewComponents])


  // Show auth page if user is not authenticated
  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Development mode indicator */}
      {import.meta.env.DEV && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-1 text-sm font-medium z-50" role="banner">
          🚧 Development Mode - Backend services not running
        </div>
      )}
      <div className="flex h-screen">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-hidden bg-transparent">
          <div className="h-full">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </div>
            }>
              {renderMainContent()}
            </Suspense>
          </div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
