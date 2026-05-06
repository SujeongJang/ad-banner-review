/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useMemo, useState } from 'react';
import { Gavel, CheckCircle2, XCircle, Slash, Lock } from 'lucide-react';
import { ReviewStatus } from '../types';
import { cn } from '../lib/utils';

export type DecisionKind =
  | ReviewStatus.APPROVED
  | ReviewStatus.REJECTED
  | ReviewStatus.CANCELLED;

const decisionMeta: Record<DecisionKind, { label: string; Icon: typeof CheckCircle2; cls: string; needsMemo: boolean; memoGuide: string }> = {
  [ReviewStatus.APPROVED]: {
    label: '승인',
    Icon: CheckCircle2,
    cls: 'bg-[#212d3d] hover:bg-[#2f3d52] text-white',
    needsMemo: false,
    memoGuide: '메모는 선택입니다. 승인 사유나 조건이 있으면 기록해주세요.',
  },
  [ReviewStatus.REJECTED]: {
    label: '반려',
    Icon: XCircle,
    cls: 'bg-red-600 hover:bg-red-700 text-white',
    needsMemo: true,
    memoGuide: '반려 사유 카테고리·인용한 정책 버전·근거를 기록해주세요. 신청자에게 그대로 노출됩니다.',
  },
  [ReviewStatus.CANCELLED]: {
    label: '취소',
    Icon: Slash,
    cls: 'bg-slate-200 hover:bg-slate-300 text-slate-700',
    needsMemo: true,
    memoGuide: '취소 사유를 기록해주세요. (캠페인 철회·중복 등)',
  },
};

const ORDER: DecisionKind[] = [
  ReviewStatus.APPROVED,
  ReviewStatus.REJECTED,
  ReviewStatus.CANCELLED,
];

interface BaseProps {
  disabledReason?: string;
  defaultDecision?: DecisionKind;
  defaultMemo?: string;
}

interface ButtonsProps extends BaseProps {
  variant: 'buttons';
  onDecide: (decision: DecisionKind, memo: string) => void;
  sticky?: boolean;
}

interface RadioProps extends BaseProps {
  variant: 'radio';
  onChange?: (decision: DecisionKind | null, memo: string) => void;
}

export function DecisionPanel(props: ButtonsProps | RadioProps) {
  if (props.variant === 'radio') return <DecisionRadio {...props} />;
  return <DecisionButtons {...props} />;
}

function DecisionButtons({ disabledReason, defaultDecision, defaultMemo, onDecide, sticky }: ButtonsProps) {
  const [pending, setPending] = useState<DecisionKind | null>(defaultDecision ?? null);
  const [memo, setMemo] = useState(defaultMemo ?? '');

  const meta = pending ? decisionMeta[pending] : null;
  const memoMissing = !!meta?.needsMemo && memo.trim().length === 0;
  const blocked = !!disabledReason;

  return (
    <section
      aria-label="검토자 결정"
      className={cn(
        'bg-white border-2 border-[#212d3d]/20 rounded-xl shadow-sm',
        sticky && 'sticky bottom-4'
      )}
    >
      <header className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <Gavel className="w-4 h-4 text-[#212d3d]" aria-hidden="true" />
        <h3 className="text-sm font-bold text-[#212d3d]">검토자 결정</h3>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-[#212d3d]/10 text-[#212d3d] px-1.5 py-0.5 rounded">
          승인자
        </span>
        <div className="ml-auto text-[11px] text-slate-500">결정은 즉시 감사 로그로 저장됩니다.</div>
      </header>

      {blocked && (
        <div className="m-5 p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{disabledReason}</span>
        </div>
      )}

      <div className={cn('p-5 space-y-4', blocked && 'opacity-50 pointer-events-none')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ORDER.map((d) => {
            const m = decisionMeta[d];
            const active = pending === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setPending(d)}
                aria-pressed={active}
                className={cn(
                  'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-sm border-2 transition-all',
                  active
                    ? cn(m.cls, 'border-transparent shadow-sm')
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                )}
              >
                <m.Icon className="w-4 h-4" aria-hidden="true" />
                {m.label}
              </button>
            );
          })}
        </div>

        {meta && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {meta.needsMemo ? '판단 메모 *' : '판단 메모 (선택)'}
            </label>
            <p className="text-[11px] text-slate-500 italic">{meta.memoGuide}</p>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#212d3d]"
              placeholder={meta.needsMemo ? '필수 입력' : '선택 입력'}
            />
            <button
              type="button"
              disabled={memoMissing}
              onClick={() => pending && onDecide(pending, memo)}
              className={cn(
                'w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors',
                memoMissing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#212d3d] text-white hover:bg-[#2f3d52]'
              )}
            >
              결정 저장 후 감사 화면으로 이동
            </button>
          </div>
        )}

        {!meta && (
          <p className="text-xs text-slate-500">결정 유형을 선택하면 메모와 저장 버튼이 활성화됩니다.</p>
        )}
      </div>
    </section>
  );
}

function DecisionRadio({ disabledReason, defaultDecision, defaultMemo, onChange }: RadioProps) {
  const [pending, setPending] = useState<DecisionKind | null>(defaultDecision ?? null);
  const [memo, setMemo] = useState(defaultMemo ?? '');

  const meta = pending ? decisionMeta[pending] : null;
  const blocked = !!disabledReason;

  // notify parent
  useEffect(() => {
    onChange?.(pending, memo);
  }, [pending, memo, onChange]);

  const memoMissing = useMemo(() => !!meta?.needsMemo && memo.trim().length === 0, [meta, memo]);

  return (
    <section
      aria-label="최종 판단"
      className="bg-white border-2 border-[#212d3d]/20 rounded-xl shadow-sm"
    >
      <header className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <Gavel className="w-4 h-4 text-[#212d3d]" aria-hidden="true" />
        <h3 className="text-sm font-bold text-[#212d3d]">최종 판단</h3>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-[#212d3d]/10 text-[#212d3d] px-1.5 py-0.5 rounded">
          승인자
        </span>
      </header>

      {blocked && (
        <div className="m-5 p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{disabledReason}</span>
        </div>
      )}

      <div className={cn('p-5 space-y-4', blocked && 'opacity-50 pointer-events-none')}>
        <div role="radiogroup" aria-label="최종 판단 종류" className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ORDER.map((d) => {
            const m = decisionMeta[d];
            const active = pending === d;
            return (
              <label
                key={d}
                className={cn(
                  'cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-bold text-sm border-2 transition-all',
                  active
                    ? cn(m.cls, 'border-transparent shadow-sm')
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                )}
              >
                <input
                  type="radio"
                  name="final-decision"
                  value={d}
                  checked={active}
                  onChange={() => setPending(d)}
                  className="sr-only"
                />
                <m.Icon className="w-4 h-4" aria-hidden="true" />
                {m.label}
              </label>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            판단 메모 {meta?.needsMemo ? '*' : '(선택)'}
          </label>
          <p className="text-[11px] text-slate-500 italic">
            {meta ? meta.memoGuide : '결정을 선택하면 안내가 변경됩니다.'}
          </p>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#212d3d]"
            placeholder={meta?.needsMemo ? '필수 입력' : '선택 입력'}
          />
          {memoMissing && (
            <div className="text-[11px] text-red-600 font-semibold">
              해당 결정은 메모 입력이 필수입니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const decisionRequiresMemo = (d: DecisionKind) => decisionMeta[d].needsMemo;
