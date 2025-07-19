import React, { useState } from 'react'
import AnimatedCard from './AnimatedCard'
import MetricCard from './MetricCard'
import VulnerabilityTable from './VulnerabilityTable'
import VulnerabilityChart from './VulnerabilityChart'
import CodePreview from './CodePreview'

const DashboardView: React.FC = () => {
  const [progress, setProgress] = useState(40)

  const codeSnippet = `
function insecure_deserialization(data) {
  // Unsafe deserialization of user-provided data
  const obj = JSON.parse(data);
  console.log(\`Welcome, \${obj.name}!\`);
}
  `;

  return (
    <div className="h-full p-lg space-y-lg overflow-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-lg">
        <div className="lg:col-span-3">
          <AnimatedCard>
            <MetricCard label="Total Scans" value={1234} icon={<span>📊</span>} progress={progress} />
          </AnimatedCard>
        </div>
        <div className="lg:col-span-3">
          <AnimatedCard>
            <MetricCard label="Vulnerabilities" value={23} icon={<span>⚠️</span>} colorClass="text-danger" />
          </AnimatedCard>
        </div>
        <div className="lg:col-span-3">
          <AnimatedCard>
            <MetricCard label="Resolved" value={189} icon={<span>✅</span>} colorClass="text-success" progress={80} />
          </AnimatedCard>
        </div>
        <div className="lg:col-span-3">
          <AnimatedCard>
            <MetricCard label="Avg. Fix Time" value={2} icon={<span>⏱️</span>} colorClass="text-warning" />
          </AnimatedCard>
        </div>

        <div className="md:col-span-2 lg:col-span-12">
          <VulnerabilityTable />
        </div>

        <div className="md:col-span-2 lg:col-span-8">
          <VulnerabilityChart />
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <CodePreview code={codeSnippet} language="javascript" />
        </div>
      </div>
    </div>
  )
}

export default DashboardView
