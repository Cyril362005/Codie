import React, { useState } from 'react'
import DashboardIcon from './icons/DashboardIcon'
import CodeIcon from './icons/CodeIcon'
import ShieldIcon from './icons/ShieldIcon'
import { HiChat, HiOutlinePuzzle, HiOutlineCog, HiOutlineBell } from 'react-icons/hi'
import { FiUser, FiLogOut, FiGitBranch, FiActivity, FiFileText, FiUsers, FiSearch } from 'react-icons/fi'
import ProjectSelector from './ProjectSelector'
import { useAuth } from '../contexts/AuthContext'

<<<<<<< Updated upstream
type ViewType = 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations' | 'code-explorer'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations' | 'code-explorer') => void
=======
type ViewType = 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations' | 'code-explorer' | 'projects' | 'analytics' | 'reports' | 'monitoring' | 'enterprise' | 'ai-insights'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations' | 'code-explorer' | 'projects' | 'analytics' | 'reports' | 'monitoring' | 'enterprise' | 'ai-insights') => void
>>>>>>> Stashed changes
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768)
  const { user, logout } = useAuth()
  
  const menuItems = [
<<<<<<< Updated upstream
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, notify: 0 },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldIcon, notify: 3 },
    { id: 'code-explorer', label: 'Code Explorer', icon: CodeIcon, notify: 0 },
    { id: 'chat', label: 'AI Chat', icon: HiChat, notify: 1 },
    { id: 'integrations', label: 'Integrations', icon: HiOutlinePuzzle, notify: 0 },
=======
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: DashboardIcon, 
      notify: 0,
      description: 'Overview and metrics'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: FiGitBranch, 
      notify: 0,
      description: 'Manage repositories'
    },
    { 
      id: 'vulnerabilities', 
      label: 'Security', 
      icon: ShieldIcon, 
      notify: 3,
      description: 'Vulnerability analysis'
    },
    { 
      id: 'code-explorer', 
      label: 'Code Explorer', 
      icon: CodeIcon, 
      notify: 2,
      description: 'Interactive code review'
    },
    { 
      id: 'chat', 
      label: 'AI Assistant', 
      icon: HiChat, 
      notify: 1,
      description: 'AI-powered chat'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: FiActivity, 
      notify: 0,
      description: 'Advanced analytics'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FiFileText, 
      notify: 0,
      description: 'Generate reports'
    },
    { 
      id: 'monitoring', 
      label: 'Monitoring', 
      icon: FiActivity, 
      notify: 0,
      description: 'System monitoring'
    },
    { 
      id: 'enterprise', 
      label: 'Enterprise', 
      icon: FiUsers, 
      notify: 0,
      description: 'Team management'
    },
    { 
      id: 'ai-insights', 
      label: 'AI Insights', 
      icon: FiActivity, 
      notify: 0,
      description: 'ML model insights'
    },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      icon: HiOutlinePuzzle, 
      notify: 0,
      description: 'Third-party integrations'
    },
>>>>>>> Stashed changes
  ]

  return (
    <div className={`h-full transition-all duration-300 ease-in-out ${
      collapsed ? 'w-16' : 'w-64'
    } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`flex items-center justify-between ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <CodeIcon className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Codie</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Code Review</p>
              </div>
            )}
          </div>
          <button 
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} 
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input pl-10"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`relative w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group ${
                isActive 
                  ? 'sidebar-item-active shadow-sm' 
                  : 'sidebar-item-inactive'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                }`} />
                {item.notify > 0 && (
                  <span 
                    aria-label={`${item.notify} notifications`} 
                    className="absolute -top-1 -right-1 text-xs bg-danger-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm"
                  >
                    {item.notify}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <span className="block">{item.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {item.description}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Project Selector */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <ProjectSelector />
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" role="region" aria-label="User profile">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {user ? user.username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-success-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" aria-label="User is online"></span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {user ? user.username : 'Guest'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user ? user.email : 'Not signed in'}
                </p>
              </div>
            )}
          </div>

          {/* User Actions */}
          {!collapsed && user && (
            <div className="space-y-1">
              <button
                onClick={() => {/* TODO: Add profile page */}}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <FiUser className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {/* TODO: Add settings */}}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <HiOutlineCog className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {/* TODO: Add notifications */}}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <HiOutlineBell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/20 transition-colors duration-200"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
