import React, { useState } from 'react'
import MetricCard from './MetricCard'
import VulnerabilityFeed from './VulnerabilityFeed'
import ProgressIndicator from './ui/ProgressIndicator'

const DashboardView: React.FC = () => {
  const [progress, setProgress] = useState(40)

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Security Dashboard</h2>
          <p className="text-gray-400">Monitor your code security metrics and vulnerabilities</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium">Refresh</button>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors" onClick={() => setProgress((p) => Math.min(p + 10, 100))}>New Scan</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Scans" value={1234} icon={<span>📊</span>} progress={progress} />
        <MetricCard label="Vulnerabilities" value={23} icon={<span>⚠️</span>} colorClass="text-red-400" />
        <MetricCard label="Resolved" value={189} icon={<span>✅</span>} colorClass="text-green-400" progress={80} />
        <MetricCard label="Avg. Fix Time" value={2} icon={<span>⏱️</span>} colorClass="text-purple-400" />
      </div>

      <div className="glass p-6 flex flex-col space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Vulnerabilities</h3>
        <VulnerabilityFeed />
        <ProgressIndicator progress={progress} />
      </div>
    </div>
  )
}

export default DashboardView
