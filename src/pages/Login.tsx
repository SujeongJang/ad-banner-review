import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!id || !pw) {
      setError('아이디와 비밀번호를 입력해 주세요.');
      return;
    }
    // 데모: 검토 담당자는 처리현황, 요청자는 검토 리스트 MY로 이동.
    // 사내 계정 형식 가정: id에 'comp' 또는 'legal' 포함 시 검토 담당자.
    const isReviewer = /comp|legal|admin/i.test(id);
    navigate(isReviewer ? '/dashboard' : '/reviews/my');
  };

  return (
    <div className="min-h-screen bg-[#212d3d] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[#ffeb00]">
            <ShieldCheck className="text-[#212d3d] w-5 h-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-bold">광고/배너 검토 어드민</span>
            <span className="text-xs text-white/60">KakaoPay Securities</span>
          </div>
        </div>

        <div className="bg-white text-[#191919] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold mb-1">사내 계정으로 로그인</h1>
          <p className="text-sm text-[#767676] mb-6">
            계정 권한에 따라 진입 화면이 결정됩니다.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#767676] uppercase tracking-wider">
                아이디
              </span>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="employee@kakaopaysec"
                className="w-full bg-[#f2f4f7] border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffeb00]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#767676] uppercase tracking-wider">
                비밀번호
              </span>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f2f4f7] border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffeb00]"
              />
            </label>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="mt-2 w-full bg-[#ffeb00] text-[#191919] font-bold py-2.5 rounded-lg hover:brightness-95 transition-all"
            >
              로그인
            </button>
          </form>

          <p className="text-[11px] text-[#767676] mt-6 text-center leading-relaxed">
            사내 SSO와 연동됩니다. 계정 잠김·세션 만료는 사내 IT에 문의하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
