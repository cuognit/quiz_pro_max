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

/**
 * Splits a bilingual question "English question? (Bản dịch tiếng Việt?)" into
 * a crisp primary English block and a clean secondary Vietnamese subtitle block.
 */
function findTrailingTranslationSplit(text: string): { main: string; vi: string } | null {
  const trimmed = text.trim();
  if (!trimmed.endsWith(')') || trimmed.includes('\n')) return null;

  let depth = 0;
  let openIdx = -1;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    const ch = trimmed[i];
    if (ch === ')') depth++;
    else if (ch === '(') {
      depth--;
      if (depth === 0) {
        openIdx = i;
        break;
      }
    }
  }

  if (openIdx <= 5) return null;
  const main = trimmed.slice(0, openIdx).trim();
  const vi = trimmed.slice(openIdx).trim();
  // Only split if the trailing parenthetical looks like a full Vietnamese sentence translation (> 15 chars)
  if (vi.length < 16) return null;
  return { main, vi };
}

export const FormattedQuestionText: React.FC<FormattedQuestionTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  // Check if text contains code fences ```...```
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]*)\r?\n?([\s\S]*?)```/g;

  if (!text.includes('```')) {
    const bilingual = findTrailingTranslationSplit(text);
    if (bilingual) {
      return (
        <div className={`space-y-1.5 leading-relaxed ${className}`}>
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {renderInlineBold(bilingual.main, 'main')}
          </div>
          <div className="text-sm sm:text-[15px] font-normal text-slate-600 dark:text-slate-400">
            {renderInlineBold(bilingual.vi, 'vi')}
          </div>
        </div>
      );
    }

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
