/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo } from 'react';
import { Violation, RiskLevel } from '../types';
import { cn } from '../lib/utils';

const severityCls: Record<RiskLevel, string> = {
  [RiskLevel.CRITICAL]: 'bg-red-100 text-red-800 border-b-2 border-red-500',
  [RiskLevel.HIGH]: 'bg-orange-100 text-orange-800 border-b-2 border-orange-500',
  [RiskLevel.MEDIUM]: 'bg-[#ffeb00]/30 text-[#191919] border-b-2 border-[#ffeb00]',
  [RiskLevel.LOW]: 'bg-[#ffeb00]/20 text-[#212d3d] border-b-2 border-[#212d3d]/30',
};

interface Segment {
  text: string;
  violation?: Violation;
}

export function RiskHighlightedText({
  text,
  violations,
  onFocusCitations,
  activeViolationText,
}: {
  text: string;
  violations: Violation[];
  onFocusCitations?: (documentIds: string[]) => void;
  activeViolationText?: string;
}) {
  const segments = useMemo<Segment[]>(() => {
    if (!text) return [{ text: '' }];
    if (!violations.length) return [{ text }];

    const ranges: { start: number; end: number; v: Violation }[] = [];
    for (const v of violations) {
      if (!v.text) continue;
      let from = 0;
      while (from < text.length) {
        const idx = text.indexOf(v.text, from);
        if (idx === -1) break;
        ranges.push({ start: idx, end: idx + v.text.length, v });
        from = idx + v.text.length;
      }
    }
    ranges.sort((a, b) => a.start - b.start);

    const out: Segment[] = [];
    let cursor = 0;
    for (const r of ranges) {
      if (r.start < cursor) continue;
      if (r.start > cursor) out.push({ text: text.slice(cursor, r.start) });
      out.push({ text: text.slice(r.start, r.end), violation: r.v });
      cursor = r.end;
    }
    if (cursor < text.length) out.push({ text: text.slice(cursor) });
    return out;
  }, [text, violations]);

  if (!text) {
    return <p className="text-slate-400 italic">광고 카피가 입력되지 않았습니다.</p>;
  }

  return (
    <p className="text-base leading-loose text-slate-800 whitespace-pre-wrap">
      {segments.map((seg, idx) =>
        seg.violation ? (
          <mark
            key={idx}
            tabIndex={0}
            role="button"
            aria-label={`위반 표현: ${seg.text}. ${seg.violation.reason}`}
            onMouseEnter={() => onFocusCitations?.(seg.violation!.citationDocumentIds || [])}
            onFocus={() => onFocusCitations?.(seg.violation!.citationDocumentIds || [])}
            className={cn(
              'rounded px-1 cursor-help transition-all',
              severityCls[seg.violation.severity],
              activeViolationText === seg.text && 'ring-2 ring-offset-1 ring-slate-700'
            )}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={idx}>{seg.text}</span>
        )
      )}
    </p>
  );
}
