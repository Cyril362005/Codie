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
  };
  file_contents: Record<string, string>;
}

interface CodeExplorerViewProps {
  analysisData: AnalysisData;
}

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
    </div>
  );
};

export default CodeExplorerView;
