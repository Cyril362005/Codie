import React, { useState } from 'react'
import DashboardIcon from './icons/DashboardIcon'
import CodeIcon from './icons/CodeIcon'
import ShieldIcon from './icons/ShieldIcon'
import { HiChat, HiOutlinePuzzle } from 'react-icons/hi'
import ProjectSelector from './ProjectSelector'

type ViewType = 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'dashboard' | 'vulnerabilities' | 'chat' | 'integrations') => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(false)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, notify: 0 },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldIcon, notify: 3 },
    { id: 'chat', label: 'AI Chat', icon: HiChat, notify: 1 },
    { id: 'integrations', label: 'Integrations', icon: HiOutlinePuzzle, notify: 0 },
  ]

  return (
    <div className={`h-full transition-all duration-300 ${collapsed ? 'w-24' : 'w-64'} glass-2 flex flex-col`}>
      <div className="p-lg flex-1 flex flex-col">
        <div className={`flex items-center justify-between mb-xl ${collapsed ? 'px-md' : ''}`}>
          <div className="flex items-center space-x-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-deep-purple rounded-md flex items-center justify-center">
              <CodeIcon className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-accent to-deep-purple bg-clip-text text-transparent">Codie</h1>
              </div>
            )}
          </div>
          <button className="text-gray-400 hover:text-white" onClick={() => setCollapsed((c) => !c)} style={{minHeight: '44px', minWidth: '44px'}}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="space-y-sm flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewType)}
                className={`relative w-full flex items-center space-x-md px-md rounded-md transition-all duration-200 ${isActive ? 'bg-accent/20 text-accent shadow-inner shadow-accent/20' : 'hover:bg-white/5 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-accent/10'}`}
                style={{minHeight: '44px'}}
              >
                <Icon className="w-6 h-6" />
                {!collapsed && <span className="font-medium flex-1 text-left">{item.label}</span>}
                {item.notify > 0 && <span className="absolute top-0 right-0 mt-xs mr-xs text-xs bg-danger rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{item.notify}</span>}
              </button>
            )
          })}
        </nav>

        <div className="pt-lg">
          {!collapsed && (
            <ProjectSelector />
          )}
        </div>

        <div className="mt-auto pt-xl">
          <div className="glass-1 p-md flex items-center space-x-md">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-deep-purple to-accent rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">U</span>
              </div>
              <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-success rounded-full border-2 border-primary"></span>
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
