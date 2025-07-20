import '@testing-library/jest-dom'

// Global test setup
beforeAll(() => {
  // Setup any global mocks or configurations
})

beforeEach(() => {
  // Reset any mocks between tests
})

afterEach(() => {
  // Cleanup after each test
})

afterAll(() => {
  // Global cleanup
})

// Mock global constants that might be defined in Vite config
Object.defineProperty(globalThis, '__API_BASE_URL__', {
  value: 'http://localhost:8000',
  writable: true
})

Object.defineProperty(globalThis, '__ANALYSIS_URL__', {
  value: 'http://localhost:8001',
  writable: true
})

Object.defineProperty(globalThis, '__CHAT_URL__', {
  value: 'http://localhost:8002',
  writable: true
})

Object.defineProperty(globalThis, '__AUTH_URL__', {
  value: 'http://localhost:8003',
  writable: true
})

Object.defineProperty(globalThis, '__CACHE_URL__', {
  value: 'http://localhost:8004',
  writable: true
})

Object.defineProperty(globalThis, '__MONITORING_URL__', {
  value: 'http://localhost:8005',
  writable: true
})

Object.defineProperty(globalThis, '__AI_URL__', {
  value: 'http://localhost:8006',
  writable: true
})
