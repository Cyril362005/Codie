import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ChatPanel from './components/ChatPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardView />
        </div>
        <div className="lg:col-span-1">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}

export default App;