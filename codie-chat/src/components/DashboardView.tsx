import MetricCard from './MetricCard';
import VulnerabilityFeed from './VulnerabilityFeed';
import { FaHeartbeat, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function DashboardView() {
  const vulnerabilities = [
    { id: 1, title: 'SQL Injection in login.js', severity: 'High' },
    { id: 2, title: 'XSS in comment section', severity: 'Medium' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Project Health" value="Good" Icon={FaHeartbeat} color="green" />
        <MetricCard title="Test Coverage" value="82%" Icon={FaShieldAlt} color="blue" />
        <MetricCard title="Critical Issues" value="3" Icon={FaExclamationTriangle} color="red" />
      </div>
      <VulnerabilityFeed vulnerabilities={vulnerabilities} />
    </div>
  );
}