import React, { useState } from 'react'
import MetricCard from './MetricCard'
import VulnerabilityFeed from './VulnerabilityFeed'
import ProgressIndicator from './ui/ProgressIndicator'

const DashboardView: React.FC = () => {
  const [progress, setProgress] = useState(40)

  return (
    <div className="h-full p-lg space-y-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="h1 text-white mb-xs">Security Dashboard</h1>
          <p className="text-gray-400">Monitor your code security metrics and vulnerabilities</p>
        </div>
        <div className="flex space-x-sm">
          <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 px-md py-sm rounded-md text-sm font-medium">Refresh</button>
          <button className="bg-accent hover:bg-accent/80 px-md py-sm rounded-md text-sm font-medium transition-colors" onClick={() => setProgress((p) => Math.min(p + 10, 100))}>New Scan</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-3">
          <MetricCard label="Total Scans" value={1234} icon={<span>📊</span>} progress={progress} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <MetricCard label="Vulnerabilities" value={23} icon={<span>⚠️</span>} colorClass="text-danger" />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <MetricCard label="Resolved" value={189} icon={<span>✅</span>} colorClass="text-success" progress={80} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <MetricCard label="Avg. Fix Time" value={2} icon={<span>⏱️</span>} colorClass="text-warning" />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="glass-1 p-lg flex flex-col space-y-md">
            <h3 className="h3 text-white">Recent Vulnerabilities</h3>
            <VulnerabilityFeed />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="glass-1 p-lg flex flex-col space-y-md">
            <h3 className="h3 text-white">Scan Progress</h3>
            <ProgressIndicator progress={progress} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
