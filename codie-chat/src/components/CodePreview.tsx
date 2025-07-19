import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodePreviewProps {
  code: string;
  language: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, language }) => {
  return (
    <Highlight theme={themes.vsDark} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} glass-1 p-lg overflow-auto`} style={style}>
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
  );
};

export default CodePreview;
