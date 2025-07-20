import { useEffect, useState, lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/ui/Toast'
import CommandPalette from './components/ui/CommandPalette'
import AuthPage from './components/auth/AuthPage'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/useAuth'

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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [analysisData, setAnalysisData] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(`${API_URL}/start-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            git_url: 'https://github.com/jules-ai/codie-sample-app', // Hardcoded for now
            chat_id: '123'
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }
        const data = await response.json();
        setAnalysisData(data);
      } catch (err: unknown) {
        console.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const renderMainContent = () => {
    if (loading || authLoading) {
      return (
        <div className="h-full flex items-center justify-center gradient-bg">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Loading Codie</h2>
            <p className="text-gray-600 dark:text-gray-400">Initializing AI-powered code review platform...</p>
          </div>
        </div>
      )
    }
    
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'projects':
        return <ProjectManagement />
      case 'vulnerabilities':
        return <DashboardView analysisData={analysisData} />
      case 'chat':
        return <ChatPanel repoPath="/tmp/mock-repo" analysisData={mockAnalysisData} />
      case 'analytics':
        return <AdvancedAnalytics />
      case 'reports':
        return <ReportGenerator />
      case 'monitoring':
        return <SystemMonitor />
      case 'enterprise':
        return <EnterpriseDashboard />
      case 'ai-insights':
        return <AIInsights />
      case 'integrations':
        return <IntegrationsView />
      case 'code-explorer':
        return <CodeExplorerView analysisData={mockAnalysisData} />
      default:
        return <DashboardView analysisData={analysisData} />
    }
  }

  // Mock analysis data for CodeExplorerView
  const mockAnalysisData = {
    hotspots: {
      "src/utils/file_processor.py": 15,
      "src/config.py": 8,
    },
    complexity_reports: {
      "src/utils/file_processor.py": {
        cyclomatic_complexity: 15,
        maintainability_index: 45
      },
      "src/config.py": {
        cyclomatic_complexity: 8,
        maintainability_index: 65
      }
    },
    vulnerabilities: [
      {
        title: "Remote Code Execution via deserialization",
        severity: "critical",
        file_path: "src/utils/file_processor.py",
        line_number: 78,
        cvss_score: 9.8
      },
      {
        title: "Hardcoded Secret in API key",
        severity: "high",
        file_path: "src/config.py",
        line_number: 15,
        cvss_score: 7.5
      }
    ],
    code_coverage_percentage: 78.5,
    top_refactoring_candidate: {
      file: "src/utils/file_processor.py",
      score: 15
    },
    file_contents: {
      "src/utils/file_processor.py": `import pickle
import os

def process_file(data):
    # This is a dangerous function that can lead to RCE
    if data.startswith('pickle://'):
        # CRITICAL: This allows arbitrary code execution
        return pickle.loads(data[8:])
    return data

def safe_process(data):
    # This is the safe version
    return data.strip()

# More complex code here...
def complex_function():
    result = 0
    for i in range(100):
        if i % 2 == 0:
            result += i
        else:
            result -= i
    return result`,
      "src/config.py": `# Configuration file
API_KEY = "sk-1234567890abcdef"  # SECURITY ISSUE: Hardcoded secret

DATABASE_URL = "postgresql://user:pass@localhost/db"

def get_config():
    return {
        "api_key": API_KEY,
        "database_url": DATABASE_URL
    }`
    }
  };

  // Show auth page if user is not authenticated
  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Development mode indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-1 text-sm font-medium z-50">
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
