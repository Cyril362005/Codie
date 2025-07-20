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
  complexity_reports: Record<string, { cyclomatic_complexity: number; maintainability_index: number }>;
  vulnerabilities: Vulnerability[];
  code_coverage_percentage?: number;
  top_refactoring_candidate: {
    file: string;
    score: number;
  };
  file_contents: Record<string, string>;
}

interface CodeExplorerViewProps {
  analysisData: AnalysisData;
}

const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({ analysisData }) => {
  const [selectedFile, setSelectedFile] = useState(analysisData.top_refactoring_candidate.file);

  type FileTreeNode = Record<string, FileTreeNode | null> | null;

  const fileTree = useMemo(() => {
    const tree: Record<string, FileTreeNode> = {};
    Object.keys(analysisData.file_contents).forEach(path => {
      let currentLevel = tree;
      const parts = path.split('/');
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = (index === parts.length - 1) ? null : {};
        }
        if (currentLevel[part] !== null) {
          currentLevel = currentLevel[part] as Record<string, FileTreeNode>;
        }
      });
    });
    return tree;
  }, [analysisData.file_contents]);

  const renderFileTree = (tree: Record<string, FileTreeNode>, path = '') => {
    return (
      <ul className="space-y-1">
        {Object.entries(tree).map(([name, children]) => {
          const currentPath = path ? `${path}/${name}` : name;
          if (children === null) {
            return (
              <li key={currentPath}>
                <button
                  onClick={() => setSelectedFile(currentPath)}
                  className={`w-full text-left px-2 py-1 rounded-md text-sm ${
                    selectedFile === currentPath
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {name}
                </button>
              </li>
            );
          }
          return (
            <li key={currentPath}>
              <details open>
                <summary className="cursor-pointer py-1 text-gray-400 font-medium">{name}</summary>
                <div className="pl-4 border-l border-gray-600 ml-2">
                  {renderFileTree(children, currentPath)}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="h-full flex bg-gray-900 text-white">
      <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">File Explorer</h3>
        {renderFileTree(fileTree)}
      </div>
      <div className="w-3/4 flex flex-col">
        <div className="flex-grow">
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={analysisData.file_contents[selectedFile]}
            options={{
              readOnly: true,
              glyphMargin: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        <div className="h-1/3 bg-gray-800 p-4 overflow-y-auto border-t border-gray-700">
          <h3 className="text-lg font-bold mb-4">Vulnerabilities in this file</h3>
          <ul className="space-y-2">
            {analysisData.vulnerabilities
              .filter(v => v.file_path === selectedFile)
              .map((vuln, index) => (
                <li key={index} className="p-3 bg-gray-700 rounded-md">
                  <p className="font-bold text-red-400">{vuln.title}</p>
                  <p className="text-sm text-gray-300">Line: {vuln.line_number}</p>
                  <p className="text-xs text-gray-400 mt-1">{vuln.description}</p>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeExplorerView;
