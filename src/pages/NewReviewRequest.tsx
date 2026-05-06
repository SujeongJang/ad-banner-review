import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Send, Upload, ScanText, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { StageIndicator } from '../components/StageIndicator';
import { SelfCheckCard, evaluateSelfCheck } from '../components/SelfCheckCard';
import { SelfCheckFinding } from '../types';

const MATERIAL_TYPES = ['앱 배너 (Home)', '앱 푸시', '카카오톡 알림', '웹 배너', '숏폼 영상', '앱 내 텍스트'];
const CHANNELS = ['앱 푸시', '메인 홈', '카카오톡 알림', '웹', '외부 매체'];

export function NewReviewRequest() {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [materialType, setMaterialType] = useState(MATERIAL_TYPES[0]);
  const [channels, setChannels] = useState<string[]>(['앱 푸시']);
  const [exposureStart, setExposureStart] = useState('');
  const [adCopy, setAdCopy] = useState('카카오페이와 함께라면 전 세계 어디서나 최저가 보장!');
  const [imageName, setImageName] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);

  const [debouncing, setDebouncing] = useState(false);
  const [findings, setFindings] = useState<SelfCheckFinding[]>([]);

  // 800ms 디바운스 후 셀프 체크 — 와이어프레임 01 §2
  useEffect(() => {
    setDebouncing(true);
    const t = setTimeout(() => {
      setFindings(evaluateSelfCheck(adCopy));
      setDebouncing(false);
    }, 800);
    return () => clearTimeout(t);
  }, [adCopy]);

  const canSubmit = useMemo(
    () => campaignName.trim().length > 0 && adCopy.trim().length > 0 && channels.length > 0,
    [campaignName, adCopy, channels]
  );

  const onApply = (f: SelfCheckFinding) => {
    setAdCopy((prev) => prev.replaceAll(f.text, extractAlternative(f.suggestion)));
    toast.success(`“${f.text}” 표현을 보완 표현으로 교체했습니다.`);
  };

  const onIgnore = (f: SelfCheckFinding) => {
    const reason = window.prompt(`“${f.text}” 항목을 무시하는 사유를 입력해주세요.`, '담당자 판단으로 무시');
    if (!reason) return;
    setFindings((prev) => prev.map((x) => (x.text === f.text && x.category === f.category ? { ...x, ignored: true, ignoreReason: reason } : x)));
  };

  const onPreReview = () => {
    if (!canSubmit) {
      toast.error('필수 입력(캠페인·채널·카피)을 채워주세요.');
      return;
    }
    toast.success('AI 선검토 요청을 접수했습니다. 검토 리스트로 이동합니다.');
    navigate('/reviews');
  };

  const onUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    setOcrText(null);
    setTimeout(() => setOcrText('(OCR 추출 예시) 5월 한정 ISA 특별 혜택'), 600);
  };

  const toggleChannel = (c: string) => {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <div className="space-y-6 pb-32">
      <StageIndicator current={1} />

      <div>
        <h1 className="text-3xl font-bold text-slate-900">새 검토 요청 등록</h1>
        <p className="text-slate-500 mt-1">광고 소재·캠페인 메타와 카피를 입력하면 AI 선검토 요청 전 셀프 체크가 자동 수행됩니다.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="card p-6 space-y-5">
            <h2 className="text-base font-bold border-b pb-3">기본 캠페인 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="소재 유형 *">
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm"
                >
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="캠페인 명 *">
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm"
                  placeholder="예: ISA 신규가입 5월 배너"
                />
              </FormField>
              <FormField label="채널 *">
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleChannel(c)}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors',
                        channels.includes(c)
                          ? 'bg-[#212d3d] text-white border-[#212d3d]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="공개 시작일">
                <input
                  type="date"
                  value={exposureStart}
                  onChange={(e) => setExposureStart(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm"
                />
              </FormField>
            </div>
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="text-base font-bold border-b pb-3">광고 문안 작성</h2>
            <FormField label="광고 메인 카피 *">
              <textarea
                value={adCopy}
                onChange={(e) => setAdCopy(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#212d3d]"
                placeholder="광고 메인 카피를 입력하세요. 입력 후 800ms 후 자동으로 셀프 체크가 수행됩니다."
              />
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                {debouncing ? '입력 감지 중…' : '셀프 체크 결과는 우측 패널에 표시됩니다.'}
              </div>
            </FormField>
          </section>

          <section className="card p-6 space-y-4">
            <h2 className="text-base font-bold border-b pb-3">이미지 업로드 & OCR</h2>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg p-6 cursor-pointer hover:border-slate-300 transition-colors">
              <Upload className="w-5 h-5 text-slate-400" aria-hidden="true" />
              <span className="text-sm text-slate-500">이미지를 드래그하거나 클릭해 업로드</span>
              <input type="file" accept="image/*" className="hidden" onChange={onUploadImage} />
            </label>
            {imageName && (
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <ImageIcon className="w-4 h-4 text-slate-500 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-semibold text-slate-700 truncate">{imageName}</div>
                  <div className="mt-1 flex items-center gap-1 text-slate-500">
                    <ScanText className="w-3 h-3" aria-hidden="true" />
                    {ocrText ?? 'OCR 추출 중…'}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-4">
          <SelfCheckCard findings={findings} loading={debouncing && findings.length === 0} onApply={onApply} onIgnore={onIgnore} />

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600 leading-relaxed">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">안내</div>
            셀프 체크는 입력 중 자동으로 수행되는 <strong>본인 사전 점검</strong>입니다. 정책·선례 기반 정밀 판단은 하단의 <strong>“AI 선검토 요청”</strong> 버튼을 눌러 시작됩니다.
          </div>
        </aside>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-end gap-3 z-40">
        <button
          type="button"
          onClick={onPreReview}
          disabled={!canSubmit}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-colors',
            canSubmit
              ? 'bg-[#212d3d] text-white hover:bg-[#2f3d52]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
          aria-disabled={!canSubmit}
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          AI 선검토 요청
        </button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function extractAlternative(suggestion: string): string {
  const m = suggestion.match(/“([^”]+)”/);
  return m ? m[1] : suggestion;
}
