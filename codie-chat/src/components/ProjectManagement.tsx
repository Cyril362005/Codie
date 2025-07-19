import React, { useState, useEffect } from 'react';
import { FiPlus, FiGitBranch, FiClock, FiCheckCircle, FiAlertCircle, FiTrash2, FiEdit2 } from 'react-icons/fi';
// import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: number;
  name: string;
  repository_url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  last_analysis?: {
    vulnerabilities_count: number;
    code_coverage: number;
    complexity_score: number;
  };
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', repository_url: '' });
  // const { user } = useAuth();

  // Mock data for demonstration
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: 1,
        name: 'E-commerce Platform',
        repository_url: 'https://github.com/user/ecommerce-app',
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        last_analysis: {
          vulnerabilities_count: 3,
          code_coverage: 85.2,
          complexity_score: 7.8
        }
      },
      {
        id: 2,
        name: 'API Gateway',
        repository_url: 'https://github.com/user/api-gateway',
        status: 'running',
        created_at: '2024-01-20T14:15:00Z'
      },
      {
        id: 3,
        name: 'Mobile App Backend',
        repository_url: 'https://github.com/user/mobile-backend',
        status: 'failed',
        created_at: '2024-01-18T09:45:00Z'
      }
    ];
    
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock API call
    const newProjectData: Project = {
      id: Date.now(),
      name: newProject.name,
      repository_url: newProject.repository_url,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    setProjects([...projects, newProjectData]);
    setNewProject({ name: '', repository_url: '' });
    setShowAddForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your code analysis projects</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Add Project Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Project</h3>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label htmlFor="repository-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repository URL
              </label>
              <input
                id="repository-url"
                type="url"
                value={newProject.repository_url}
                onChange={(e) => setNewProject({ ...newProject, repository_url: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://github.com/user/repository"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Project
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {project.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiGitBranch className="w-4 h-4" />
                  <span className="truncate">{project.repository_url}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(project.status)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>

            {project.last_analysis && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Vulnerabilities:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {project.last_analysis.vulnerabilities_count}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Code Coverage:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {project.last_analysis.code_coverage}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Complexity:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {project.last_analysis.complexity_score}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                View Analysis
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <FiGitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by adding your first repository for analysis
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement; 