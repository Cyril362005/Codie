// API Service Layer for Codie Platform
// Connects frontend to all backend microservices

import config from '../config';

// API Base URLs from config
const API_BASE_URL = config.api.baseUrl;
const ANALYSIS_URL = config.api.analysisUrl;
const CHAT_URL = config.api.chatUrl;
const AUTH_URL = config.api.authUrl;
const CACHE_URL = config.api.cacheUrl;
const MONITORING_URL = config.api.monitoringUrl;
const AI_URL = config.api.aiUrl;

// Common headers
const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API request function
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication Service
export const authAPI = {
  // User registration
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    return apiRequest(`${AUTH_URL}/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest(`${AUTH_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Verify token
  verifyToken: async (token: string) => {
    return apiRequest(`${AUTH_URL}/verify`, {
      headers: getHeaders(token),
    });
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    return apiRequest(`${AUTH_URL}/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  // SSO login
  ssoLogin: async (provider: 'google' | 'github' | 'azure') => {
    return apiRequest(`${AUTH_URL}/sso/${provider}`, {
      method: 'POST',
    });
  },
};

// Analysis Service
export const analysisAPI = {
  // Start repository analysis
  startAnalysis: async (data: {
    git_url: string;
    chat_id: string;
    token?: string;
  }) => {
    return apiRequest(`${ANALYSIS_URL}/start-analysis`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Get analysis status
  getAnalysisStatus: async (analysisId: string, token?: string) => {
    return apiRequest(`${ANALYSIS_URL}/analysis-status/${analysisId}`, {
      headers: getHeaders(token),
    });
  },

  // Get analysis results
  getAnalysisResults: async (analysisId: string, token?: string) => {
    return apiRequest(`${ANALYSIS_URL}/analysis-results/${analysisId}`, {
      headers: getHeaders(token),
    });
  },

  // Apply code fix
  applyFix: async (data: {
    repo_path: string;
    file_path: string;
    new_code: string;
    token?: string;
  }) => {
    return apiRequest(`${ANALYSIS_URL}/api/v1/apply-fix`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },
};

// Chat Service
export const chatAPI = {
  // Send message
  sendMessage: async (data: {
    message: string;
    chat_id: string;
    context?: any;
    token?: string;
  }) => {
    return apiRequest(`${CHAT_URL}/send-message`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Get chat history
  getChatHistory: async (chatId: string, token?: string) => {
    return apiRequest(`${CHAT_URL}/chat-history/${chatId}`, {
      headers: getHeaders(token),
    });
  },

  // Create new chat
  createChat: async (data: { name: string; token?: string }) => {
    return apiRequest(`${CHAT_URL}/create-chat`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },
};

// AI Service
export const aiAPI = {
  // Analyze code
  analyzeCode: async (data: {
    code: string;
    language: string;
    token?: string;
  }) => {
    return apiRequest(`${AI_URL}/analyze`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Predict vulnerability
  predictVulnerability: async (data: {
    code: string;
    language: string;
    token?: string;
  }) => {
    return apiRequest(`${AI_URL}/predict-vulnerability`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Analyze code quality
  analyzeQuality: async (data: {
    code: string;
    language: string;
    token?: string;
  }) => {
    return apiRequest(`${AI_URL}/analyze-quality`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Detect patterns
  detectPatterns: async (data: {
    code: string;
    language: string;
    token?: string;
  }) => {
    return apiRequest(`${AI_URL}/detect-patterns`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Get AI insights
  getInsights: async (token?: string) => {
    return apiRequest(`${AI_URL}/insights`, {
      headers: getHeaders(token),
    });
  },
};

// Cache Service
export const cacheAPI = {
  // Get cached data
  get: async (key: string, token?: string) => {
    return apiRequest(`${CACHE_URL}/get/${key}`, {
      headers: getHeaders(token),
    });
  },

  // Set cached data
  set: async (data: { key: string; value: any; ttl?: number; token?: string }) => {
    return apiRequest(`${CACHE_URL}/set`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Delete cached data
  delete: async (key: string, token?: string) => {
    return apiRequest(`${CACHE_URL}/delete/${key}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
  },
};

// Monitoring Service
export const monitoringAPI = {
  // Get system health
  getHealth: async (token?: string) => {
    return apiRequest(`${MONITORING_URL}/health`, {
      headers: getHeaders(token),
    });
  },

  // Get metrics
  getMetrics: async (token?: string) => {
    return apiRequest(`${MONITORING_URL}/metrics`, {
      headers: getHeaders(token),
    });
  },

  // Get alerts
  getAlerts: async (token?: string) => {
    return apiRequest(`${MONITORING_URL}/alerts`, {
      headers: getHeaders(token),
    });
  },

  // Create alert
  createAlert: async (data: {
    type: string;
    message: string;
    severity: string;
    token?: string;
  }) => {
    return apiRequest(`${MONITORING_URL}/alerts`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },
};

// Project Management API
export const projectAPI = {
  // Get user projects
  getProjects: async (token?: string) => {
    return apiRequest(`${API_BASE_URL}/projects`, {
      headers: getHeaders(token),
    });
  },

  // Create project
  createProject: async (data: {
    name: string;
    description: string;
    git_url: string;
    token?: string;
  }) => {
    return apiRequest(`${API_BASE_URL}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Get project details
  getProject: async (projectId: string, token?: string) => {
    return apiRequest(`${API_BASE_URL}/projects/${projectId}`, {
      headers: getHeaders(token),
    });
  },

  // Update project
  updateProject: async (data: {
    id: string;
    name?: string;
    description?: string;
    token?: string;
  }) => {
    return apiRequest(`${API_BASE_URL}/projects/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Delete project
  deleteProject: async (projectId: string, token?: string) => {
    return apiRequest(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
  },
};

// Reports API
export const reportsAPI = {
  // Generate report
  generateReport: async (data: {
    project_id: string;
    report_type: string;
    format: 'pdf' | 'html' | 'json';
    token?: string;
  }) => {
    return apiRequest(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Get report history
  getReportHistory: async (projectId: string, token?: string) => {
    return apiRequest(`${API_BASE_URL}/reports/history/${projectId}`, {
      headers: getHeaders(token),
    });
  },
};

// Enterprise API
export const enterpriseAPI = {
  // Get team members
  getTeamMembers: async (token?: string) => {
    return apiRequest(`${API_BASE_URL}/enterprise/team`, {
      headers: getHeaders(token),
    });
  },

  // Invite team member
  inviteMember: async (data: {
    email: string;
    role: string;
    token?: string;
  }) => {
    return apiRequest(`${API_BASE_URL}/enterprise/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getHeaders(data.token),
    });
  },

  // Get billing info
  getBilling: async (token?: string) => {
    return apiRequest(`${API_BASE_URL}/enterprise/billing`, {
      headers: getHeaders(token),
    });
  },
};

// WebSocket connection for real-time features
export const createWebSocketConnection = (token?: string) => {
  const wsUrl = CHAT_URL.replace('http', 'ws');
  const url = token ? `${wsUrl}/ws?token=${token}` : `${wsUrl}/ws`;
  
  return new WebSocket(url);
};

// Export all APIs
export default {
  auth: authAPI,
  analysis: analysisAPI,
  chat: chatAPI,
  ai: aiAPI,
  cache: cacheAPI,
  monitoring: monitoringAPI,
  projects: projectAPI,
  reports: reportsAPI,
  enterprise: enterpriseAPI,
  createWebSocketConnection,
}; 