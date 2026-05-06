/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AuditEntry } from '../types';
import { cn } from '../lib/utils';

export function AuditLogCard({
  entry,
  placeholder,
}: {
  entry?: AuditEntry;
  placeholder?: boolean;
}) {
  return (
    <section
      aria-label="감사 로그"
      className={cn(
        'bg-white border-2 rounded-xl shadow-sm overflow-hidden',
        placeholder ? 'border-slate-200' : 'border-[#212d3d]/30'
      )}
    >
      <header className="px-5 py-3 flex items-center gap-2 bg-white border-b border-slate-100">
        <ShieldCheck className={cn('w-4 h-4', placeholder ? 'text-slate-400' : 'text-[#212d3d]')} aria-hidden="true" />
        <h3 className={cn('text-sm font-bold', placeholder ? 'text-slate-500' : 'text-[#212d3d]')}>
          감사 로그
        </h3>
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ml-auto',
            placeholder ? 'bg-slate-100 text-slate-500' : 'bg-[#212d3d]/10 text-[#212d3d]'
          )}
        >
          자동 생성
        </span>
      </header>

      {placeholder || !entry ? (
        <div className="p-5 text-sm text-slate-400 italic leading-relaxed">
          결정을 저장하면 승인자, 시간, 정책 버전, 선례, 변경 전후 카피, request_id, review_id가 자동으로 기록됩니다.
        </div>
      ) : (
        <dl className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <Field label="Request ID">
            <code className="font-mono text-slate-700">{entry.requestId}</code>
          </Field>
          <Field label="Review ID">
            <code className="font-mono text-slate-700">{entry.reviewId}</code>
          </Field>
          <Field label="승인자">
            <span className="text-slate-800 font-semibold">
              {entry.approverName} <span className="text-slate-400">({entry.approverDepartment})</span>
            </span>
          </Field>
          <Field label="결정 시각">
            <code className="font-mono text-slate-700">
              {entry.decidedAt.toISOString().slice(0, 19).replace('T', ' ')}
            </code>
          </Field>
          <Field label="결정">
            <span className="font-bold text-slate-900">{entry.decision}</span>
          </Field>
          <Field label="정책 버전">
            <ul className="space-y-0.5">
              {entry.policyVersions.map((p) => (
                <li key={p.documentId} className="font-mono text-slate-700">
                  {p.documentId} <span className="text-slate-400">v{p.version}</span>
                </li>
              ))}
              {entry.policyVersions.length === 0 && <li className="text-slate-400 italic">-</li>}
            </ul>
          </Field>
          <Field label="선례 ID" wide>
            <ul className="space-y-0.5">
              {entry.precedentIds.map((id) => (
                <li key={id} className="font-mono text-slate-700">{id}</li>
              ))}
              {entry.precedentIds.length === 0 && <li className="text-slate-400 italic">-</li>}
            </ul>
          </Field>
          <Field label="변경 전 카피" wide>
            <p className="text-slate-700 leading-relaxed bg-red-50/40 border border-red-100 rounded p-2">
              {entry.copyBefore || <em className="text-slate-400">(빈 값)</em>}
            </p>
          </Field>
          <Field label="변경 후 카피" wide>
            <p className="text-slate-700 leading-relaxed bg-[#ffeb00]/15 border border-[#212d3d]/15 rounded p-2">
              {entry.copyAfter || <em className="text-slate-400">(빈 값)</em>}
            </p>
          </Field>
          <Field label="판단 메모" wide>
            <p className="text-slate-700 leading-relaxed">{entry.memo || <em className="text-slate-400">(없음)</em>}</p>
          </Field>
        </dl>
      )}
    </section>
  );
}

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn('space-y-1', wide && 'md:col-span-2')}>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
