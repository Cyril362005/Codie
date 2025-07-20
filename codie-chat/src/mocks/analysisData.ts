/**
 * Mock analysis data for development and testing
 * This file separates mock data from the main app component
 */
import { AnalysisData } from '../types'

export const mockAnalysisData: AnalysisData = {
  hotspots: {
    "src/utils/file_processor.py": 15,
    "src/config.py": 8,
  },
  complexity_reports: {
    "src/utils/file_processor.py": {
      cyclomatic_complexity: 15,
      maintainability_index: 45,
      loc: 250,
      cognitive_complexity: 18
    },
    "src/config.py": {
      cyclomatic_complexity: 8,
      maintainability_index: 65,
      loc: 120,
      cognitive_complexity: 10
    }
  },
  vulnerabilities: [
    {
      title: "Remote Code Execution via deserialization",
      severity: "critical",
      file_path: "src/utils/file_processor.py",
      line_number: 78,
      cvss_score: 9.8,
      description: "Unsafe deserialization of user input can lead to arbitrary code execution",
      remediation: "Use safe deserialization methods or validate input before processing",
      confidence: 95
    },
    {
      title: "Hardcoded Secret in API key",
      severity: "high",
      file_path: "src/config.py",
      line_number: 15,
      cvss_score: 7.5,
      description: "API keys should not be hardcoded in source code",
      remediation: "Use environment variables or secure key management systems",
      confidence: 100
    }
  ],
  code_coverage_percentage: 78.5,
  top_refactoring_candidate: {
    file: "src/utils/file_processor.py",
    score: 15,
    reasons: [
      "High cyclomatic complexity",
      "Low maintainability index",
      "Security vulnerabilities present"
    ]
  },
  file_contents: {
    "src/utils/file_processor.py": `import pickle
import os

def process_file(data):
    # This is a dangerous function that can lead to RCE
    if data.startswith('pickle://'):
        # CRITICAL: This allows arbitrary code execution
        return pickle.loads(data[8:])
    return data

def safe_process(data):
    # This is the safe version
    return data.strip()

# More complex code here...
def complex_function():
    result = 0
    for i in range(100):
        if i % 2 == 0:
            result += i
        else:
            result -= i
    return result`,
    "src/config.py": `# Configuration file
# SECURITY ISSUE: Example of what NOT to do
API_KEY = "sk-EXAMPLE-DO-NOT-USE"  # Never hardcode secrets

DATABASE_URL = "postgresql://user:pass@localhost/db"

def get_config():
    return {
        "api_key": API_KEY,
        "database_url": DATABASE_URL
    }`
  },
  analyzed_at: new Date().toISOString(),
  analysis_id: "mock-analysis-001"
}
