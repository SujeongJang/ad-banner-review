/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Pencil, AlertTriangle } from 'lucide-react';
import { ReviewerLabel } from '../types';
import { cn } from '../lib/utils';

const variants: Record<ReviewerLabel, { cls: string; Icon: typeof Pencil }> = {
  '표현·고지 보완': { cls: 'bg-slate-100 text-slate-700 border-slate-200', Icon: Pencil },
  '위반 가능성': { cls: 'bg-orange-50 text-orange-700 border-orange-200', Icon: AlertTriangle },
};

export function ReviewerLabelBadge({ label }: { label: ReviewerLabel }) {
  const v = variants[label];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold', v.cls)}
      aria-label={`검토자 라벨 ${label}`}
    >
      <v.Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
