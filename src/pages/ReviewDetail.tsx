import { Fragment, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  AlertOctagon,
  Image as ImageIcon,
  ScanText,
  Copy,
  X,
  RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dummyReviews } from '../data/reviews';
import { AIResultLabel, ReviewStatus } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { ReviewerLabelBadge } from '../components/ReviewerLabelBadge';
import { CitationCard } from '../components/CitationCard';
import { RiskHighlightedText } from '../components/RiskHighlightedText';
import { DecisionPanel } from '../components/DecisionPanel';
import { StageIndicator } from '../components/StageIndicator';
import { StatusBadge } from './ReviewList';
import { cn } from '../lib/utils';

const CURRENT_USER = { name: '김컴플', department: '준법지원팀' };

export function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const review = useMemo(() => dummyReviews.find((r) => r.id === id), [id]);
  const [focusedDocIds, setFocusedDocIds] = useState<string[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [recheckOpen, setRecheckOpen] = useState(false);

  if (!review) {
    return (
      <div className="space-y-4">
        <Link to="/reviews" className="text-sm text-[#212d3d] hover:underline inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          목록으로
        </Link>
        <div className="card p-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">검토 요청을 찾을 수 없습니다.</h2>
          <p className="text-sm text-slate-500 mt-2">요청 ID: {id}</p>
        </div>
      </div>
    );
  }

  const ai = review.aiResult;
  const isHardBlock = ai?.label === AIResultLabel.AUTO_REJECTED;
  const isLowConfidence = !!ai && ai.confidence < 0.7;
  const isSelfReview = review.applicantName === CURRENT_USER.name;
  const isAlreadyDecided = review.audit.length > 0 && review.status !== ReviewStatus.UNDER_REVIEW;
  const isReviewer = review.assigneeName === CURRENT_USER.name;
  const isApplicant = review.applicantName === CURRENT_USER.name;
  const isMultiTrack = (ai?.requiredTracks?.length ?? 0) > 1;
  const otherDecisions = (review.assignees ?? []).filter(
    (a) => a.assigneeName !== CURRENT_USER.name && a.outcome,
  );

  const disabledReason = isHardBlock
    ? '필수 요건 위반(자본시장법 §57)으로 자동 반려된 건입니다. 신청자 이의제기 절차로만 처리할 수 있습니다.'
    : isSelfReview
    ? '본인이 요청한 건은 결정할 수 없습니다. 다른 담당자에게 재배정해주세요.'
    : isAlreadyDecided && review.status === ReviewStatus.REJECTED
    ? `이미 ${review.status} 결정이 저장된 건입니다.`
    : undefined;

  const handleDecide = (decision: any, memo: string) => {
    toast.success(`${decision} 결정을 저장합니다. 감사 화면으로 이동합니다.`);
    navigate(`/reviews/${review.id}/approval?prefill=${encodeURIComponent(decision)}&memo=${encodeURIComponent(memo)}`);
  };

  const copyToClipboard = (s: string) => {
    navigator.clipboard.writeText(s).catch(() => {});
    toast.success('복사되었습니다.');
  };

  return (
    <div className="space-y-6 pb-32">
      <Link to="/reviews" className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        검토 리스트로
      </Link>

      <StageIndicator current={3} />

      {/* Header */}
      <header className="card p-5 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">{review.id}</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{review.campaignName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {review.applicantName} ({review.department}) · {review.materialType} · {review.channels.join(', ')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={review.status} />
          {ai && <RiskBadge level={ai.riskLevel} score={ai.riskScore} />}
          {review.reviewerLabel && <ReviewerLabelBadge label={review.reviewerLabel} />}
        </div>
      </header>

      {/* Conditional Banners */}
      <div className="space-y-2">
        {isHardBlock && (
          <Banner
            tone="red"
            Icon={AlertOctagon}
            title="필수 요건 위반으로 자동 반려"
            body="자본시장법 §57 등 절대 금지 항목 위반 — 사람 결정 불가. 이의제기는 LAW-014 절차에 따릅니다."
          />
        )}
        {isLowConfidence && !isHardBlock && (
          <Banner
            tone="orange"
            Icon={AlertTriangle}
            title={`AI 신뢰도 부족 (${(ai!.confidence * 100).toFixed(0)}%)`}
            body="신뢰도 0.7 미만 — 사람 판단 필수입니다. 인용 정책·선례를 직접 확인해주세요."
          />
        )}
        {review.policyDeprecatedWarning && (
          <Banner
            tone="orange"
            Icon={AlertTriangle}
            title={`정책 폐기 — ${review.policyDeprecatedWarning.documentId}`}
            body={review.policyDeprecatedWarning.reason}
          />
        )}
        {isSelfReview && !isHardBlock && (
          <Banner
            tone="slate"
            Icon={AlertTriangle}
            title="본인 요청 건 — 결정 차단"
            body="신청자와 검토자가 동일하여 결정이 비활성화되어 있습니다. 다른 담당자에게 재배정해주세요."
          />
        )}
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* AI 영역 (좌) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <AIPanel title="원문 + 위험 표현 하이라이트">
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">광고 카피</div>
              <RiskHighlightedText
                text={review.adCopy}
                violations={ai?.violations ?? []}
                onFocusCitations={setFocusedDocIds}
              />
              {review.imageUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 inline-flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" aria-hidden="true" />
                      이미지
                    </div>
                    <img src={review.imageUrl} alt="광고 이미지" className="w-full rounded-lg border border-slate-200" />
                  </div>
                  {review.ocrText && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 inline-flex items-center gap-1">
                        <ScanText className="w-3 h-3" aria-hidden="true" />
                        OCR 추출 텍스트
                      </div>
                      <div className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed">
                        {review.ocrText}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AIPanel>

          {ai && ai.violations.length > 0 && (
            <AIPanel title="리스크 판단 카드">
              <ul className="space-y-2">
                {ai.violations.map((v, idx) => (
                  <li key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <RiskBadge level={v.severity} size="sm" />
                      <div className="text-sm font-bold text-slate-900">{v.category}</div>
                      <span className="text-[11px] font-mono text-slate-500 ml-auto">“{v.text}”</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{v.reason}</p>
                  </li>
                ))}
              </ul>
              {ai.riskScore !== undefined && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">종합 리스크 점수</div>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        ai.riskScore >= 80 ? 'bg-red-500' : ai.riskScore >= 50 ? 'bg-orange-500' : 'bg-[#212d3d]'
                      )}
                      style={{ width: `${ai.riskScore}%` }}
                    />
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-700">{ai.riskScore}</div>
                </div>
              )}
            </AIPanel>
          )}

          {ai?.suggestedRevision && (
            <AIPanel title="추천 수정안">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{ai.suggestedRevision}</p>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ai.suggestedRevision!)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    복사
                  </button>
                </div>
              </div>
            </AIPanel>
          )}
        </div>

        {/* AI 영역 (우) — 인용 */}
        <aside className="col-span-12 lg:col-span-5 space-y-3 lg:sticky lg:top-24 self-start">
          <AIPanel title="근거 인용">
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              원문 하이라이트에 마우스를 올리면 관련 인용이 자동으로 펼쳐집니다.
            </p>
            <div className="space-y-2">
              {(ai?.citations ?? []).map((c) => (
                <Fragment key={c.documentId}>
                  <CitationCard citation={c} expanded={focusedDocIds.includes(c.documentId)} />
                </Fragment>
              ))}
              {(!ai || ai.citations.length === 0) && (
                <p className="text-sm text-slate-400 italic">인용된 정책·가이드·선례가 없습니다.</p>
              )}
            </div>
          </AIPanel>

          {ai?.requiredTracks && ai.requiredTracks.length > 0 && (
            <AIPanel title="검토 트랙 (AI 판정)">
              <div className="flex flex-wrap gap-2">
                {ai.requiredTracks.map((t) => (
                  <span key={t} className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {t === 'compliance' ? '컴플라이언스' : '법무'}
                  </span>
                ))}
                <span className="text-[11px] text-slate-500 italic">사람이 트랙을 다시 결정할 필요 없음</span>
              </div>
            </AIPanel>
          )}
        </aside>
      </div>

      {/* 복수 검토 — 다른 담당자 결정 + 결정 재확인 요청 */}
      {isReviewer && isMultiTrack && otherDecisions.length > 0 && (
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#191919]">다른 담당자 결정</h3>
            <span className="text-[11px] text-[#767676]">
              모든 담당자 결정 완료 후 최종 결과가 요청자에게 전달됩니다.
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {otherDecisions.map((d) => (
              <li
                key={d.assigneeName}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-[#191919]">
                    {d.assigneeName}
                    <span className="ml-2 text-xs text-[#767676]">
                      ({d.domain === 'compliance' ? '컴플라이언스' : '법무'})
                    </span>
                  </div>
                  <div className="text-sm text-slate-700">
                    결정: <span className="font-bold">{decisionKo(d.outcome)}</span>
                    {d.decidedAt && (
                      <span className="ml-2 text-xs text-[#767676]">
                        {d.decidedAt.toLocaleString('ko-KR')}
                      </span>
                    )}
                  </div>
                  {d.memo && <div className="text-xs text-[#767676] italic">메모: "{d.memo}"</div>}
                </div>
                <button
                  type="button"
                  onClick={() => setRecheckOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#212d3d] border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  결정 재확인 요청
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sticky decision area */}
      <div className="border-t-2 border-slate-200 pt-6 flex flex-col gap-3">
        {isApplicant && review.status === ReviewStatus.UNDER_REVIEW && (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="self-start text-sm font-semibold text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            요청 취소
          </button>
        )}
        {!isApplicant && (
          <DecisionPanel variant="buttons" disabledReason={disabledReason} onDecide={handleDecide} />
        )}
      </div>

      {cancelOpen && (
        <CancelModal
          requestId={review.id}
          onClose={() => setCancelOpen(false)}
          onConfirm={(reason) => {
            toast.success(`요청이 취소되었습니다. (사유: ${reason})`);
            setCancelOpen(false);
            navigate('/reviews/my');
          }}
        />
      )}
      {recheckOpen && (
        <RecheckModal
          target={otherDecisions[0]}
          onClose={() => setRecheckOpen(false)}
          onConfirm={(reason) => {
            toast.success(`결정 재확인 요청을 보냈습니다. (사유: ${reason.slice(0, 16)}…)`);
            setRecheckOpen(false);
          }}
        />
      )}
    </div>
  );
}

function decisionKo(o?: 'approve' | 'reject' | 'cancel') {
  if (!o) return '미결정';
  if (o === 'approve') return '승인';
  if (o === 'reject') return '반려';
  return '취소';
}

function CancelModal({
  requestId,
  onClose,
  onConfirm,
}: {
  requestId: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 10;
  return (
    <ModalShell title={`요청 취소 · ${requestId}`} onClose={onClose}>
      <p className="text-sm text-[#767676] mb-4">
        취소 시 검토는 종료되며, 같은 케이스로 재요청할 수 없습니다.
      </p>
      <label className="text-xs font-bold uppercase tracking-wider text-[#767676]">
        취소 사유 *
      </label>
      <textarea
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="10자 이상 입력해 주세요. audit_event.payload에 적재됩니다."
        className="mt-2 w-full bg-[#f2f4f7] border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffeb00]"
      />
      <div className="text-[11px] text-[#767676] mt-2">
        알림: 배정된 담당자 전원에게 발송됩니다.
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={onClose} className="btn-secondary">
          닫기
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() => onConfirm(reason)}
          className={cn(
            'px-4 py-2 rounded-lg font-bold text-sm transition-colors',
            valid
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          )}
        >
          취소 확정
        </button>
      </div>
    </ModalShell>
  );
}

function RecheckModal({
  target,
  onClose,
  onConfirm,
}: {
  target?: { assigneeName: string; domain: 'compliance' | 'legal'; outcome?: 'approve' | 'reject' | 'cancel'; memo?: string };
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 20;
  return (
    <ModalShell title="결정 재확인 요청" onClose={onClose}>
      <div className="bg-[#f2f4f7] rounded-lg p-3 text-sm">
        <div className="font-semibold text-[#191919]">대상 결정</div>
        {target ? (
          <div className="text-sm text-slate-700 mt-1">
            {target.assigneeName} ({target.domain === 'compliance' ? '컴플라이언스' : '법무'}) ·{' '}
            <span className="font-bold">{decisionKo(target.outcome)}</span>
            {target.memo && <div className="text-xs text-[#767676] italic mt-1">메모: "{target.memo}"</div>}
          </div>
        ) : (
          <div className="text-sm text-[#767676]">대상이 없습니다.</div>
        )}
      </div>
      <label className="text-xs font-bold uppercase tracking-wider text-[#767676] mt-4 block">
        요청 사유 (새 쟁점) *
      </label>
      <textarea
        rows={5}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="추가 검토가 필요한 사유를 20자 이상 입력해 주세요."
        className="mt-2 w-full bg-[#f2f4f7] border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffeb00]"
      />
      <div className="text-[11px] text-[#767676] mt-2">
        대상 결정만 재확인 대기로 전환됩니다. 새 request_id·review_id는 발급되지 않습니다.
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={onClose} className="btn-secondary">
          취소
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() => onConfirm(reason)}
          className={cn(
            'px-4 py-2 rounded-lg font-bold text-sm transition-colors',
            valid ? 'btn-yellow' : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          )}
        >
          재확인 요청 보내기
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#191919]">{title}</h3>
          <button type="button" onClick={onClose} aria-label="닫기" className="p-1 hover:bg-slate-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AIPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-slate-50 border-l-4 border-slate-300 border-y border-r border-slate-200 rounded-r-xl">
      <header className="px-4 py-2.5 flex items-center gap-2 bg-white border-b border-slate-200 rounded-tr-xl">
        <Sparkles className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded ml-auto">
          AI 분석
        </span>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Banner({
  tone,
  Icon,
  title,
  body,
}: {
  tone: 'red' | 'orange' | 'slate';
  Icon: typeof AlertTriangle;
  title: string;
  body: string;
}) {
  const cls =
    tone === 'red'
      ? 'bg-red-50 border-red-200 text-red-800'
      : tone === 'orange'
      ? 'bg-orange-50 border-orange-200 text-orange-800'
      : 'bg-slate-50 border-slate-200 text-slate-700';
  return (
    <div className={cn('border rounded-lg p-3 flex items-start gap-3', cls)}>
      <Icon className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="space-y-0.5">
        <div className="font-bold text-sm">{title}</div>
        <p className="text-xs leading-relaxed opacity-90">{body}</p>
      </div>
    </div>
  );
}

// re-export Lightbulb just to keep tree-shake happy
void Lightbulb;
