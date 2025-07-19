import { useEffect, useState, lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import { ToastProvider, useToast } from './components/ui/Toast'
import CommandPalette from './components/ui/CommandPalette'

const DashboardView = lazy(() => import('./components/DashboardView'));
const ChatPanel = lazy(() => import('./components/ChatPanel'));
const IntegrationsView = lazy(() => import('./components/IntegrationsView'));

type ViewType = 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations'

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

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
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'vulnerabilities':
        return <DashboardView />
      case 'chat':
        return <ChatPanel />
      case 'integrations':
        return <IntegrationsView />
      default:
        return <DashboardView />
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
