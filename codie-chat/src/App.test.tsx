import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Profiler } from 'react'
import App from './App'
import { performanceCollector } from './utils/performance'

// Mock the auth context
vi.mock('./contexts/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    loading: false
  })
}))

// Mock the API call
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: 'success' })
  })
) as any

// Mock lazy-loaded components to speed up tests
vi.mock('./components/DashboardView', () => ({
  default: () => <div data-testid="dashboard">Dashboard View</div>
}))

vi.mock('./components/ChatPanel', () => ({
  default: () => <div data-testid="chat">Chat Panel</div>
}))

vi.mock('./components/Sidebar', () => ({
  default: ({ currentView, onViewChange }: any) => (
    <div data-testid="sidebar">
      <button onClick={() => onViewChange('dashboard')}>Dashboard</button>
      <button onClick={() => onViewChange('chat')}>Chat</button>
      <span>Current: {currentView}</span>
    </div>
  )
}))

describe('App Component Performance Tests', () => {
  it('should render without crashing', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })
  })

  it('should measure render performance', async () => {
    let renderTime = 0
    
    const onRenderCallback = (id: string, phase: 'mount' | 'update', actualDuration: number) => {
      if (id === 'App' && phase === 'mount') {
        renderTime = actualDuration
      }
    }

    render(
      <Profiler id="App" onRender={onRenderCallback}>
        <App />
      </Profiler>
    )

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })

    // Performance assertion - app should render within reasonable time
    expect(renderTime).toBeLessThan(100) // 100ms threshold
  })

  it('should collect performance metrics', async () => {
    performanceCollector.clear()
    
    render(
      <Profiler id="App" onRender={performanceCollector.onRender}>
        <App />
      </Profiler>
    )

    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })

    const metrics = performanceCollector.getMetrics()
    expect(metrics.length).toBeGreaterThan(0)
    
    const appMetrics = performanceCollector.getMetricsByComponent('App')
    expect(appMetrics.length).toBeGreaterThan(0)
  })

  it('should handle loading states efficiently', async () => {
    // Mock slower API response
    global.fetch = vi.fn(() =>
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' })
        }), 100)
      )
    ) as any

    render(<App />)
    
    // Should show loading state initially
    expect(screen.getByText(/Loading Codie/i)).toBeInTheDocument()
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should export performance metrics in correct format', () => {
    performanceCollector.clear()
    
    // Simulate some metrics
    performanceCollector.onRender('TestComponent', 'mount', 10, 8, 0, 10, new Set())
    performanceCollector.onRender('TestComponent', 'update', 5, 8, 10, 15, new Set())
    
    const exported = performanceCollector.exportMetrics()
    const parsed = JSON.parse(exported)
    
    expect(parsed).toHaveProperty('timestamp')
    expect(parsed).toHaveProperty('metrics')
    expect(parsed).toHaveProperty('summary')
    expect(parsed.summary).toHaveProperty('totalRenders', 2)
    expect(parsed.summary).toHaveProperty('averageRenderTime')
    expect(parsed.summary).toHaveProperty('slowRenders')
  })
})
