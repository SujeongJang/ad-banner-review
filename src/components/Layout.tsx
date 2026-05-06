import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  BookOpen,
  PlusCircle,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const location = useLocation();
  const onReviewList = location.pathname.startsWith('/reviews');
  const onPolicies = location.pathname.startsWith('/policies');

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f4f7]">
      {/* Header — KakaoPay Pay Dark Blue */}
      <header className="h-14 bg-[#212d3d] text-white fixed top-0 w-full z-50 flex items-center justify-between px-6 border-b border-[#2f3d52]">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#ffeb00]">
              <ShieldCheck className="text-[#212d3d] w-4 h-4" />
            </span>
            <span className="text-base font-bold tracking-tight">광고/배너 검토 어드민</span>
            <span className="ml-2 text-xs font-medium text-white/50 hidden md:inline">
              KakaoPay Securities
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/requests/new"
            className="hidden sm:inline-flex items-center gap-2 bg-[#ffeb00] text-[#191919] px-4 py-1.5 rounded-lg text-sm font-bold hover:brightness-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />새 검토 요청
          </Link>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="알림"
          >
            <Bell className="w-5 h-5 text-white/70" />
          </button>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3 pl-1">
            <div className="flex flex-col items-end text-right">
              <span className="text-sm font-semibold leading-tight">김컴플</span>
              <span className="text-[11px] text-white/60">
                준법지원팀 · 컴플라이언스
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center text-xs font-bold">
              김
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-14 h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col p-4 gap-1 overflow-y-auto">
          <div className="mb-6 px-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Admin Console
            </span>
          </div>

          <SidebarItem
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="처리현황"
            to="/dashboard"
          />

          {/* 검토 리스트 — 전체/MY 탭 구조 */}
          <div className="mt-4">
            <NavLink
              to="/reviews"
              end
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                onReviewList
                  ? 'bg-[#ffeb00]/30 text-[#191919] font-bold'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <ClipboardList className="w-4 h-4" />
              검토 리스트
            </NavLink>
            {onReviewList && (
              <div className="ml-6 mt-1 mb-1 flex flex-col gap-0.5">
                <SubItem to="/reviews" label="전체" />
                <SubItem to="/reviews/my" label="MY" />
              </div>
            )}
          </div>

          {/* 정책 데이터 — 정책·법령 / 내부 가이드 */}
          <div className="mt-4">
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium',
                onPolicies
                  ? 'bg-[#ffeb00]/30 text-[#191919] font-bold'
                  : 'text-slate-600',
              )}
            >
              <FileText className="w-4 h-4" />
              정책 데이터
            </div>
            <div className="ml-6 mt-1 flex flex-col gap-0.5">
              <SubItem to="/policies/laws" label="정책·법령" />
              <SubItem to="/policies/guides" label="내부 가이드" />
            </div>
          </div>

          <div className="mt-auto pt-6 px-2 text-[11px] text-slate-400 leading-relaxed">
            AI는 제안하고 사람이 결정합니다.
            <br />
            모든 판단 근거는 인용으로 남습니다.
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-[#f2f4f7] p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
          isActive
            ? 'bg-[#ffeb00]/30 text-[#191919] font-bold'
            : 'text-slate-600 hover:bg-slate-100',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function SubItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'text-sm pl-3 pr-2 py-1.5 rounded-md transition-colors',
          isActive
            ? 'text-[#191919] font-semibold bg-slate-100'
            : 'text-slate-500 hover:text-slate-900',
        )
      }
    >
      {label}
    </NavLink>
  );
}
