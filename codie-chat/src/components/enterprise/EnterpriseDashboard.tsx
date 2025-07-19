import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiShield, FiTrendingUp, FiSettings, FiActivity, 
  FiDatabase, FiDollarSign,
  FiUserPlus, FiEdit, FiTrash2
} from 'react-icons/fi';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  projects: number;
  avatar?: string;
}

interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalVulnerabilities: number;
  securityScore: number;
  monthlyCost: number;
  storageUsed: number;
  apiCalls: number;
}

interface Project {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'archived' | 'suspended';
  lastAnalysis: string;
  vulnerabilities: number;
  securityScore: number;
  teamSize: number;
}

const EnterpriseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'projects' | 'security' | 'billing'>('overview');
  const [orgStats, setOrgStats] = useState<OrganizationStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const mockOrgStats: OrganizationStats = {
        totalUsers: 45,
        activeUsers: 38,
        totalProjects: 23,
        totalVulnerabilities: 156,
        securityScore: 87,
        monthlyCost: 2499.99,
        storageUsed: 45.2,
        apiCalls: 125000
      };

      const mockTeamMembers: TeamMember[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'admin',
          status: 'active',
          lastActive: '2024-01-20T10:30:00Z',
          projects: 8,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          role: 'manager',
          status: 'active',
          lastActive: '2024-01-20T09:15:00Z',
          projects: 5
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@company.com',
          role: 'developer',
          status: 'active',
          lastActive: '2024-01-20T11:45:00Z',
          projects: 3
        },
        {
          id: '4',
          name: 'David Kim',
          email: 'david.kim@company.com',
          role: 'developer',
          status: 'inactive',
          lastActive: '2024-01-15T14:20:00Z',
          projects: 2
        }
      ];

      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Platform',
          owner: 'Sarah Johnson',
          status: 'active',
          lastAnalysis: '2024-01-20T08:00:00Z',
          vulnerabilities: 12,
          securityScore: 92,
          teamSize: 8
        },
        {
          id: '2',
          name: 'API Gateway',
          owner: 'Michael Chen',
          status: 'active',
          lastAnalysis: '2024-01-19T16:30:00Z',
          vulnerabilities: 5,
          securityScore: 95,
          teamSize: 5
        },
        {
          id: '3',
          name: 'Mobile App Backend',
          owner: 'Emily Rodriguez',
          status: 'active',
          lastAnalysis: '2024-01-20T10:15:00Z',
          vulnerabilities: 8,
          securityScore: 88,
          teamSize: 4
        }
      ];

      setOrgStats(mockOrgStats);
      setTeamMembers(mockTeamMembers);
      setProjects(mockProjects);
      setLoading(false);
    };

    setTimeout(generateMockData, 1000);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'developer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Organization overview and management</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <FiUserPlus className="w-4 h-4" />
            <span>Invite User</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            <FiSettings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orgStats?.totalUsers}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{orgStats?.activeUsers} active
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orgStats?.securityScore}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +5% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${orgStats?.monthlyCost}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enterprise plan
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Calls</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orgStats?.apiCalls.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                This month
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <FiActivity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: FiActivity },
              { id: 'team', label: 'Team', icon: FiUsers },
              { id: 'projects', label: 'Projects', icon: FiDatabase },
              { id: 'security', label: 'Security', icon: FiShield },
              { id: 'billing', label: 'Billing', icon: FiDollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { action: 'New vulnerability detected', project: 'E-commerce Platform', time: '2 hours ago' },
                      { action: 'User joined team', user: 'Alex Thompson', time: '4 hours ago' },
                      { action: 'Security scan completed', project: 'API Gateway', time: '6 hours ago' },
                      { action: 'Project archived', project: 'Legacy System', time: '1 day ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.project || activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Add Team Member', icon: FiUserPlus, color: 'blue' },
                      { label: 'Create Project', icon: FiDatabase, color: 'green' },
                      { label: 'Security Scan', icon: FiShield, color: 'red' },
                      { label: 'View Reports', icon: FiTrendingUp, color: 'purple' }
                    ].map((action, index) => (
                      <button
                        key={index}
                        className={`p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <div className={`w-8 h-8 bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-lg flex items-center justify-center mb-2`}>
                          <action.icon className={`w-4 h-4 text-${action.color}-600`} />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <FiUserPlus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <FiUsers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h3>
                <button className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <FiDatabase className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <FiDatabase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Owner: {project.owner}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{project.securityScore}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Security</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{project.vulnerabilities}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Issues</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{project.teamSize}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Team</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiShield className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-red-900 dark:text-red-100">Critical Issues</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">3</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Require immediate attention</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiActivity className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">High Priority</h4>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">12</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Should be addressed soon</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiTrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900 dark:text-green-100">Security Score</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">87%</p>
                  <p className="text-sm text-green-700 dark:text-green-300">+5% this month</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Security Events</h4>
                <div className="space-y-2">
                  {[
                    { event: 'Vulnerability detected', severity: 'high', time: '2 hours ago' },
                    { event: 'Security scan completed', severity: 'info', time: '6 hours ago' },
                    { event: 'User access revoked', severity: 'warning', time: '1 day ago' },
                    { event: 'New security policy applied', severity: 'info', time: '2 days ago' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          event.severity === 'high' ? 'bg-red-500' :
                          event.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm text-gray-900 dark:text-white">{event.event}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{event.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Current Plan</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Plan</span>
                      <span className="font-medium text-gray-900 dark:text-white">Enterprise</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Cost</span>
                      <span className="font-medium text-gray-900 dark:text-white">${orgStats?.monthlyCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Users</span>
                      <span className="font-medium text-gray-900 dark:text-white">{orgStats?.totalUsers}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Storage</span>
                      <span className="font-medium text-gray-900 dark:text-white">{orgStats?.storageUsed}GB/500GB</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Usage This Month</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">API Calls</span>
                      <span className="font-medium text-gray-900 dark:text-white">{orgStats?.apiCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Projects</span>
                      <span className="font-medium text-gray-900 dark:text-white">{orgStats?.totalProjects}/50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Security Scans</span>
                      <span className="font-medium text-gray-900 dark:text-white">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reports Generated</span>
                      <span className="font-medium text-gray-900 dark:text-white">89</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Billing History</h4>
                <div className="space-y-3">
                  {[
                    { month: 'January 2024', amount: 2499.99, status: 'paid' },
                    { month: 'December 2023', amount: 2499.99, status: 'paid' },
                    { month: 'November 2023', amount: 1999.99, status: 'paid' }
                  ].map((bill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                      <span className="text-gray-900 dark:text-white">{bill.month}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900 dark:text-white">${bill.amount}</span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard; 