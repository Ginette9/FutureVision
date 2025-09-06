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

  // 支持邀请码直通 + PayPal

  useEffect(() => {
    const hasPaid = typeof window !== "undefined" && window.localStorage.getItem("hasPaid") === "1";
    if (hasPaid) {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo]);

  // 处理PayPal支付完成后的回调
  useEffect(() => {
    const handlePayPalCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const payerId = urlParams.get('PayerID');
      
      if (token && payerId) {
        const orderId = localStorage.getItem('currentOrderId');
        if (orderId) {
          setProcessing(true);
          try {
            // 调用后端验证支付
            const resp = await apiPost<{ success: boolean }>("/api/pay/paypal/capture", { orderId });
            if (resp.success) {
              window.localStorage.setItem("hasPaid", "1");
              localStorage.removeItem('currentOrderId');
              // 清除URL参数
              window.history.replaceState({}, document.title, window.location.pathname);
              navigate(returnTo, { replace: true });
            } else {
              setError("支付验证失败，请重试");
            }
          } catch (e: any) {
            setError(e.message || '支付验证失败');
          } finally {
            setProcessing(false);
          }
        }
      }
    };

    handlePayPalCallback();
  }, [navigate, returnTo]);

  const handleInvite = useCallback(async () => {
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

  const handlePayPal = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    try {
      setError("");
      const resp = await apiPost<{ paid: boolean; orderId?: string; approvalUrl?: string }>("/api/pay/create", {
        method: 'paypal', amount: 5000, subject: 'ESG Report', currency: 'HKD'
      });
      if (resp.paid) {
        window.localStorage.setItem("hasPaid", "1");
        navigate(returnTo, { replace: true });
        return;
      }
      if (resp.orderId && resp.approvalUrl) {
        localStorage.setItem('currentOrderId', resp.orderId);
        window.location.href = resp.approvalUrl; // 跳转到PayPal授权页
        return;
      }
      setError("创建支付订单失败，请稍后再试");
    } catch (e: any) {
      setError(e.message || '创建订单失败');
    } finally {
      setProcessing(false);
    }
  }, [processing, navigate, returnTo]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">解锁下载</h1>
      <p className="text-slate-600 mb-8">使用有效邀请码，或通过 PayPal 完成支付后导出报告。</p>

      <div className="rounded-lg border border-slate-200 p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-900 font-semibold mb-1">ESG 风险分析报告</div>
            <div className="text-slate-500 text-sm">一次性购买，含封面、目录、分析、免责声明与联系页</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">HK$5,000</div>
            <div className="text-slate-500 text-sm">固定价格</div>
          </div>
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
              onClick={handleInvite}
              disabled={processing}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              验证并解锁
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <div className="text-slate-400 text-xs mt-2">若邀请码有效，将直接解锁下载。</div>
        </div>

        {/* PayPal 支付 */}
        <div className="mt-8">
          <button
            onClick={handlePayPal}
            disabled={processing}
            className="inline-flex items-center justify-center rounded-md bg-violet-600 px-5 py-2.5 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {processing ? "处理中…" : "使用 PayPal 支付 HK$5,000 并解锁"}
          </button>
          <p className="text-xs text-slate-500 mt-2">支付完成后将返回本页并自动解锁下载。</p>
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


