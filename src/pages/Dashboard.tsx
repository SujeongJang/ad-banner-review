import {
  Clock,
  AlertTriangle,
  RefreshCcw,
  Calendar,
  MoreVertical,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { dummyReviews } from '../data/reviews';
import { ReviewStatus } from '../types';

const data = [
  { name: '대기', value: dummyReviews.filter((r) => r.status === ReviewStatus.REQUESTED || r.status === ReviewStatus.UNDER_REVIEW).length, color: '#212d3d' },
  { name: '재확인 대기', value: dummyReviews.filter((r) => r.status === ReviewStatus.PENDING_RECONFIRMATION).length, color: '#ffeb00' },
  { name: '결정 완료', value: dummyReviews.filter((r) => r.status === ReviewStatus.APPROVED || r.status === ReviewStatus.REJECTED || r.status === ReviewStatus.COMPLETED).length, color: '#191919' },
];

const violationData = [
  { type: '수익률 단정 표현', count: 34 },
  { type: '필수 고지 누락', count: 28 },
  { type: '최상급·단정 표현', count: 19 },
  { type: '원금 보장 광고', count: 12 },
  { type: '근거 불충분', count: 8 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const delayed = dummyReviews
    .filter((r) => r.slaDueAt && r.slaDueAt < new Date('2026-05-06T10:00:00') && r.status === ReviewStatus.UNDER_REVIEW)
    .slice(0, 3);
  const watching = dummyReviews
    .filter((r) => r.status === ReviewStatus.UNDER_REVIEW)
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#191919]">처리현황</h1>
          <p className="text-[#767676] mt-1 text-sm">
            상태별 건수, 핵심 지표, SLA 지연, 담당자별 처리량, 반복 위반 유형 — PRD § 4 기준
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span className="text-sm font-semibold">이번 달 (2026-05)</span>
          </div>
          <button
            type="button"
            className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            aria-label="새로고침"
          >
            <RefreshCcw className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* KPI Cards — 북극성 / 가드레일 / 진단 3-tier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="AI 제안↔사람 결정 일치율"
          value="82%"
          trend="북극성 지표"
          trendLabel="MVP 기준선 산정 중"
          icon={<Zap className="w-5 h-5 text-[#212d3d]" aria-hidden="true" />}
        />
        <KPICard
          title="정책 버전 누락율"
          value="0%"
          trend="가드레일"
          trendType="neutral"
          trendLabel="감사 로그 인용 기준"
          icon={<AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />}
        />
        <KPICard
          title="평균 처리 시간"
          value="6.2h"
          trend="진단 지표"
          trendLabel="전주 평균 대비 -0.5h"
          icon={<Clock className="w-5 h-5 text-slate-400" aria-hidden="true" />}
        />
        <KPICard
          title={`지연 발생 건수 (${delayed.length})`}
          value={`${delayed.length}`}
          isAlert={delayed.length > 0}
          trend={delayed.length > 0 ? '즉시 확인하기' : 'SLA 정상'}
          icon={<AlertTriangle className="w-5 h-5 text-white" aria-hidden="true" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">검토 단계별 현황</h3>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-6 space-y-6">
              {data.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold">{item.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / 250) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Top 5 위반 유형</h3>
            </div>
            <div className="p-2">
              {violationData.map((item, i) => (
                <div key={item.type} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                    <span className="text-sm text-slate-700">{item.type}</span>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full group-hover:bg-[#212d3d]/10 group-hover:text-[#212d3d] transition-colors">{item.count}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Table */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900">SLA 위험 / 결정 대기</h3>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Critical · {delayed.length}
                </span>
              </div>
              <button type="button" onClick={() => navigate('/reviews')} className="text-xs font-bold text-[#212d3d] hover:underline">
                전체 보기
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Request ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">캠페인 / 신청자</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">SLA</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">단계</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...delayed, ...watching.filter((w) => !delayed.includes(w))].slice(0, 5).map((r) => {
                    const overdue = r.slaDueAt && r.slaDueAt < new Date('2026-05-06T10:00:00');
                    return (
                      <tr key={r.id} className={cn('hover:bg-slate-50 transition-colors', overdue && 'bg-red-50/30')}>
                        <td className="px-6 py-4 text-sm font-bold text-[#212d3d]">{r.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900 truncate max-w-[280px]">{r.campaignName}</span>
                            <span className="text-[10px] text-slate-400">
                              {r.applicantName} · {r.department}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn('flex items-center gap-1.5 text-sm font-bold', overdue ? 'text-red-600' : 'text-slate-500')}>
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {r.slaDueAt ? formatRelative(r.slaDueAt) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs text-slate-600">{r.status}</span>
                            <div className="w-32 bg-slate-100 rounded-full h-1 overflow-hidden">
                              <div
                                className={cn('h-full', overdue ? 'bg-red-500' : 'bg-[#212d3d]')}
                                style={{ width: overdue ? '90%' : '45%' }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/reviews/${r.id}`)}
                            className="border border-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            상세 보기
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {delayed.length === 0 && watching.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                        SLA 위험 또는 결정 대기 건이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelative(d: Date) {
  const now = new Date('2026-05-06T10:00:00');
  const diffH = (d.getTime() - now.getTime()) / 3600000;
  if (diffH < 0) return `${Math.abs(diffH).toFixed(1)}h 초과`;
  return `${diffH.toFixed(1)}h 남음`;
}

function KPICard({ title, value, trend, trendLabel, icon, isAlert = false, trendType = 'success' }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-xl border flex flex-col justify-between h-36 relative overflow-hidden transition-all hover:translate-y-[-2px]",
        isAlert ? "bg-red-600 border-red-700 text-white" : "bg-white border-slate-200 shadow-sm"
      )}
    >
      <div className="z-10">
        <div className="flex justify-between items-start mb-2">
          <span className={cn("text-xs font-bold uppercase tracking-wider", isAlert ? "text-red-100" : "text-slate-500")}>
            {title}
          </span>
          {icon}
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs z-10">
        <span className={cn(
          "font-bold",
          isAlert ? "text-white underline underline-offset-4 cursor-pointer" : 
          trendType === 'neutral' ? "text-slate-400" : "text-[#212d3d]"
        )}>
          {trend}
        </span>
        {!isAlert && <span className="text-slate-400">{trendLabel}</span>}
      </div>

      {isAlert && (
        <AlertTriangle className="absolute -bottom-6 -right-6 text-white/10 w-24 h-24" />
      )}
    </motion.div>
  );
}
