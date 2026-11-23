import React from 'react';

interface FormattedQuestionTextProps {
  text: string;
  className?: string;
}

/**
 * Renders inline **bold** markdown segments inside plain text paragraphs
 */
function renderInlineBold(segment: string, keyPrefix: string): React.ReactNode {
  if (!segment.includes('**')) {
    return segment;
  }
  const tokens = segment.split(/(\*\*[^*]+\*\*)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
      return (
        <strong
          key={`${keyPrefix}-b-${i}`}
          className="font-bold text-[#152230] dark:text-[#fff7cc]"
        >
          {tok.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{tok}</React.Fragment>;
  });
}

export const FormattedQuestionText: React.FC<FormattedQuestionTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  // Check if text contains code fences ```...```
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]*)\r?\n?([\s\S]*?)```/g;

  if (!text.includes('```')) {
    return (
      <span className={`whitespace-pre-line leading-relaxed ${className}`}>
        {renderInlineBold(text, 'plain')}
      </span>
    );
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index).trim();
    if (textBefore) {
      parts.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-line leading-relaxed">
          {renderInlineBold(textBefore, `before-${lastIndex}`)}
        </div>
      );
    }

    const codeSnippet = match[1].trim();
    parts.push(
      <pre
        key={`code-${match.index}`}
        className="my-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-emerald-300 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-inner select-all"
      >
        <code>{codeSnippet}</code>
      </pre>
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  const textAfter = text.slice(lastIndex).trim();
  if (textAfter) {
    parts.push(
      <div key={`text-${lastIndex}`} className="whitespace-pre-line leading-relaxed">
        {renderInlineBold(textAfter, `after-${lastIndex}`)}
      </div>
    );
  }

  return <div className={`space-y-1.5 ${className}`}>{parts}</div>;
};
