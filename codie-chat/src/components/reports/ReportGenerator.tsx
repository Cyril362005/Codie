import React, { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiCalendar, FiFilter, FiEye, FiPrinter } from 'react-icons/fi';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  icon: string;
}

interface ReportData {
  id: string;
  title: string;
  projectName: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  template: string;
  sections: {
    executiveSummary: boolean;
    securityAnalysis: boolean;
    codeQuality: boolean;
    performanceMetrics: boolean;
    recommendations: boolean;
    technicalDetails: boolean;
  };
}

const ReportGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [reportSections, setReportSections] = useState({
    executiveSummary: true,
    securityAnalysis: true,
    codeQuality: true,
    performanceMetrics: true,
    recommendations: true,
    technicalDetails: false,
  });
  const [reports, setReports] = useState<ReportData[]>([]);
  const [generating, setGenerating] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for stakeholders and management',
      sections: ['Executive Summary', 'Key Findings', 'Recommendations'],
      icon: '📊',
    },
    {
      id: 'technical',
      name: 'Technical Deep Dive',
      description: 'Comprehensive technical analysis for developers',
      sections: ['Security Analysis', 'Code Quality', 'Performance Metrics', 'Technical Details'],
      icon: '🔧',
    },
    {
      id: 'security',
      name: 'Security Assessment',
      description: 'Focused security analysis and vulnerability report',
      sections: ['Security Analysis', 'Vulnerability Details', 'Risk Assessment', 'Remediation Plan'],
      icon: '🛡️',
    },
    {
      id: 'compliance',
      name: 'Compliance Report',
      description: 'Regulatory compliance and audit documentation',
      sections: ['Executive Summary', 'Compliance Status', 'Gap Analysis', 'Action Items'],
      icon: '📋',
    },
  ];

  const mockProjects = [
    { id: '1', name: 'E-commerce Platform' },
    { id: '2', name: 'API Gateway' },
    { id: '3', name: 'Mobile App Backend' },
  ];

  // Mock reports data
  useEffect(() => {
    const mockReports: ReportData[] = [
      {
        id: '1',
        title: 'E-commerce Platform - Security Assessment',
        projectName: 'E-commerce Platform',
        generatedAt: '2024-01-20T10:30:00Z',
        status: 'completed',
        template: 'security',
        sections: {
          executiveSummary: true,
          securityAnalysis: true,
          codeQuality: false,
          performanceMetrics: false,
          recommendations: true,
          technicalDetails: true,
        },
      },
      {
        id: '2',
        title: 'API Gateway - Technical Deep Dive',
        projectName: 'API Gateway',
        generatedAt: '2024-01-19T14:15:00Z',
        status: 'completed',
        template: 'technical',
        sections: {
          executiveSummary: true,
          securityAnalysis: true,
          codeQuality: true,
          performanceMetrics: true,
          recommendations: true,
          technicalDetails: true,
        },
      },
    ];
    setReports(mockReports);
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !selectedProject) {
      alert('Please select a template and project');
      return;
    }

    setGenerating(true);
    
    // Mock report generation
    setTimeout(() => {
      const newReport: ReportData = {
        id: Date.now().toString(),
        title: `${mockProjects.find(p => p.id === selectedProject)?.name} - ${reportTemplates.find(t => t.id === selectedTemplate)?.name}`,
        projectName: mockProjects.find(p => p.id === selectedProject)?.name || '',
        generatedAt: new Date().toISOString(),
        status: 'completed',
        template: selectedTemplate,
        sections: reportSections,
      };
      
      setReports([newReport, ...reports]);
      setGenerating(false);
      setSelectedTemplate('');
      setSelectedProject('');
    }, 3000);
  };

  const handleDownloadReport = (reportId: string) => {
    // Mock download functionality
    console.log(`Downloading report ${reportId}`);
    // In a real implementation, this would trigger a PDF download
  };

  const handleViewReport = (reportId: string) => {
    // Mock view functionality
    console.log(`Viewing report ${reportId}`);
    // In a real implementation, this would open a report viewer
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'generating':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">Create comprehensive analysis reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate New Report</h2>
            
            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Report Template
              </label>
              <div className="space-y-3">
                {reportTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.sections.map((section) => (
                            <span
                              key={section}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a project...</option>
                {mockProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Sections */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Report Sections
              </label>
              <div className="space-y-2">
                {Object.entries(reportSections).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setReportSections({ ...reportSections, [key]: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={generating || !selectedTemplate || !selectedProject}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <FiFileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Reports</h2>
            
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate your first report to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{report.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Project: {report.projectName}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <FiFilter className="w-4 h-4 mr-1" />
                            {reportTemplates.find(t => t.id === report.template)?.name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewReport(report.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="View Report"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadReport(report.id)}
                            className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Download Report"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            title="Print Report"
                          >
                            <FiPrinter className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator; 