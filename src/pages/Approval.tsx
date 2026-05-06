import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Save, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { dummyReviews } from '../data/reviews';
import { AuditEntry, ReviewStatus } from '../types';
import { StageIndicator } from '../components/StageIndicator';
import { VersionDiffTimeline } from '../components/VersionDiffTimeline';
import { AuditLogCard } from '../components/AuditLogCard';
import { DecisionPanel, DecisionKind, decisionRequiresMemo } from '../components/DecisionPanel';
import { ExportModal } from '../components/ExportModal';
import { RiskBadge } from '../components/RiskBadge';
import { ReviewerLabelBadge } from '../components/ReviewerLabelBadge';
import { StatusBadge } from './ReviewList';
import { cn } from '../lib/utils';

const CURRENT_USER = { name: '김컴플', department: '준법지원팀' };

export function Approval() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const reviewIdx = useMemo(() => dummyReviews.findIndex((r) => r.id === id), [id]);
  const review = reviewIdx >= 0 ? dummyReviews[reviewIdx] : null;

  const prefill = (params.get('prefill') as DecisionKind | null) || null;
  const memoPrefill = params.get('memo') || '';

  const [decision, setDecision] = useState<DecisionKind | null>(prefill);
  const [memo, setMemo] = useState(memoPrefill);
  const [savedAudit, setSavedAudit] = useState<AuditEntry | null>(
    review?.audit && review.audit.length > 0 ? review.audit[review.audit.length - 1] : null
  );
  const [exportOpen, setExportOpen] = useState(false);
  const [postUrl, setPostUrl] = useState(review?.postRelease?.exposureUrl ?? '');
  const [postShot, setPostShot] = useState(review?.postRelease?.screenshotUrl ?? '');

  useEffect(() => {
    // sync if user navigates between approvals
    if (review) {
      setSavedAudit(review.audit.length > 0 ? review.audit[review.audit.length - 1] : null);
    }
  }, [review]);

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

  const currentVersion = review.versions[review.versions.length - 1];
  const previousVersion = review.versions.length >= 2 ? review.versions[review.versions.length - 2] : null;
  const isReadOnly = !!savedAudit;
  const memoMissing = decision ? decisionRequiresMemo(decision) && memo.trim().length === 0 : false;
  const canSave = !!decision && !memoMissing && !isReadOnly;

  const handleSave = () => {
    if (!decision) {
      toast.error('결정 종류를 선택해주세요.');
      return;
    }
    if (memoMissing) {
      toast.error('해당 결정은 판단 메모가 필수입니다.');
      return;
    }
    const reviewId = `REV-${review.id.replace('REQ-', '')}-${String(review.audit.length + 1).padStart(2, '0')}`;
    const audit: AuditEntry = {
      reviewId,
      requestId: review.id,
      approverName: CURRENT_USER.name,
      approverDepartment: CURRENT_USER.department,
      decision: decision as ReviewStatus,
      decidedAt: new Date(),
      policyVersions: (review.aiResult?.citations ?? [])
        .filter((c) => c.type !== '선례')
        .map((c) => ({ documentId: c.documentId, version: c.version })),
      precedentIds: (review.aiResult?.citations ?? []).filter((c) => c.type === '선례').map((c) => c.documentId),
      copyBefore: previousVersion?.adCopy ?? currentVersion.adCopy,
      copyAfter: currentVersion.adCopy,
      memo,
    };

    // mutate fixture in-memory (mock)
    review.audit.push(audit);
    review.status = decision as ReviewStatus;
    review.updatedAt = new Date();
    setSavedAudit(audit);
    toast.success('결정이 저장되었습니다. 감사 로그가 자동 생성되었습니다.');
  };

  const handleSavePostRelease = () => {
    if (!postUrl) {
      toast.error('노출 URL을 입력해주세요.');
      return;
    }
    review.postRelease = {
      exposureUrl: postUrl,
      screenshotUrl: postShot,
      verifiedAt: new Date(),
      verifiedBy: CURRENT_USER.name,
    };
    toast.success('사후 검증 정보가 저장되었습니다.');
  };

  return (
    <div className="space-y-6 pb-32">
      <Link to={`/reviews/${review.id}`} className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        검토 상세로
      </Link>

      <StageIndicator current={savedAudit ? 4 : 3} />

      {/* Header */}
      <header className="card p-5 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            {review.id} · v{currentVersion.version}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{review.campaignName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {review.applicantName} ({review.department}) · {review.materialType}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={review.status} />
          {review.aiResult && <RiskBadge level={review.aiResult.riskLevel} score={review.aiResult.riskScore} />}
          {review.reviewerLabel && <ReviewerLabelBadge label={review.reviewerLabel} />}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: 정보 + 변경 이력 */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <section className="card p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">소재 정보</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Info label="캠페인" value={review.campaignName} />
              <Info label="소재 유형" value={review.materialType} />
              <Info label="채널" value={review.channels.join(', ')} />
              <Info label="긴급도" value={review.urgency} />
              <Info label="신청자" value={`${review.applicantName} (${review.department})`} />
              <Info label="담당자" value={review.assigneeName ?? '미배정'} />
            </dl>
          </section>

          <section className="card p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">변경 이력</h2>
            <VersionDiffTimeline versions={review.versions} />
          </section>
        </div>

        {/* Right: 결정 + 감사 */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <DecisionPanel
            variant="radio"
            disabledReason={isReadOnly ? '이미 결정이 저장되었습니다. 동일 결정에 대한 추가 저장은 불가합니다.' : undefined}
            defaultDecision={decision ?? undefined}
            defaultMemo={memo}
            onChange={(d, m) => {
              setDecision(d);
              setMemo(m);
            }}
          />

          <AuditLogCard entry={savedAudit ?? undefined} placeholder={!savedAudit} />

          {decision === ReviewStatus.APPROVED && savedAudit && (
            <section className="bg-white border-2 border-[#212d3d]/30 rounded-xl shadow-sm">
              <header className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#212d3d]" aria-hidden="true" />
                <h3 className="text-sm font-bold text-[#212d3d]">사후 검증 (릴리즈 후)</h3>
              </header>
              <div className="p-5 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">노출 URL</label>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">스크린샷 URL</label>
                  <input
                    type="url"
                    value={postShot}
                    onChange={(e) => setPostShot(e.target.value)}
                    placeholder="https://"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSavePostRelease}
                  className="text-xs font-bold text-[#212d3d] hover:bg-[#ffeb00]/10 px-3 py-1.5 rounded"
                >
                  사후 검증 저장
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-end gap-3 z-40">
        <button
          type="button"
          onClick={() => setExportOpen(true)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          감사 자료 내보내기
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-colors',
            canSave ? 'bg-[#212d3d] text-white hover:bg-[#2f3d52]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
          aria-disabled={!canSave}
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          {isReadOnly ? '저장됨' : '결정 저장'}
        </button>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} reviewId={review.id} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</dt>
      <dd className="text-slate-800 font-semibold">{value}</dd>
    </div>
  );
}
