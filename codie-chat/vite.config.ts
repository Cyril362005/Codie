import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer plugin (only in build mode)
    process.env.ANALYZE && visualizer({
      filename: 'reports/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  base: '/',
  server: {
    port: 3000,
    host: true,
    // Temporarily disable proxies for testing
    proxy: {
      // Comment out for testing
      /*
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/analysis': {
        target: 'http://localhost:8001',
        changeOrigin: true
      },
      '/chat': {
        target: 'http://localhost:8002',
        changeOrigin: true
      },
      */
      '/auth': {
        target: 'http://localhost:8003',
        changeOrigin: true
      },
      /* Temporarily disabled for testing
      '/cache': {
        target: 'http://localhost:8004',
        changeOrigin: true
      },
      '/monitoring': {
        target: 'http://localhost:8005',
        changeOrigin: true
      },
      '/ai': {
        target: 'http://localhost:8006',
        changeOrigin: true
      }
      */
    }
  },
  define: {
    // Define global constants for API endpoints
    __API_BASE_URL__: JSON.stringify('http://localhost:8000'),
    __ANALYSIS_URL__: JSON.stringify('http://localhost:8001'),
    __CHAT_URL__: JSON.stringify('http://localhost:8002'),
    __AUTH_URL__: JSON.stringify('http://localhost:8003'),
    __CACHE_URL__: JSON.stringify('http://localhost:8004'),
    __MONITORING_URL__: JSON.stringify('http://localhost:8005'),
    __AI_URL__: JSON.stringify('http://localhost:8006')
  }
})
