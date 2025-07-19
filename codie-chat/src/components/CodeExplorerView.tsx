<<<<<<< Updated upstream
import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface Vulnerability {
  title: string;
  file_path: string;
  line_number: number;
}

interface AnalysisData {
  vulnerabilities: Vulnerability[];
  top_refactoring_candidate: {
    file: string;
=======
import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';

interface Vulnerability {
  title: string;
  severity: string;
  file_path: string;
  line_number?: number;
  description?: string;
  cvss_score?: number;
  cve_url?: string;
}

interface AnalysisData {
  hotspots: Record<string, number>;
  complexity_reports: Record<string, any>;
  vulnerabilities: Vulnerability[];
  code_coverage_percentage?: number;
  top_refactoring_candidate: {
    file: string;
    score: number;
>>>>>>> Stashed changes
  };
  file_contents: Record<string, string>;
}

interface CodeExplorerViewProps {
  analysisData: AnalysisData;
}

<<<<<<< Updated upstream
import { editor } from 'monaco-editor';

const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({ analysisData }) => {
  const [selectedFile, setSelectedFile] = useState(analysisData.top_refactoring_candidate.file);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    const model = editor.getModel();
    if (model) {
      const decorations: editor.IModelDeltaDecoration[] = [];
      analysisData.vulnerabilities.forEach((vuln) => {
        if (vuln.file_path === selectedFile) {
          decorations.push({
            range: new monaco.Range(vuln.line_number, 1, vuln.line_number, 1),
            options: {
              isWholeLine: true,
              glyphMarginClassName: 'vulnerability-glyph',
              glyphMarginHoverMessage: { value: vuln.title },
            },
          });
        }
      });
      editor.deltaDecorations([], decorations);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      // Handle file changes here
    }
  }, [selectedFile]);

  return (
    <div className="h-full flex">
      <div className="w-1/4 glass-1 p-lg overflow-y-auto">
        <h3 className="h3 text-white mb-md">Files</h3>
        <ul>
          {Object.keys(analysisData.file_contents).map(file => (
            <li key={file} className={`p-sm rounded-md cursor-pointer ${selectedFile === file ? 'bg-accent/20' : 'hover:bg-white/5'}`} onClick={() => setSelectedFile(file)}>
              {file}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={analysisData.file_contents[selectedFile]}
          onMount={handleEditorDidMount}
          options={{
            glyphMargin: true
          }}
        />
      </div>
      <style>{`
        .vulnerability-glyph {
          color: #ff3b6d;
          font-size: 1.2em;
          margin-left: 5px;
        }
      `}</style>
=======
const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({ analysisData }) => {
  const [selectedFile, setSelectedFile] = useState(analysisData.top_refactoring_candidate.file);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);

  // Get vulnerabilities for the selected file
  const fileVulnerabilities = useMemo(() => {
    return analysisData.vulnerabilities.filter(v => v.file_path === selectedFile);
  }, [analysisData.vulnerabilities, selectedFile]);

  // Get file content
  const fileContent = analysisData.file_contents[selectedFile] || '// File content not available';

  // Create markers for vulnerabilities
  const markers = useMemo(() => {
    return fileVulnerabilities.map((vuln, index) => ({
      id: index,
      startLineNumber: vuln.line_number || 1,
      startColumn: 1,
      endLineNumber: vuln.line_number || 1,
      endColumn: 1,
      message: vuln.title,
      severity: vuln.severity === 'critical' ? 8 : vuln.severity === 'high' ? 4 : 2,
    }));
  }, [fileVulnerabilities]);

  const handleLineClick = (lineNumber: number) => {
    const vuln = fileVulnerabilities.find(v => v.line_number === lineNumber);
    if (vuln) {
      setSelectedVulnerability(vuln);
      console.log(`Clicked on vulnerability at line ${lineNumber}: ${vuln.title}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Code Explorer</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analyzing {selectedFile}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {Object.keys(analysisData.file_contents).map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Code Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={fileContent}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
              glyphMargin: true,
              folding: true,
              lineDecorationsWidth: 20,
              lineNumbersMinChars: 3,
            }}
            onMount={(editor) => {
              // Add markers for vulnerabilities
              editor.deltaDecorations([], markers.map(marker => ({
                range: {
                  startLineNumber: marker.startLineNumber,
                  startColumn: marker.startColumn,
                  endLineNumber: marker.endLineNumber,
                  endColumn: marker.endColumn,
                },
                options: {
                  isWholeLine: true,
                  className: 'vulnerability-line',
                  glyphMarginClassName: 'vulnerability-glyph',
                  glyphMarginHoverMessage: { value: marker.message },
                },
              })));

              // Add click handler for lines
              editor.onMouseDown((e: any) => {
                if (e.target.position) {
                  handleLineClick(e.target.position.lineNumber);
                }
              });
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vulnerabilities ({fileVulnerabilities.length})
            </h3>
            
            {fileVulnerabilities.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                No vulnerabilities found in this file.
              </p>
            ) : (
              <div className="space-y-3">
                {fileVulnerabilities.map((vuln, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedVulnerability === vuln
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedVulnerability(vuln)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getSeverityColor(vuln.severity)}20`,
                          color: getSeverityColor(vuln.severity),
                        }}
                      >
                        {vuln.severity.toUpperCase()}
                      </span>
                      {vuln.line_number && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Line {vuln.line_number}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {vuln.title}
                    </h4>
                    {vuln.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {vuln.description}
                      </p>
                    )}
                    {vuln.cvss_score && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">CVSS:</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {vuln.cvss_score.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* File Stats */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              File Statistics
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Complexity Score:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analysisData.complexity_reports[selectedFile]?.cyclomatic_complexity || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Maintainability:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analysisData.complexity_reports[selectedFile]?.maintainability_index || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Hotspot Score:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analysisData.hotspots[selectedFile] || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
>>>>>>> Stashed changes
    </div>
  );
};

<<<<<<< Updated upstream
export default CodeExplorerView;
=======
export default CodeExplorerView; 
>>>>>>> Stashed changes
