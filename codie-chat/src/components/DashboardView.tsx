import React from 'react';
import AnimatedCard from './AnimatedCard';
import MetricCard from './MetricCard';
import VulnerabilityTable from './VulnerabilityTable';
import VulnerabilityChart from './VulnerabilityChart';

interface AnalysisData {
  hotspots: Record<string, number>;
  complexity_reports: Record<string, unknown>;
  vulnerabilities: Record<string, unknown>[];
  code_coverage_percentage: number;
  top_refactoring_candidate: {
    file: string;
    score: number;
  };
}

interface DashboardViewProps {
  analysisData: AnalysisData;
}

const DashboardView: React.FC<DashboardViewProps> = ({ analysisData }) => {

  return (
    <div className="h-full p-lg space-y-lg overflow-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="h1 text-white mb-xs">Security Dashboard</h1>
          <p className="text-gray-400">Monitor your code security metrics and vulnerabilities</p>
        </div>
      </div>

      {analysisData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-3">
            <AnimatedCard>
              <MetricCard label="Vulnerabilities" value={analysisData.vulnerabilities.length} icon={<span>⚠️</span>} colorClass="text-danger" />
            </AnimatedCard>
          </div>
          <div className="lg:col-span-3">
            <AnimatedCard>
              <MetricCard label="Hotspots" value={Object.keys(analysisData.hotspots).length} icon={<span>🔥</span>} colorClass="text-warning" />
            </AnimatedCard>
          </div>
          <div className="lg:col-span-3">
            <AnimatedCard>
              <MetricCard label="Code Coverage" value={`${analysisData.code_coverage_percentage}%`} icon={<span>🎯</span>} colorClass="text-success" />
            </AnimatedCard>
          </div>
          <div className="lg:col-span-3">
            <AnimatedCard>
              <MetricCard label="Top Refactoring" value={analysisData.top_refactoring_candidate.file} icon={<span>🔧</span>} />
            </AnimatedCard>
          </div>

          <div className="md:col-span-2 lg:col-span-12">
            <VulnerabilityTable vulnerabilities={analysisData.vulnerabilities} />
          </div>

          <div className="md:col-span-2 lg:col-span-12">
            <VulnerabilityChart />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView
