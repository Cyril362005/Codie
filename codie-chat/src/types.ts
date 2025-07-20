export interface Vulnerability {
  title: string;
  severity: string;
  file_path: string;
  line_number?: number;
  description?: string;
  cvss_score?: number;
  cve_url?: string;
}

export interface ComplexityReport {
  cyclomatic_complexity: number;
  maintainability_index: number;
}

export interface AnalysisData {
  hotspots: Record<string, number>;
  complexity_reports: Record<string, ComplexityReport>;
  vulnerabilities: Vulnerability[];
  code_coverage_percentage?: number;
  top_refactoring_candidate: {
    file: string;
    score: number;
  };
  file_contents: Record<string, string>;
}
