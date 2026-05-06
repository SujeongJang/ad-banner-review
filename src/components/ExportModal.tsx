/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { Download, FileText, Sheet, X } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

type Format = 'pdf' | 'csv';

export function ExportModal({
  open,
  onClose,
  reviewId,
}: {
  open: boolean;
  onClose: () => void;
  reviewId: string;
}) {
  const [format, setFormat] = useState<Format>('pdf');
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const start = () => {
    setRunning(true);
    setProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setRunning(false);
        toast.success(`${format.toUpperCase()} 감사 자료가 생성되었습니다 (모의 다운로드).`);
        onClose();
        setProgress(0);
      }
    }, 350);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="감사 자료 내보내기"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <header className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#212d3d]" aria-hidden="true" />
          <h2 className="font-bold text-slate-900">감사 자료 내보내기</h2>
          <button type="button" onClick={onClose} className="ml-auto p-1 hover:bg-slate-100 rounded" aria-label="닫기">
            <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </button>
        </header>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            요청 <code className="font-mono bg-slate-100 px-1 rounded">{reviewId}</code>의 변경 이력·근거 인용·결정·감사
            로그를 한 번에 내려받습니다.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <FormatTile selected={format === 'pdf'} onClick={() => setFormat('pdf')} Icon={FileText} title="PDF" desc="타임라인 1장 구성" />
            <FormatTile selected={format === 'csv'} onClick={() => setFormat('csv')} Icon={Sheet} title="CSV" desc="감사·분쟁 대응" />
          </div>

          {running && (
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500">{progress}% 생성 중…</div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#212d3d] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
        <footer className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button type="button" onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2">
            취소
          </button>
          <button
            type="button"
            onClick={start}
            disabled={running}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm',
              running ? 'bg-slate-200 text-slate-400' : 'bg-[#212d3d] text-white hover:bg-[#2f3d52]'
            )}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {running ? '생성 중…' : '내보내기'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function FormatTile({
  selected,
  onClick,
  Icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  Icon: typeof FileText;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-start gap-1 p-3 rounded-lg border-2 text-left transition-colors',
        selected ? 'border-[#212d3d] bg-[#ffeb00]/10' : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <Icon className={cn('w-4 h-4', selected ? 'text-[#212d3d]' : 'text-slate-500')} aria-hidden="true" />
      <div className={cn('text-sm font-bold', selected ? 'text-[#212d3d]' : 'text-slate-900')}>{title}</div>
      <div className="text-[11px] text-slate-500">{desc}</div>
    </button>
  );
}
