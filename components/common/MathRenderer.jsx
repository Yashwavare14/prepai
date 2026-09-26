'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

// Regex to capture math delimiters:
// 1. $$ ... $$ (display math)
// 2. \[ ... \] (display math)
// 3. $ ... $ (inline math - avoids matching standard single $ with newline)
// 4. \( ... \) (inline math)
const MATH_REGEX = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?:\\\$|[^\$\n])+?\$|\\\([\s\S]*?\\\))/g;

/**
 * Parses a string containing plain text mixed with LaTeX delimiters ($...$, $$...$$, \(...\), \[...\])
 * and renders it cleanly using KaTeX.
 */
export default function MathRenderer({ text, className = '', as = 'span' }) {
  const renderedElements = useMemo(() => {
    if (text === null || text === undefined) return null;
    const str = String(text);
    if (!str.trim()) return null;

    // Check if the entire string is a raw un-delimited LaTeX formula (e.g. "\frac{1}{2}" or "\sqrt{x}")
    MATH_REGEX.lastIndex = 0;
    const hasDelimiters = MATH_REGEX.test(str);
    MATH_REGEX.lastIndex = 0;

    if (!hasDelimiters && /^\s*\\[a-zA-Z]+/.test(str)) {
      try {
        const html = katex.renderToString(str.trim(), {
          displayMode: false,
          throwOnError: false,
        });
        return (
          <span
            className="katex-math inline-block"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <span>{str}</span>;
      }
    }

    if (!hasDelimiters) {
      return renderTextWithLineBreaks(str);
    }

    const elements = [];
    let lastIndex = 0;
    let match;
    let keyIdx = 0;

    while ((match = MATH_REGEX.exec(str)) !== null) {
      // 1. Plain text before this math segment
      if (match.index > lastIndex) {
        const plainText = str.slice(lastIndex, match.index);
        elements.push(
          <React.Fragment key={`text-${keyIdx++}`}>
            {renderTextWithLineBreaks(plainText)}
          </React.Fragment>
        );
      }

      // 2. Extract math content & determine display mode
      const token = match[0];
      let math = '';
      let isDisplay = false;

      if (token.startsWith('$$') && token.endsWith('$$')) {
        math = token.slice(2, -2).trim();
        isDisplay = true;
      } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
        math = token.slice(2, -2).trim();
        isDisplay = true;
      } else if (token.startsWith('$') && token.endsWith('$')) {
        math = token.slice(1, -1).trim();
        isDisplay = false;
      } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
        math = token.slice(2, -2).trim();
        isDisplay = false;
      }

      try {
        const html = katex.renderToString(math, {
          displayMode: isDisplay,
          throwOnError: false,
        });

        if (isDisplay) {
          elements.push(
            <div
              key={`math-block-${keyIdx++}`}
              className="my-2.5 overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } else {
          elements.push(
            <span
              key={`math-inline-${keyIdx++}`}
              className="katex-inline inline-block px-0.5 align-baseline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
      } catch {
        // Fallback to token if KaTeX throws unexpectedly
        elements.push(<span key={`err-${keyIdx++}`}>{token}</span>);
      }

      lastIndex = match.index + token.length;
    }

    // 3. Trailing plain text
    if (lastIndex < str.length) {
      const remaining = str.slice(lastIndex);
      elements.push(
        <React.Fragment key={`text-${keyIdx++}`}>
          {renderTextWithLineBreaks(remaining)}
        </React.Fragment>
      );
    }

    return elements;
  }, [text]);

  const Component = as;

  return (
    <Component className={`math-renderer ${className}`}>
      {renderedElements}
    </Component>
  );
}

/**
 * Helper to preserve line breaks in plain text segments
 */
function renderTextWithLineBreaks(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => (
    <React.Fragment key={idx}>
      {line}
      {idx < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}
