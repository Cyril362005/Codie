import React, { useState, useEffect } from 'react';
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

const DashboardView: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="h-full flex items-center justify-center text-white">Analyzing repository...</div>;
  }

  if (error) {
    return <div className="h-full flex items-center justify-center text-danger">{error}</div>;
  }

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
