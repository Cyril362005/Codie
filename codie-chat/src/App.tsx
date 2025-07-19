import { useEffect, useState, lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import { ToastProvider, useToast } from './components/ui/Toast'
import CommandPalette from './components/ui/CommandPalette'

const DashboardView = lazy(() => import('./components/DashboardView'));
const ChatPanel = lazy(() => import('./components/ChatPanel'));
const IntegrationsView = lazy(() => import('./components/IntegrationsView'));
const CodeExplorerView = lazy(() => import('./components/CodeExplorerView'));

type ViewType = 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations' | 'code-explorer'

interface AnalysisData {
  hotspots: Record<string, number>;
  complexity_reports: Record<string, unknown>;
  vulnerabilities: Record<string, unknown>[];
  code_coverage_percentage: number;
  top_refactoring_candidate: {
    file: string;
    score: number;
  };
  file_contents: Record<string, string>;
}

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch('http://localhost:8000/start-analysis', {
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
      } catch (err) {
        setError(err.message);
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
    if (loading) return <div className="p-6 space-y-4"><div className="h-32 skeleton rounded"/><div className="h-64 skeleton rounded"/></div>
    if (error) return <div className="h-full flex items-center justify-center text-danger">{error}</div>;
    if (!analysisData) return <div className="h-full flex items-center justify-center text-white">No analysis data found.</div>;

    switch (currentView) {
      case 'dashboard':
        return <DashboardView analysisData={analysisData} />
      case 'vulnerabilities':
        return <DashboardView analysisData={analysisData} />
      case 'chat':
        return <ChatPanel />
      case 'integrations':
        return <IntegrationsView />
      case 'code-explorer':
        return <CodeExplorerView analysisData={analysisData} />
      default:
        return <DashboardView analysisData={analysisData} />
    }
  }

  return (
    <div className={`${theme === 'light' ? 'light' : ''} min-h-screen bg-primary-gradient relative overflow-hidden`}>
      <button onClick={() => { setTheme(theme === 'light' ? 'dark' : 'light'); toast('Theme toggled') }} className="absolute top-4 right-4 z-20 px-2 py-1 bg-white/10 rounded">{theme === 'light' ? 'Dark' : 'Light'}</button>
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="particle" style={{ left: `${Math.random() * 100}%`, bottom: `${Math.random() * 100}vh`, animationDelay: `${i * 0.5}s` }} />
      ))}
      <div className="relative z-10 flex h-screen">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <div className="glass h-full overflow-auto animate-fadeIn">
              <Suspense fallback={<div className="p-6 space-y-4"><div className="h-32 skeleton rounded"/><div className="h-64 skeleton rounded"/></div>}>
                {renderMainContent()}
              </Suspense>
            </div>
          </div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  )
}

export default App
