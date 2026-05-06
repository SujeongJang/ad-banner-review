import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, X, ChevronRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { dummyPolicies, dummyProposals } from '../data/policies';
import { Policy, PolicyProposal } from '../types';

const statusTone: Record<Policy['status'], string> = {
  '인용 가능': 'bg-[#ffeb00]/40 text-[#191919]',
  '인용 중지': 'bg-orange-50 text-orange-700',
  폐기: 'bg-slate-200 text-slate-500',
};

export function PolicyManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const isGuide = location.pathname.endsWith('/guides');
  const tabKey = isGuide ? '내부 가이드' : '정책·법령';

  const [search, setSearch] = useState('');
  const [proposeOpen, setProposeOpen] = useState(false);
  const [pendingProposal, setPendingProposal] = useState<PolicyProposal | null>(null);
  const [detailPolicy, setDetailPolicy] = useState<Policy | null>(null);

  const list = useMemo(
    () =>
      dummyPolicies
        .filter((p) => p.category === tabKey)
        .filter((p) => {
          if (!search) return true;
          const q = search.toLowerCase();
          return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        }),
    [tabKey, search],
  );

  const proposals = dummyProposals.filter((p) => p.category === tabKey && p.status === '승인 대기');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#191919]">정책 데이터</h1>
          <p className="text-[#767676] mt-1 text-sm">
            검토 화면에서 인용되는 정책·법령과 내부 가이드를 관리합니다. 변경은 본인 외 1인 승인 후 반영됩니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPendingProposal(proposals[0] ?? null)}
            className="btn-secondary inline-flex items-center gap-1.5"
          >
            승인 대기
            {proposals.length > 0 && (
              <span className="ml-1 text-[11px] bg-[#ffeb00] text-[#191919] font-bold px-1.5 rounded">
                {proposals.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setProposeOpen(true)}
            className="btn-yellow inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            변경 제안
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-white border border-slate-200 rounded-lg p-1 gap-1">
        <button
          type="button"
          onClick={() => navigate('/policies/laws')}
          className={cn(
            'text-sm font-semibold px-4 py-1.5 rounded-md transition-colors',
            !isGuide ? 'bg-[#212d3d] text-white' : 'text-slate-500 hover:bg-slate-50',
          )}
        >
          정책·법령
        </button>
        <button
          type="button"
          onClick={() => navigate('/policies/guides')}
          className={cn(
            'text-sm font-semibold px-4 py-1.5 rounded-md transition-colors',
            isGuide ? 'bg-[#212d3d] text-white' : 'text-slate-500 hover:bg-slate-50',
          )}
        >
          내부 가이드
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 className="font-bold text-[#191919]">{tabKey}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${isGuide ? '가이드명' : '정책명'}·문서 ID 검색`}
              className="bg-[#f2f4f7] border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffeb00]"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-[#767676] uppercase tracking-widest border-b">
            <tr>
              <th className="px-6 py-3">문서 ID</th>
              <th className="px-6 py-3">{isGuide ? '가이드명' : '정책명'}</th>
              <th className="px-6 py-3">버전</th>
              <th className="px-6 py-3">{isGuide ? '소유 부서' : '적용 기간'}</th>
              <th className="px-6 py-3">상태</th>
              <th className="px-6 py-3 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((p) => (
              <tr
                key={p.id}
                onClick={() => setDetailPolicy(p)}
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{p.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-[#191919]">{p.title}</div>
                  <div className="text-[11px] text-slate-400">{p.description}</div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-[#191919]">v{p.version}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {isGuide
                    ? p.ownerDepartment
                    : `${p.effectiveDate.getFullYear()}.${String(p.effectiveDate.getMonth() + 1).padStart(2, '0')}~${
                        p.expiryDate
                          ? `${p.expiryDate.getFullYear()}.${String(p.expiryDate.getMonth() + 1).padStart(2, '0')}`
                          : ''
                      }`}
                </td>
                <td className="px-6 py-4">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusTone[p.status])}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#191919]" />
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                  조건에 맞는 항목이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {proposeOpen && (
        <ProposeModal
          category={tabKey}
          onClose={() => setProposeOpen(false)}
          onSubmit={() => {
            toast.success('변경 제안을 등록했습니다. 승인 대기로 전환됩니다.');
            setProposeOpen(false);
          }}
        />
      )}

      {pendingProposal && (
        <ApprovalModal
          proposal={pendingProposal}
          onClose={() => setPendingProposal(null)}
          onApprove={() => {
            toast.success('승인 후 정책에 반영됩니다.');
            setPendingProposal(null);
          }}
          onReject={() => {
            toast('반려되었습니다. 제안자에게 알림을 보냅니다.', { icon: '↩️' });
            setPendingProposal(null);
          }}
        />
      )}

      {detailPolicy && (
        <PolicyDetailDrawer
          policy={detailPolicy}
          onClose={() => setDetailPolicy(null)}
          onPropose={() => {
            setDetailPolicy(null);
            setProposeOpen(true);
          }}
        />
      )}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        className={cn(
          'bg-white rounded-2xl shadow-2xl w-full p-6 max-h-[90vh] overflow-y-auto',
          wide ? 'max-w-2xl' : 'max-w-lg',
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#191919]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1 hover:bg-slate-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
        {footer && <div className="flex justify-end gap-2 mt-6">{footer}</div>}
      </div>
    </div>
  );
}

function ProposeModal({
  category,
  onClose,
  onSubmit,
}: {
  category: Policy['category'];
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [mode, setMode] = useState<'new' | 'modify'>('modify');
  const [docId, setDocId] = useState('');
  const [version, setVersion] = useState('');
  const [valueBefore, setValueBefore] = useState('');
  const [valueAfter, setValueAfter] = useState('');
  const [reason, setReason] = useState('');
  const valid = docId && version && valueAfter && reason.trim().length >= 10;

  return (
    <ModalShell
      title="정책 변경 제안"
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">
            취소
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={onSubmit}
            className={cn(
              'px-4 py-2 rounded-lg font-bold text-sm',
              valid ? 'btn-yellow' : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            )}
          >
            제안 등록
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="카테고리">
          <input value={category} readOnly className="input bg-[#f2f4f7] cursor-not-allowed" />
        </Field>
        <Field label="대상 문서">
          <div className="flex gap-3 text-sm pt-2">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                checked={mode === 'new'}
                onChange={() => setMode('new')}
              />
              신규 등록
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                checked={mode === 'modify'}
                onChange={() => setMode('modify')}
              />
              기존 변경
            </label>
          </div>
        </Field>
        <Field label="문서 ID *">
          <input
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="LAW-001"
            className="input"
          />
        </Field>
        <Field label="신규 버전 *">
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="v2026-05"
            className="input"
          />
        </Field>
      </div>

      <Field label="변경 전 값" className="mt-4">
        <textarea
          rows={3}
          value={valueBefore}
          onChange={(e) => setValueBefore(e.target.value)}
          disabled={mode === 'new'}
          placeholder={mode === 'new' ? '신규 등록 시 비활성' : '기존 본문을 prefill 합니다.'}
          className="input"
        />
      </Field>
      <Field label="변경 후 값 *" className="mt-4">
        <textarea
          rows={3}
          value={valueAfter}
          onChange={(e) => setValueAfter(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="변경 사유 * (10자 이상)" className="mt-4">
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="input"
        />
      </Field>

      <div className="mt-4 p-3 rounded-lg bg-[#f2f4f7] text-xs text-[#767676]">
        영향평가 미리보기 — 진행 중 검토 건 3건이 본 정책을 인용 중입니다.
      </div>
    </ModalShell>
  );
}

function ApprovalModal({
  proposal,
  onClose,
  onApprove,
  onReject,
}: {
  proposal: PolicyProposal;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [memo, setMemo] = useState('');
  return (
    <ModalShell
      title={`정책 변경 승인 검토 · ${proposal.documentId}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" onClick={onReject} className="btn-secondary">
            반려
          </button>
          <button type="button" onClick={onApprove} className="btn-yellow">
            승인 후 정책 반영
          </button>
        </>
      }
    >
      <div className="text-xs text-[#767676] mb-4">
        제안자: <b>{proposal.proposedBy}</b> · 제안 시각{' '}
        {proposal.proposedAt.toLocaleString('ko-KR')}
      </div>

      <Section title="문서">
        <div className="text-sm">
          <b>{proposal.documentName}</b> · 신규 버전 <b>{proposal.newVersion}</b> · 적용 시작
          {' '}
          {proposal.effectiveFrom.toISOString().slice(0, 10)}
        </div>
      </Section>

      {proposal.valueBefore && (
        <Section title="변경 전 값">
          <pre className="text-sm whitespace-pre-wrap text-slate-700 bg-[#f2f4f7] rounded-md p-3">
            {proposal.valueBefore}
          </pre>
        </Section>
      )}
      <Section title="변경 후 값">
        <pre className="text-sm whitespace-pre-wrap text-slate-700 bg-[#f2f4f7] rounded-md p-3">
          {proposal.valueAfter}
        </pre>
      </Section>
      <Section title="변경 사유">
        <p className="text-sm">{proposal.changeReason}</p>
      </Section>
      <Section title="영향평가">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          진행 중 검토 건 {proposal.affectedReviewIds.length}건이 본 정책을 인용 중입니다 —
          <span className="font-mono ml-1">{proposal.affectedReviewIds.join(', ')}</span>
        </div>
      </Section>

      <Field label="승인/반려 메모 (반려 시 필수)">
        <textarea
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="input"
        />
      </Field>
    </ModalShell>
  );
}

function PolicyDetailDrawer({
  policy,
  onClose,
  onPropose,
}: {
  policy: Policy;
  onClose: () => void;
  onPropose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex justify-end">
      <aside className="bg-white w-full max-w-xl h-full overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-mono text-slate-400">{policy.id}</div>
            <h3 className="text-xl font-bold text-[#191919] mt-0.5">{policy.title}</h3>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {policy.category}
              </span>
              <span className="text-[#767676]">소유 부서: {policy.ownerDepartment}</span>
              <span className={cn('px-2 py-0.5 rounded-full', statusTone[policy.status])}>
                {policy.status}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded" aria-label="닫기">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Section title="본문 / 조항">
          <p className="text-sm text-slate-700">{policy.description}</p>
        </Section>
        <Section title="버전 이력">
          <ul className="text-sm space-y-1">
            <li>
              v{policy.version} · {policy.effectiveDate.toISOString().slice(0, 10)}~ (현재) — 변경 사유: {policy.changeReason}
            </li>
            {policy.expiryDate && (
              <li className="text-[#767676]">
                v{policy.version} 종료: {policy.expiryDate.toISOString().slice(0, 10)} (폐기)
              </li>
            )}
          </ul>
        </Section>
        <Section title="인용 사례 (최근)">
          <p className="text-sm text-[#767676]">
            citation.policy_version_id 기준 최근 인용 검토 건이 표시됩니다. (데모: REQ-2026-0042 외 2건)
          </p>
        </Section>

        <div className="flex gap-2 mt-6 sticky bottom-0 bg-white pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary">
            닫기
          </button>
          <button type="button" onClick={onPropose} className="btn-yellow">
            변경 제안
          </button>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-bold text-[#767676] uppercase tracking-wider">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-bold text-[#767676] uppercase tracking-wider mb-1.5">
        {title}
      </div>
      {children}
    </div>
  );
}
