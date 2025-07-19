import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DashboardView from './components/DashboardView'

type ViewType = 'dashboard' | 'vulnerabilities' | 'chat'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'vulnerabilities':
        return <DashboardView />
      case 'chat':
        return <div className="h-full p-6"><h2 className="text-white text-2xl">Chat Panel (Coming Soon)</h2></div>
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl h-full overflow-hidden">
              {renderMainContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
