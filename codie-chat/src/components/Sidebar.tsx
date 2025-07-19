import React from 'react'
import DashboardIcon from './icons/DashboardIcon'
import CodeIcon from './icons/CodeIcon'
import ShieldIcon from './icons/ShieldIcon'
import { HiChat } from 'react-icons/hi'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'dashboard' | 'vulnerabilities' | 'chat') => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldIcon },
    { id: 'chat', label: 'AI Chat', icon: HiChat },
  ]

  return (
    <div className="w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <CodeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Codie
            </h1>
            <p className="text-xs text-gray-400">AI Code Reviewer</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="mt-auto pt-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">U</span>
              </div>
              <div>
                <p className="font-medium text-white">Developer</p>
                <p className="text-xs text-gray-400">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
