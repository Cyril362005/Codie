import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodePreviewProps {
  code: string;
  language: string;
  title?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, language, title }) => {
  return (
    <div className="p-6">
      {title && (
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h4>
      )}
      <Highlight theme={themes.vsDark} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} overflow-auto`} style={style}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
    </div>
  );
};

export default CodePreview;
