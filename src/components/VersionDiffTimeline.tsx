/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Fragment } from 'react';
import { Plus, Minus } from 'lucide-react';
import { VersionEntry } from '../types';
import { cn } from '../lib/utils';

export function VersionDiffTimeline({ versions }: { versions: VersionEntry[] }) {
  if (versions.length === 0) {
    return <p className="text-sm text-slate-400 italic">버전 이력이 없습니다.</p>;
  }
  const sorted = [...versions].sort((a, b) => a.version - b.version);
  return (
    <ol className="space-y-3" aria-label="변경 이력 타임라인">
      {sorted.map((v) => (
        <li key={v.version} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          <header className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#212d3d] bg-[#ffeb00]/20 px-2 py-0.5 rounded">
              v{v.version}
            </span>
            <span className="text-xs text-slate-500">{v.authorName}</span>
            <span className="text-[11px] text-slate-400 font-mono ml-auto">
              {v.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
            </span>
          </header>

          <p className="text-sm text-slate-800 leading-relaxed">{v.adCopy || <span className="text-slate-400 italic">(카피 없음)</span>}</p>

          {v.diff && (v.diff.added.length > 0 || v.diff.removed.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {v.diff.added.map((a) => (
                <Fragment key={`a-${a}`}>
                  <DiffLine kind="add" text={a} />
                </Fragment>
              ))}
              {v.diff.removed.map((r) => (
                <Fragment key={`r-${r}`}>
                  <DiffLine kind="remove" text={r} />
                </Fragment>
              ))}
            </div>
          )}

          {v.note && (
            <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
              {v.note}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function DiffLine({ kind, text }: { kind: 'add' | 'remove'; text: string }) {
  const Icon = kind === 'add' ? Plus : Minus;
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs px-2 py-1 rounded',
        kind === 'add' ? 'bg-[#ffeb00]/15 text-[#212d3d]' : 'bg-red-50 text-red-700'
      )}
      aria-label={kind === 'add' ? '추가된 표현' : '삭제된 표현'}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span className={cn(kind === 'remove' && 'line-through')}>{text}</span>
    </div>
  );
}
