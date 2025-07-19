import React from 'react'

const DashboardView: React.FC = () => {
  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Security Dashboard</h2>
          <p className="text-gray-400">Monitor your code security metrics and vulnerabilities</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium">
            Refresh
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            New Scan
          </button>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">📊</span>
            </div>
            <span className="text-sm text-green-400 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">1,234</p>
          <p className="text-sm text-gray-400">Total Scans</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">⚠️</span>
            </div>
            <span className="text-sm text-red-400 font-medium">-8%</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">23</p>
          <p className="text-sm text-gray-400">Vulnerabilities</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">✅</span>
            </div>
            <span className="text-sm text-green-400 font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">189</p>
          <p className="text-sm text-gray-400">Resolved</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">⏱️</span>
            </div>
            <span className="text-sm text-purple-400 font-medium">-22%</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">2.3d</p>
          <p className="text-sm text-gray-400">Avg. Fix Time</p>
        </div>
      </div>

      {/* Main Content Placeholder */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex-1">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-blue-400 text-sm">📄</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Scan completed for project-alpha</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 text-sm">✅</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Vulnerability fixed in user-service</p>
              <p className="text-xs text-gray-400">4 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
