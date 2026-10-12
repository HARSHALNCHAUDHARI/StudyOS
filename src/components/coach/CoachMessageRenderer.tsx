'use client';

import React from 'react';
import { Sparkles, Lightbulb, Code2, Copy, Check } from 'lucide-react';

interface CoachMessageRendererProps {
  content?: string;
}

export function CoachMessageRenderer({ content = '' }: CoachMessageRendererProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse inline markdown (bold, code, links)
  const renderInline = (text: string) => {
    // Split by code blocks first
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/[0.12] text-cyan-300 font-mono text-[11px] font-medium border border-white/14 shadow-sm"
          >
            {code}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        const bold = part.slice(2, -2);
        return (
          <strong key={i} className="text-white font-bold">
            {bold}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Parse blocks (code blocks, headings, callouts, lists, paragraphs)
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let inQuote = false;
  let quoteBuffer: string[] = [];
  let codeBlockCounter = 0;

  const flushQuote = (key: string) => {
    if (quoteBuffer.length > 0) {
      elements.push(
        <div
          key={key}
          className="my-3.5 p-4 rounded-2xl bg-amber-500/12 border border-amber-400/35 text-amber-100 text-xs shadow-sm flex items-start gap-3 backdrop-blur-md"
        >
          <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 leading-relaxed font-sans flex-1">
            {quoteBuffer.map((qLine, qIdx) => (
              <p key={qIdx}>{renderInline(qLine)}</p>
            ))}
          </div>
        </div>
      );
      quoteBuffer = [];
      inQuote = false;
    }
  };

  const flushCode = (key: string) => {
    if (codeBuffer.length > 0) {
      const fullCode = codeBuffer.join('\n');
      const idx = codeBlockCounter++;
      elements.push(
        <div
          key={key}
          className="my-3.5 rounded-2xl bg-black/75 border border-white/16 overflow-hidden shadow-lg backdrop-blur-xl font-mono text-xs"
        >
          <div className="px-4 py-2 bg-white/[0.06] border-b border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-blue-300 font-semibold uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{codeLanguage || 'CODE'}</span>
            </div>
            <button
              onClick={() => handleCopy(fullCode, idx)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/18 text-slate-200 transition text-[10px] cursor-pointer"
            >
              {copiedIndex === idx ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed font-mono text-[11.5px]">
            <code>{fullCode}</code>
          </pre>
        </div>
      );
      codeBuffer = [];
      inCodeBlock = false;
      codeLanguage = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code fence
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCode(`code-${i}`);
      } else {
        flushQuote(`quote-before-code-${i}`);
        inCodeBlock = true;
        codeLanguage = trimmed.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Check blockquote (> )
    if (trimmed.startsWith('>')) {
      inQuote = true;
      quoteBuffer.push(trimmed.replace(/^>\s*/, ''));
      continue;
    } else if (inQuote) {
      flushQuote(`quote-${i}`);
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<div key={`hr-${i}`} className="my-4 border-t border-white/12" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm md:text-base font-bold text-white mt-4 mb-2 flex items-center gap-2 tracking-tight"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_8px_#60a5fa]" />
          <span>{renderInline(trimmed.replace('### ', ''))}</span>
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-xs md:text-sm font-semibold text-blue-300 mt-3 mb-1.5 font-sans tracking-wide"
        >
          {renderInline(trimmed.replace('#### ', ''))}
        </h4>
      );
      continue;
    }

    // List item (bullet)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 my-1.5 pl-1 text-xs text-slate-200 leading-relaxed font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
          <div className="flex-1">{renderInline(trimmed.replace(/^[-*]\s+/, ''))}</div>
        </div>
      );
      continue;
    }

    // Numbered list item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-2 pl-1 text-xs text-slate-200 leading-relaxed font-sans">
          <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-blue-300 font-mono text-[10px] font-bold shrink-0 mt-0.5 border border-white/10">
            {numberedMatch[1]}
          </span>
          <div className="flex-1">{renderInline(numberedMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Empty line
    if (!trimmed) {
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="my-2 text-xs text-slate-100 leading-relaxed font-sans">
        {renderInline(trimmed)}
      </p>
    );
  }

  // Flush remaining buffers if any
  if (inQuote) flushQuote('quote-final');
  if (inCodeBlock) flushCode('code-final');

  return <div className="space-y-1">{elements}</div>;
}
