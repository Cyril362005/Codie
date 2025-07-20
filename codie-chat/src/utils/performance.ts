import { ProfilerOnRenderCallback, SchedulerInteraction } from 'react'

export interface PerformanceMetrics {
  id: string
  phase: 'mount' | 'update'
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
  interactions: Set<SchedulerInteraction>
}

export interface WebVitalsMetrics {
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
  fcp?: number
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number
}

/**
 * Performance metrics collector for React components
 */
class PerformanceCollector {
  private metrics: PerformanceMetrics[] = []
  private readonly maxMetrics = 1000 // Prevent memory leaks
  private slowRenderThreshold = 16 // 60fps threshold

  onRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    const metric: PerformanceMetrics = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    }
    
    // Add metric with size limit
    this.metrics.push(metric)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift() // Remove oldest metric
    }
    
    // Log performance issues in development only
    if (import.meta.env.DEV) {
      if (actualDuration > this.slowRenderThreshold) {
        console.warn(`Slow render detected in ${id}:`, {
          phase,
          actualDuration: `${actualDuration.toFixed(2)}ms`,
          baseDuration: `${baseDuration.toFixed(2)}ms`,
          threshold: `${this.slowRenderThreshold}ms`
        })
      }
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getMetricsByComponent(componentId: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.id === componentId)
  }

  getAverageRenderTime(componentId?: string): number {
    const relevantMetrics = componentId 
      ? this.getMetricsByComponent(componentId)
      : this.metrics

    if (relevantMetrics.length === 0) return 0

    const totalTime = relevantMetrics.reduce((sum, metric) => sum + metric.actualDuration, 0)
    return totalTime / relevantMetrics.length
  }

  clear(): void {
    this.metrics = []
  }

  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        totalRenders: this.metrics.length,
        averageRenderTime: this.getAverageRenderTime(),
        slowRenders: this.metrics.filter(m => m.actualDuration > 16).length
      }
    }, null, 2)
  }
}

export const performanceCollector = new PerformanceCollector()

/**
 * Web Vitals collector with proper cleanup
 */
class WebVitalsCollector {
  private observers: PerformanceObserver[] = []
  private metrics: WebVitalsMetrics = {}
  private clsValue = 0
  private clsSessionValue = 0
  private clsSessionEntries: PerformanceEntry[] = []

  measureWebVitals(): void {
    // Measure Largest Contentful Paint (LCP)
    this.observeLCP()
    
    // Measure First Input Delay (FID)
    this.observeFID()
    
    // Measure Cumulative Layout Shift (CLS)
    this.observeCLS()
    
    // Measure First Contentful Paint (FCP)
    this.observeFCP()
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.lcp = lastEntry.startTime
        
        if (import.meta.env.DEV) {
          console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`)
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (e) {
      // LCP not supported
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0] as FirstInputEntry
        const fid = firstInput.processingStart - firstInput.startTime
        this.metrics.fid = fid
        
        if (import.meta.env.DEV) {
          console.log(`FID: ${fid.toFixed(2)}ms`)
        }
      })
      
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (e) {
      // FID not supported
    }
  }

  private observeCLS(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as LayoutShiftEntry[]) {
          if (!entry.hadRecentInput) {
            this.clsValue += entry.value
            this.clsSessionValue += entry.value
            this.clsSessionEntries.push(entry)
          }
        }
        
        this.metrics.cls = this.clsValue
        
        if (import.meta.env.DEV && this.clsValue > 0) {
          console.log(`CLS: ${this.clsValue.toFixed(4)}`)
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (e) {
      // CLS not supported
    }
  }

  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntriesByName('first-contentful-paint')
        if (entries.length > 0) {
          this.metrics.fcp = entries[0].startTime
          
          if (import.meta.env.DEV) {
            console.log(`FCP: ${entries[0].startTime.toFixed(2)}ms`)
          }
        }
      })
      
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (e) {
      // FCP not supported
    }
  }

  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
const webVitalsCollector = new WebVitalsCollector()

/**
 * Memory usage monitoring with proper typing
 */
interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export const measureMemoryUsage = (): { used: number; total: number; limit: number } | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory as MemoryInfo
    const result = {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    }
    
    if (import.meta.env.DEV) {
      console.log('Memory Usage:', {
        used: `${result.used} MB`,
        total: `${result.total} MB`,
        limit: `${result.limit} MB`
      })
    }
    
    return result
  }
  
  return null
}

/**
 * Start performance monitoring with cleanup
 */
let memoryMonitorInterval: number | null = null

export const startPerformanceMonitoring = (): (() => void) => {
  if (typeof window !== 'undefined') {
    webVitalsCollector.measureWebVitals()
    
    // Monitor memory usage every 30 seconds in development
    if (import.meta.env.DEV) {
      memoryMonitorInterval = window.setInterval(measureMemoryUsage, 30000)
    }
  }
  
  // Return cleanup function
  return () => {
    webVitalsCollector.cleanup()
    if (memoryMonitorInterval !== null) {
      clearInterval(memoryMonitorInterval)
      memoryMonitorInterval = null
    }
  }
}

// Export Web Vitals collector for advanced usage
export const getWebVitals = () => webVitalsCollector.getMetrics()
