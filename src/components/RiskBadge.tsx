/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AlertTriangle, AlertOctagon, Info, Shield } from 'lucide-react';
import { RiskLevel } from '../types';
import { cn } from '../lib/utils';

const variants: Record<RiskLevel, { label: string; cls: string; Icon: typeof Info }> = {
  [RiskLevel.CRITICAL]: {
    label: 'Critical',
    cls: 'bg-red-100 text-red-700 border-red-300',
    Icon: AlertOctagon,
  },
  [RiskLevel.HIGH]: {
    label: 'High',
    cls: 'bg-orange-100 text-orange-700 border-orange-300',
    Icon: AlertTriangle,
  },
  [RiskLevel.MEDIUM]: {
    label: 'Medium',
    cls: 'bg-[#ffeb00]/30 text-[#191919] border-[#ffeb00]/50',
    Icon: Info,
  },
  [RiskLevel.LOW]: {
    label: 'Low',
    cls: 'bg-[#ffeb00]/20 text-[#212d3d] border-[#212d3d]/20',
    Icon: Shield,
  },
};

export function RiskBadge({ level, score, size = 'md' }: { level: RiskLevel; score?: number; size?: 'sm' | 'md' }) {
  const v = variants[level];
  const sm = size === 'sm';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-bold',
        v.cls,
        sm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
      aria-label={`위험도 ${v.label}${score !== undefined ? ` 점수 ${score}` : ''}`}
    >
      <v.Icon className={sm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>위험도 {v.label}</span>
      {score !== undefined && <span className="opacity-75">· {score}</span>}
    </span>
  );
}
