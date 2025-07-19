import React, { useState } from 'react'
import DashboardIcon from './icons/DashboardIcon'
import CodeIcon from './icons/CodeIcon'
import ShieldIcon from './icons/ShieldIcon'
import { HiChat } from 'react-icons/hi'
import Dropdown from './ui/Dropdown'

type ViewType = 'dashboard' | 'vulnerabilities' | 'chat'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'dashboard' | 'vulnerabilities' | 'chat') => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(false)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, notify: 0 },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldIcon, notify: 3 },
    { id: 'chat', label: 'AI Chat', icon: HiChat, notify: 1 },
  ]

  return (
    <div className={`h-full transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} bg-gray-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col`}>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <CodeIcon className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Codie</h1>
                <p className="text-xs text-gray-400">AI Code Reviewer</p>
              </div>
            )}
          </div>
          <button className="text-gray-400" onClick={() => setCollapsed((c) => !c)}>{collapsed ? '›' : '‹'}</button>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewType)}
                className={`relative w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-500/20 text-blue-400 shadow-inner shadow-blue-500/20' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span className="font-medium flex-1 text-left">{item.label}</span>}
                {item.notify > 0 && <span className="absolute top-0 right-0 mt-0.5 mr-1 text-xs bg-red-500 rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{item.notify}</span>}
              </button>
            )
          })}
        </nav>

        <div className="pt-4">
          {!collapsed && (
            <Dropdown label="Project">
              <button className="block w-full text-left px-2 py-1 hover:bg-white/5 rounded">Project Alpha</button>
              <button className="block w-full text-left px-2 py-1 hover:bg-white/5 rounded">Project Beta</button>
            </Dropdown>
          )}
        </div>

        <div className="mt-auto pt-8">
          <div className="glass p-3 flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">U</span>
              </div>
              <span className="absolute bottom-0 right-0 block w-2 h-2 bg-green-400 rounded-full"></span>
            </div>
            {!collapsed && (
              <div>
                <p className="font-medium text-white">Developer</p>
                <p className="text-xs text-gray-400">Free Plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
