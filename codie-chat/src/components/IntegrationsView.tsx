import React from 'react';
import { FiGithub, FiGitlab, FiBox } from 'react-icons/fi';

const integrations = [
  { name: 'GitHub', icon: FiGithub, description: 'Connect your GitHub repositories for automated scanning.' },
  { name: 'GitLab', icon: FiGitlab, description: 'Connect your GitLab projects to analyze your code.' },
  { name: 'Bitbucket', icon: FiBox, description: 'Analyze your Bitbucket repositories for vulnerabilities.' },
];

const IntegrationsView: React.FC = () => {
  return (
    <div className="p-lg">
      <h1 className="h1 text-white mb-lg">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div key={integration.name} className="glass-1 p-lg flex flex-col items-start">
              <Icon className="w-10 h-10 text-accent mb-md" />
              <h3 className="h3 text-white mb-sm">{integration.name}</h3>
              <p className="text-gray-400 mb-md flex-1">{integration.description}</p>
              <button className="bg-accent text-primary font-semibold px-md py-sm rounded-md hover:bg-accent/80 transition-colors">
                Connect
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntegrationsView;
