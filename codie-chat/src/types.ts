/**
 * Severity levels for vulnerabilities following CVSS standards
 */
export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

/**
 * CVSS score range: 0.0 to 10.0
 */
export type CVSSScore = number

/**
 * Represents a security vulnerability found in the code
 */
export interface Vulnerability {
  /** Brief title describing the vulnerability */
  title: string
  /** Severity level of the vulnerability */
  severity: VulnerabilitySeverity
  /** File path where the vulnerability was found */
  file_path: string
  /** Line number in the file (optional) */
  line_number?: number
  /** Detailed description of the vulnerability */
  description?: string
  /** CVSS score (0.0-10.0) */
  cvss_score?: CVSSScore
  /** URL to CVE database entry */
  cve_url?: string
  /** Suggested remediation steps */
  remediation?: string
  /** Confidence level of the detection (0-100) */
  confidence?: number
}

/**
 * Code complexity metrics
 */
export interface ComplexityReport {
  /** Cyclomatic complexity score */
  cyclomatic_complexity: number
  /** Maintainability index (0-100, higher is better) */
  maintainability_index: number
  /** Lines of code */
  loc?: number
  /** Cognitive complexity score */
  cognitive_complexity?: number
}

/**
 * Refactoring candidate information
 */
export interface RefactoringCandidate {
  /** File path */
  file: string
  /** Priority score for refactoring */
  score: number
  /** Reasons for refactoring */
  reasons?: string[]
}

/**
 * Complete analysis data for a codebase
 */
export interface AnalysisData {
  /** Files with high complexity scores */
  hotspots: Record<string, number>
  /** Detailed complexity reports per file */
  complexity_reports: Record<string, ComplexityReport>
  /** List of detected vulnerabilities */
  vulnerabilities: Vulnerability[]
  /** Overall code coverage percentage (0-100) */
  code_coverage_percentage?: number
  /** Top candidate for refactoring */
  top_refactoring_candidate: RefactoringCandidate
  /** File contents for display */
  file_contents: Record<string, string>
  /** Analysis timestamp */
  analyzed_at?: string
  /** Analysis ID for tracking */
  analysis_id?: string
}

/**
 * User authentication data
 */
export interface User {
  id: number | string
  name: string
  email: string
  avatar_url?: string
  role?: 'admin' | 'developer' | 'viewer'
  created_at?: string
}

/**
 * API error response
 */
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
  timestamp?: string
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T
  error?: ApiError
  success: boolean
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}
