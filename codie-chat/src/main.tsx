import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { startPerformanceMonitoring } from './utils/performance'

// Initialize performance monitoring
if (import.meta.env.PROD) {
  startPerformanceMonitoring()
}

// Get root element with proper error handling
const rootElement = document.getElementById('root')

if (!rootElement) {
  // Fallback error message if root element is missing
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f3f4f6;
      color: #111827;
    ">
      <div style="text-align: center;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Application Error</h1>
        <p style="color: #6b7280;">Failed to initialize the application. Please refresh the page.</p>
      </div>
    </div>
  `
  throw new Error('Root element not found. Make sure index.html has a div with id="root"')
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Enable React DevTools in development
if (import.meta.env.DEV) {
  // @ts-ignore
  window.React = React
}
