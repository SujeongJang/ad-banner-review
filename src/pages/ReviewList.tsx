import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { dummyReviews } from '../data/reviews';
import {
  ReviewRequest,
  ReviewStatus,
  AIResultLabel,
} from '../types';
import { RiskBadge } from '../components/RiskBadge';

const materialIcon = (material: string) => {
  if (material.includes('영상')) return <Video className="w-4 h-4" aria-hidden="true" />;
  if (material.includes('텍스트')) return <FileText className="w-4 h-4" aria-hidden="true" />;
  return <ImageIcon className="w-4 h-4" aria-hidden="true" />;
};

const formatDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(
    d.getHours()
  ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

const ME = '김컴플';

export function ReviewList() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMyTab = location.pathname.endsWith('/my');
  const [reviews] = useState<ReviewRequest[]>(dummyReviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'전체' | ReviewStatus>('전체');

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (isMyTab && r.assigneeName !== ME && r.applicantName !== ME) return false;
      if (statusFilter !== '전체' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q) ||
          r.campaignName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, search, statusFilter, isMyTab]);

  const total = reviews.length;
  const todayCount = reviews.filter((r) => isToday(r.updatedAt) && r.status === ReviewStatus.APPROVED).length;
  const autoApproveRate = ((reviews.filter((r) => r.aiResult?.label === AIResultLabel.EXPRESSION_FIX && r.status === ReviewStatus.APPROVED).length / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#191919]">검토 리스트</h1>
          <p className="text-[#767676] mt-1 text-sm">
            전사 검토 건(전체) 또는 본인 요청·배정 건(MY)을 확인하고 상세 레이어로 이동합니다.
          </p>
        </div>
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-1">
          <button
            type="button"
            onClick={() => navigate('/reviews')}
            className={cn(
              'text-sm font-semibold px-4 py-1.5 rounded-md transition-colors',
              !isMyTab ? 'bg-[#212d3d] text-white' : 'text-slate-500 hover:bg-slate-50',
            )}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => navigate('/reviews/my')}
            className={cn(
              'text-sm font-semibold px-4 py-1.5 rounded-md transition-colors',
              isMyTab ? 'bg-[#212d3d] text-white' : 'text-slate-500 hover:bg-slate-50',
            )}
          >
            MY
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryItem label="누적 검토 건수" value={`${total}건`} trend="더미" trendType="neutral" />
        <SummaryItem label="오늘 완료 건수" value={`${todayCount}건`} trend="오늘 기준" trendType="success" />
        <SummaryItem label="AI 자동 보완 비율" value={`${autoApproveRate}%`} trend="보완 라벨 기준" trendType="neutral" />
        <SummaryItem label="평균 처리 시간" value="6.2시간" type="active" />
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FilterReadOnly label="신청 기간" value="2026-04-30 ~ 2026-05-06" hasIcon />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">검토 상태</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm appearance-none"
              >
                <option value="전체">전체 상태</option>
                {Object.values(ReviewStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
            </div>
          </div>
          <FilterReadOnly label="검토 담당자" value="전체 담당자" />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">통합 검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ID, 신청자, 캠페인명 검색"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#212d3d] transition-all"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('전체');
            }}
            className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
          >
            필터 초기화
          </button>
          <span className="text-xs font-medium text-slate-400">필터링 {filtered.length}건 / 전체 {total}건</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900">이력 상세 목록</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">총 {filtered.length}건</span>
          </div>
          <button type="button" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <Download className="w-4 h-4" aria-hidden="true" />
            CSV 다운로드
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-3">Request ID</th>
                <th className="px-6 py-3">신청자</th>
                <th className="px-6 py-3">캠페인</th>
                <th className="px-6 py-3">소재</th>
                <th className="px-6 py-3">상태</th>
                <th className="px-6 py-3">AI 결과</th>
                <th className="px-6 py-3">위험도</th>
                <th className="px-6 py-3">담당자</th>
                <th className="px-6 py-3">요청일</th>
                <th className="px-6 py-3 text-right">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/reviews/${r.id}`)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-bold text-[#212d3d]">{r.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[150px]">
                    {r.applicantName} <span className="text-slate-400 text-xs">({r.department})</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 truncate max-w-[220px]">{r.campaignName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {materialIcon(r.materialType)}
                      {r.materialType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4">
                    {r.aiResult ? (
                      <AIResultBadge label={r.aiResult.label} confidence={r.aiResult.confidence} />
                    ) : (
                      <span className="text-xs text-slate-400">대기</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {r.aiResult ? <RiskBadge level={r.aiResult.riskLevel} score={r.aiResult.riskScore} size="sm" /> : null}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.assigneeName ?? '-'}</td>
                  <td className="px-6 py-4 text-[11px] font-medium text-slate-400 font-mono tracking-tight">{formatDate(r.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reviews/${r.id}`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-[#212d3d] hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label={`${r.id} 상세 보기`}
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-400">
                    조건에 맞는 검토 요청이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center">
          <span className="text-xs font-medium text-slate-400">Showing 1-{filtered.length} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" aria-label="이전">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#212d3d] text-white text-xs font-bold">1</button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" aria-label="다음">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isToday(d: Date) {
  const now = new Date('2026-05-06T10:00:00');
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function SummaryItem({ label, value, trend, trendType, type = 'default' }: any) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex flex-col gap-1 transition-all',
        type === 'active' ? 'bg-[#ffeb00]/30 border-[#ffeb00]/50' : 'bg-white border-slate-200'
      )}
    >
      <span className={cn('text-[10px] font-bold uppercase tracking-wider', type === 'active' ? 'text-[#212d3d]' : 'text-slate-400')}>{label}</span>
      <div className="flex justify-between items-end">
        <span className={cn('text-xl font-bold', type === 'active' ? 'text-[#212d3d]' : 'text-slate-900')}>{value}</span>
        {trend && (
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded',
              trendType === 'success' ? 'text-[#212d3d]' : 'text-slate-400'
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function FilterReadOnly({ label, value, hasIcon }: { label: string; value: string; hasIcon?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <input
          readOnly
          value={value}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm text-slate-600 cursor-not-allowed"
        />
        {hasIcon ? (
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

const statusTone: Record<ReviewStatus, string> = {
  [ReviewStatus.REQUESTED]: 'bg-slate-100 text-slate-600',
  [ReviewStatus.UNDER_REVIEW]: 'bg-slate-100 text-slate-700',
  [ReviewStatus.PENDING_RECONFIRMATION]: 'bg-orange-50 text-orange-700',
  [ReviewStatus.REJECTED]: 'bg-red-50 text-red-600',
  [ReviewStatus.APPROVED]: 'bg-[#ffeb00]/40 text-[#191919]',
  [ReviewStatus.COMPLETED]: 'bg-[#212d3d] text-white',
  [ReviewStatus.CANCELLED]: 'bg-slate-100 text-slate-400',
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const cls = statusTone[status];
  const Icon =
    status === ReviewStatus.APPROVED || status === ReviewStatus.COMPLETED
      ? CheckCircle2
      : status === ReviewStatus.REJECTED
      ? AlertCircle
      : status === ReviewStatus.PENDING_RECONFIRMATION
      ? HelpCircle
      : Clock;
  return (
    <span className={cn('text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1', cls)}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {status}
    </span>
  );
}

const aiTone: Record<AIResultLabel, string> = {
  [AIResultLabel.AUTO_REJECTED]: 'text-red-600',
  [AIResultLabel.HUMAN_REVIEW_REQUIRED]: 'text-slate-700',
  [AIResultLabel.EXPRESSION_FIX]: 'text-[#212d3d]',
  [AIResultLabel.GREY_AREA]: 'text-orange-600',
  [AIResultLabel.DELAYED]: 'text-slate-400',
};

export function AIResultBadge({ label, confidence }: { label: AIResultLabel; confidence: number }) {
  return (
    <div className={cn('text-xs font-bold flex items-center gap-1.5', aiTone[label])}>
      {label === AIResultLabel.AUTO_REJECTED ? (
        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
      ) : label === AIResultLabel.EXPRESSION_FIX ? (
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span>{label}</span>
      <span className="font-mono text-[10px] opacity-60">({(confidence * 100).toFixed(0)}%)</span>
    </div>
  );
}
