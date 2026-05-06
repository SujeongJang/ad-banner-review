/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Sparkles, AlertTriangle, AlertOctagon, Info, Copy } from 'lucide-react';
import { SelfCheckFinding, RiskLevel } from '../types';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const tone: Record<RiskLevel, { cls: string; Icon: typeof Info; label: string }> = {
  [RiskLevel.CRITICAL]: { cls: 'border-l-red-500 bg-red-50', Icon: AlertOctagon, label: 'Critical' },
  [RiskLevel.HIGH]: { cls: 'border-l-orange-500 bg-orange-50', Icon: AlertTriangle, label: 'High' },
  [RiskLevel.MEDIUM]: { cls: 'border-l-[#ffeb00] bg-[#ffeb00]/10', Icon: Info, label: 'Medium' },
  [RiskLevel.LOW]: { cls: 'border-l-[#212d3d] bg-[#ffeb00]/10', Icon: Info, label: 'Low' },
};

export function SelfCheckCard({
  findings,
  loading,
  onApply,
  onIgnore,
}: {
  findings: SelfCheckFinding[];
  loading?: boolean;
  onApply?: (f: SelfCheckFinding) => void;
  onIgnore?: (f: SelfCheckFinding) => void;
}) {
  return (
    <section
      aria-label="셀프 체크 결과 (AI 자가진단)"
      className="bg-slate-50 border-l-4 border-slate-300 border-y border-r border-slate-200 rounded-r-xl overflow-hidden"
    >
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <h3 className="text-sm font-bold text-slate-700">셀프 체크</h3>
          <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
            AI 분석
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          {loading ? '분석 중…' : findings.length === 0 ? '검출된 항목 없음' : `${findings.length}건 검출`}
        </span>
      </header>

      <div className="p-4 space-y-3">
        {!loading && findings.length === 0 && (
          <p className="text-sm text-slate-500 leading-relaxed">
            현재 입력 기준 검출된 표현 위반이 없습니다. AI 선검토 요청 후 정책·선례 기반 정밀 판단이 진행됩니다.
          </p>
        )}

        {loading && (
          <div className="text-sm text-slate-500 italic">800ms 디바운스 후 자가진단을 수행합니다…</div>
        )}

        {findings.map((f, idx) => {
          const t = tone[f.severity];
          return (
            <article
              key={idx}
              className={cn('p-3 rounded-r border-l-4 space-y-2', t.cls, f.ignored && 'opacity-60')}
            >
              <header className="flex items-start gap-2">
                <t.Icon className="w-4 h-4 mt-0.5 text-slate-700 shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {f.category} · {t.label}
                  </div>
                  <div className={cn('text-sm font-semibold', f.ignored ? 'line-through text-slate-500' : 'text-slate-900')}>
                    “{f.text}”
                  </div>
                </div>
              </header>

              <div className="text-xs text-slate-700 bg-white/70 p-2 rounded">
                <span className="font-bold">제안: </span>
                {f.suggestion}
              </div>

              {!f.ignored && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(f.suggestion).catch(() => {});
                      toast.success('제안 복사됨');
                    }}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    복사
                  </button>
                  <button
                    type="button"
                    onClick={() => onIgnore?.(f)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
                  >
                    무시
                  </button>
                  <button
                    type="button"
                    onClick={() => onApply?.(f)}
                    className="text-[11px] font-bold text-white bg-[#212d3d] hover:bg-[#2f3d52] px-2.5 py-1 rounded"
                  >
                    제안 적용
                  </button>
                </div>
              )}

              {f.ignored && f.ignoreReason && (
                <div className="text-[11px] text-slate-500 italic">
                  무시 사유: {f.ignoreReason}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function evaluateSelfCheck(adCopy: string): SelfCheckFinding[] {
  if (!adCopy.trim()) return [];
  const rules: { pattern: RegExp; severity: RiskLevel; category: string; suggestion: string }[] = [
    { pattern: /확정\s?수익/g, severity: RiskLevel.HIGH, category: '수익률 단정 표현', suggestion: '“조건 충족 시 혜택”으로 변경 권장' },
    { pattern: /원금\s?(보장|손실\s?없음)/g, severity: RiskLevel.CRITICAL, category: '원금보장 광고', suggestion: '원금보장 표현은 절대 금지 — “예금자 보호 한도 내” 등 정확한 표현 사용' },
    { pattern: /무조건\s?수익|무조건\s?이익/g, severity: RiskLevel.CRITICAL, category: '수익 단정 표현', suggestion: '단정 표현 제거 — “시장 상황에 따라 수익이 달라질 수 있습니다” 명시' },
    { pattern: /최저가\s?(보장|약속)/g, severity: RiskLevel.HIGH, category: '최상급 표현', suggestion: '“최저가 도전” 등 단정 약화 표현 권장' },
    { pattern: /가장\s?낮은|가장\s?높은|가장\s?(저렴|좋은)/g, severity: RiskLevel.MEDIUM, category: '최상급 표현', suggestion: '“다양한 …을 비교해보세요” 등 비교 표현으로 완화' },
    { pattern: /\d+\s?(억|만\s?원)\s?보장/g, severity: RiskLevel.CRITICAL, category: '수익 단정 표현', suggestion: '구체 금액 보장 표현 제거 — 가능 범위로 완화' },
    { pattern: /지금\s?(가입|시작)/g, severity: RiskLevel.LOW, category: '행동 유도 표현', suggestion: '필수 고지 누락 여부 확인' },
  ];

  const findings: SelfCheckFinding[] = [];
  const seen = new Set<string>();
  for (const r of rules) {
    const matches = adCopy.match(r.pattern);
    if (matches) {
      for (const m of matches) {
        const key = `${r.category}::${m}`;
        if (seen.has(key)) continue;
        seen.add(key);
        findings.push({ text: m, severity: r.severity, category: r.category, suggestion: r.suggestion });
      }
    }
  }
  return findings;
}
