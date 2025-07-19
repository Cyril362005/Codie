// Frontend Configuration for Codie Platform
// API Endpoints and Environment Settings

export const config = {
  // API Endpoints
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    analysisUrl: import.meta.env.VITE_ANALYSIS_URL || 'http://localhost:8001',
    chatUrl: import.meta.env.VITE_CHAT_URL || 'http://localhost:8002',
    authUrl: import.meta.env.VITE_AUTH_URL || 'http://localhost:8003',
    cacheUrl: import.meta.env.VITE_CACHE_URL || 'http://localhost:8004',
    monitoringUrl: import.meta.env.VITE_MONITORING_URL || 'http://localhost:8005',
    aiUrl: import.meta.env.VITE_AI_URL || 'http://localhost:8006',
  },

  // Development Settings
  dev: {
    mode: import.meta.env.VITE_DEV_MODE === 'true',
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  },

  // Feature Flags
  features: {
    sso: import.meta.env.VITE_ENABLE_SSO !== 'false',
    realTimeChat: import.meta.env.VITE_ENABLE_REAL_TIME_CHAT !== 'false',
    aiInsights: import.meta.env.VITE_ENABLE_AI_INSIGHTS !== 'false',
  },

  // App Settings
  app: {
    name: 'Codie',
    version: '1.0.0',
    description: 'AI-Powered Code Review Platform',
  },

  // UI Settings
  ui: {
    defaultTheme: 'dark' as 'light' | 'dark',
    animations: true,
    notifications: true,
  },
};

export default config; 