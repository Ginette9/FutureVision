import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiPost, apiGet } from "@/lib/utils";

export default function Pay() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"alipay" | "wechat" | "card">("alipay");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string>("");
  const [codeUrl, setCodeUrl] = useState<string>("");
  const [payUrl, setPayUrl] = useState<string>("");
  const [autoOpened, setAutoOpened] = useState(false);

  const returnTo = useMemo(() => {
    const from = params.get("from");
    return from && from.startsWith("/") ? from : "/report";
  }, [params]);

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
      // 调用后端创建订单（含邀请码快捷通过）
      const resp = await apiPost<{
        paid: boolean;
        orderId?: string;
        method?: string;
        amount?: number;
        subject?: string;
        payUrl?: string;
        codeUrl?: string;
      }>("/api/pay/create", { method, amount: 29, subject: "ESG Report", inviteCode });

      if (resp.paid) {
        window.localStorage.setItem("hasPaid", "1");
        navigate(returnTo, { replace: true });
        return;
      }

      if (resp.orderId) setOrderId(resp.orderId);
      if (resp.codeUrl) setCodeUrl(resp.codeUrl);
      if (resp.payUrl) setPayUrl(resp.payUrl);
    } finally {
      setProcessing(false);
    }
  }, [processing, navigate, returnTo, inviteCode, method]);

  // 轮询订单
  useEffect(() => {
    if (!orderId) return;
    let timer: number | undefined;
    let cancelled = false;

    const poll = async () => {
      try {
        const r = await apiGet<{ orderId: string; status: 'pending' | 'success' | 'failed' }>("/api/pay/query", { orderId });
        if (cancelled) return;
        if (r.status === 'success') {
          window.localStorage.setItem("hasPaid", "1");
          navigate(returnTo, { replace: true });
          return;
        }
      } catch (e) {
        // 忽略网络错误，继续重试
      }
      timer = window.setTimeout(poll, 1500);
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId, navigate, returnTo]);

  // 自动打开 H5 支付链接（若有）
  useEffect(() => {
    if (payUrl && !autoOpened) {
      setAutoOpened(true);
      try {
        window.open(payUrl, '_blank', 'noopener,noreferrer');
      } catch {}
    }
  }, [payUrl, autoOpened]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">下载报告需要支付</h1>
      <p className="text-slate-600 mb-8">完成支付后将自动返回并开始生成 PDF。</p>

      <div className="rounded-lg border border-slate-200 p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-900 font-semibold mb-1">ESG 风险分析报告</div>
            <div className="text-slate-500 text-sm">一次性购买，含封面、目录、分析、免责声明与联系页</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-violet-700">¥ 29</div>
            <div className="text-slate-400 text-xs">含税价</div>
          </div>
        </div>

        {/* 支付方式选择 */}
        <div className="mt-8">
          <div className="text-slate-800 font-medium mb-3">选择支付方式</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMethod("alipay")}
              className={`w-full rounded-md border px-4 py-3 text-sm font-semibold transition ${method === "alipay" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              支付宝
            </button>
            <button
              type="button"
              onClick={() => setMethod("wechat")}
              className={`w-full rounded-md border px-4 py-3 text-sm font-semibold transition ${method === "wechat" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              微信
            </button>
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`w-full rounded-md border px-4 py-3 text-sm font-semibold transition ${method === "card" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              银行卡
            </button>
          </div>
          <div className="text-slate-500 text-xs mt-2">当前选择：{method === "alipay" ? "支付宝" : method === "wechat" ? "微信" : "银行卡"}</div>
        </div>

        {/* 邀请码输入区 */}
        <div className="mt-8">
          <label className="block text-slate-800 font-medium mb-2">邀请码（可选）</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="输入临时邀请码（如 FREE2025）"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={handlePay}
              disabled={processing}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              使用邀请码
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <div className="text-slate-400 text-xs mt-2">若邀请码有效，将直接解锁下载，无需支付。</div>
        </div>

        <button
          onClick={handlePay}
          disabled={processing}
          className="mt-8 inline-flex items-center justify-center rounded-md bg-violet-600 px-5 py-2.5 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {processing ? "正在创建订单…" : `使用${method === "alipay" ? "支付宝" : method === "wechat" ? "微信" : "银行卡"}支付并下载`}
        </button>

        {/* H5 跳转链接与二维码占位 */}
        {(payUrl || codeUrl) && (
          <div className="mt-6 rounded-md border border-slate-200 p-4 bg-slate-50">
            {payUrl && (
              <div className="text-sm text-slate-700">
                H5 支付链接：
                <a className="text-violet-700 underline break-all" href={payUrl} target="_blank" rel="noreferrer">{payUrl}</a>
              </div>
            )}
            {codeUrl && (
              <div className="text-sm text-slate-700 mt-3">
                扫码支付（将该链接用于二维码生成器或调起 App）：
                <div className="mt-1 break-all text-slate-600">{codeUrl}</div>
              </div>
            )}
            {orderId && (
              <div className="text-xs text-slate-500 mt-3">订单号：{orderId}（我们已开始轮询支付结果）</div>
            )}
          </div>
        )}

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


