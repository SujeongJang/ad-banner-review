/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, FileText, Bookmark, AlertTriangle } from 'lucide-react';
import { Citation } from '../types';
import { cn } from '../lib/utils';

const typeMeta: Record<Citation['type'], { Icon: typeof BookOpen; tone: string; chip: string }> = {
  '정책': { Icon: BookOpen, tone: 'border-slate-300', chip: 'bg-slate-200 text-slate-700' },
  '내부가이드': { Icon: FileText, tone: 'border-slate-300', chip: 'bg-slate-200 text-slate-700' },
  '선례': { Icon: Bookmark, tone: 'border-slate-300', chip: 'bg-slate-200 text-slate-700' },
};

export function CitationCard({
  citation,
  expanded: controlledExpanded,
  defaultExpanded,
  onToggle,
}: {
  citation: Citation;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (next: boolean) => void;
}) {
  const [internal, setInternal] = useState(!!defaultExpanded);
  const expanded = controlledExpanded ?? internal;

  useEffect(() => {
    if (controlledExpanded !== undefined) setInternal(controlledExpanded);
  }, [controlledExpanded]);

  const meta = typeMeta[citation.type];
  const handleToggle = () => {
    const next = !expanded;
    setInternal(next);
    onToggle?.(next);
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-lg overflow-hidden transition-shadow',
        meta.tone,
        expanded && 'shadow-md'
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={expanded}
      >
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide', meta.chip)}>
          <meta.Icon className="w-3 h-3" aria-hidden="true" />
          [{citation.type}]
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">{citation.title}</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {citation.documentId}
            {citation.version && citation.version !== '-' && <span> · v{citation.version}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <ConfidencePill value={citation.confidence} />
          <ChevronDown
            className={cn('w-4 h-4 text-slate-400 transition-transform', expanded && 'rotate-180')}
            aria-hidden="true"
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-3 space-y-3 text-xs bg-slate-50/50">
          {citation.deprecated && (
            <div className="flex items-start gap-2 p-2 rounded bg-orange-50 border border-orange-200 text-orange-800">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
              <span className="font-semibold">이 정책은 폐기되었습니다 — 영향평가 대상입니다.</span>
            </div>
          )}

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">근거 사유</div>
            <div className="text-slate-700 leading-relaxed">{citation.reason}</div>
          </div>

          {citation.excerpt && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">발췌</div>
              <blockquote className="text-slate-600 italic border-l-2 border-slate-300 pl-3 leading-relaxed">
                {citation.excerpt}
              </blockquote>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            {citation.effectiveDate && (
              <div>
                <span className="font-bold uppercase tracking-wide text-slate-400">시행일</span>
                <div className="font-mono">{citation.effectiveDate.toISOString().slice(0, 10)}</div>
              </div>
            )}
            <div>
              <span className="font-bold uppercase tracking-wide text-slate-400">신뢰도</span>
              <div className="font-mono">{(citation.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    value >= 0.85
      ? 'bg-[#ffeb00]/20 text-[#212d3d]'
      : value >= 0.7
      ? 'bg-slate-100 text-slate-600'
      : 'bg-orange-50 text-orange-700';
  return (
    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', tone)} aria-label={`신뢰도 ${pct}%`}>
      {pct}%
    </span>
  );
}
