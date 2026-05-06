/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

const stages = ['제출', 'AI 선검토', '담당자 검토', '완료'] as const;

export function StageIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center w-full gap-2" aria-label="검토 단계">
      {stages.map((s, idx) => {
        const step = idx + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={s} className="flex-1 flex items-center gap-2">
            <div
              className={cn(
                'shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                done
                  ? 'bg-[#212d3d] text-white border-[#212d3d]'
                  : active
                  ? 'bg-white text-[#212d3d] border-[#212d3d]'
                  : 'bg-white text-slate-400 border-slate-200'
              )}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Check className="w-4 h-4" aria-hidden="true" /> : step}
            </div>
            <span
              className={cn(
                'text-xs font-semibold whitespace-nowrap',
                active ? 'text-[#212d3d]' : done ? 'text-slate-700' : 'text-slate-400'
              )}
            >
              {s}
            </span>
            {step < stages.length && (
              <div className={cn('flex-1 h-px', done ? 'bg-[#212d3d]' : 'bg-slate-200')} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
