import React from 'react';

interface FormattedQuestionTextProps {
  text: string;
  className?: string;
}

export const FormattedQuestionText: React.FC<FormattedQuestionTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  // Check if text contains code fences ```...```
  const codeBlockRegex = /```(?:[a-zA-Z]*)\r?\n?([\s\S]*?)```/g;

  if (!text.includes('```')) {
    return <span className={`whitespace-pre-line leading-relaxed ${className}`}>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-line leading-relaxed">
          {textBefore}
        </span>
      );
    }

    const codeSnippet = match[1].trim();
    parts.push(
      <pre
        key={`code-${match.index}`}
        className="my-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner select-all"
      >
        <code>{codeSnippet}</code>
      </pre>
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  const textAfter = text.slice(lastIndex);
  if (textAfter) {
    parts.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-line leading-relaxed">
        {textAfter}
      </span>
    );
  }

  return <div className={`space-y-1 ${className}`}>{parts}</div>;
};
