import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiPost } from "@/lib/utils";

export default function Pay() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  

  const returnTo = useMemo(() => {
    const from = params.get("from");
    return from && from.startsWith("/") ? from : "/report";
  }, [params]);

  // 仅保留邀请码方式，不再展示其他定价/货币内容

  useEffect(() => {
    const hasPaid = typeof window !== "undefined" && window.localStorage.getItem("hasPaid") === "1";
    if (hasPaid) {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo]);

  const handlePay = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    try {
      setError("");
      // 调用后端仅校验邀请码
      const resp = await apiPost<{ paid: boolean; message?: string }>("/api/pay/create", { inviteCode });

      if (resp.paid) {
        window.localStorage.setItem("hasPaid", "1");
        navigate(returnTo, { replace: true });
        return;
      }
      setError(resp.message || "邀请码无效，请联系管理员获取有效邀请码");
    } catch (e: any) {
      setError(e.message || '创建订单失败');
    } finally {
      setProcessing(false);
    }
  }, [processing, navigate, returnTo, inviteCode]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">输入邀请码解锁下载</h1>
      <p className="text-slate-600 mb-8">输入有效邀请码后将自动返回并开始生成 PDF。</p>

      <div className="rounded-lg border border-slate-200 p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-900 font-semibold mb-1">ESG 风险分析报告</div>
            <div className="text-slate-500 text-sm">一次性购买，含封面、目录、分析、免责声明与联系页</div>
          </div>
          {/* 已移除价格显示 */}
        </div>

        {/* 已移除支付方式与货币选择，仅保留邀请码 */}

        {/* 邀请码输入区 */}
        <div className="mt-8">
          <label className="block text-slate-800 font-medium mb-2">邀请码</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="输入邀请码（如 FREE2025）"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={handlePay}
              disabled={processing}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              验证并解锁
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <div className="text-slate-400 text-xs mt-2">若邀请码有效，将直接解锁下载。</div>
        </div>


        <button
          onClick={() => navigate(-1)}
          className="mt-4 ml-3 inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}


