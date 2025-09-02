import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiPost, apiGet } from "@/lib/utils";
import StripePaymentForm from "../components/StripePaymentForm";
import PayPalPayment from "../components/PayPalPayment";
import BankTransferInfo from "../components/BankTransferInfo";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import CurrencySelector from "../components/CurrencySelector";

export default function Pay() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"paypal" | "stripe" | "banktransfer">("paypal");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string>("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP">("USD");
  
  // PayPal相关状态
  const [paypalOrderId, setPaypalOrderId] = useState<string>("");
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string>("");
  
  // Stripe相关状态
  const [stripeClientSecret, setStripeClientSecret] = useState<string>("");
  const [stripePublishableKey, setStripePublishableKey] = useState<string>("");
  
  // 银行转账信息
  const [bankInfo, setBankInfo] = useState<any>(null);

  const returnTo = useMemo(() => {
    const from = params.get("from");
    return from && from.startsWith("/") ? from : "/report";
  }, [params]);

  // 货币汇率（简化版本，实际应用中应该从API获取实时汇率）
  const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73
  };

  const getPrice = (basePriceUSD: number) => {
    return (basePriceUSD * exchangeRates[currency]).toFixed(2);
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      default: return "$";
    }
  };

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
        currency?: string;
        paypalOrderId?: string;
        approvalUrl?: string;
        payUrl?: string;
        stripeClientSecret?: string;
        stripePublishableKey?: string;
        bankInfo?: any;
      }>("/api/pay/create", { method, amount: 29, subject: "ESG Report", inviteCode, currency });

      if (resp.paid) {
        window.localStorage.setItem("hasPaid", "1");
        navigate(returnTo, { replace: true });
        return;
      }

      if (resp.orderId) {
        setOrderId(resp.orderId);
        // 保存订单ID到localStorage，供PayPal回调使用
        localStorage.setItem('currentOrderId', resp.orderId);
      }
      
      if (method === 'paypal' && resp.paypalOrderId) {
        setPaypalOrderId(resp.paypalOrderId);
        setPaypalApprovalUrl(resp.approvalUrl || '');
        
        // 显示PayPal支付按钮，让用户主动点击
        // 这样可以避免弹窗被浏览器阻止
      } else if (method === 'stripe' && resp.stripeClientSecret) {
        setStripeClientSecret(resp.stripeClientSecret);
        setStripePublishableKey(resp.stripePublishableKey || '');
      } else if (method === 'banktransfer' && resp.bankInfo) {
        setBankInfo(resp.bankInfo);
      }
    } catch (e: any) {
      setError(e.message || '创建订单失败');
    } finally {
      setProcessing(false);
    }
  }, [processing, navigate, returnTo, inviteCode, method, currency]);

  // 处理PayPal支付成功回调
  const handlePayPalSuccess = useCallback(async () => {
    if (!paypalOrderId || !orderId) return;
    
    try {
      const response = await apiPost<{ success: boolean; status: string; captureId?: string }>('/api/pay/paypal/capture', {
        paypalOrderId,
        orderId
      });
      
      if (response.success) {
        window.localStorage.setItem("hasPaid", "1");
        navigate(returnTo, { replace: true });
      }
    } catch (error) {
      console.error('PayPal capture failed:', error);
      setError('PayPal支付验证失败，请联系客服');
    }
  }, [paypalOrderId, orderId, navigate, returnTo]);

  // 轮询订单状态
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
      timer = window.setTimeout(poll, 2000);
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId, navigate, returnTo]);

  // 监听PayPal支付成功回调
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'PAYPAL_SUCCESS') {
        handlePayPalSuccess();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handlePayPalSuccess]);

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
            <div className="text-2xl font-bold text-violet-700">{getCurrencySymbol(currency)} {getPrice(29)}</div>
            <div className="text-slate-400 text-xs">含税价</div>
          </div>
        </div>

        {/* 货币选择器 */}
        <div className="mt-6">
          <CurrencySelector
            selectedCurrency={currency}
            onCurrencyChange={setCurrency}
            basePriceUSD={29}
          />
        </div>

        {/* 支付方式选择 */}
        <div className="mt-8">
          <PaymentMethodSelector
            selectedMethod={method}
            onMethodChange={setMethod}
          />
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
          {processing ? "正在创建订单…" : `使用${method === "paypal" ? "PayPal" : method === "stripe" ? "信用卡" : "银行转账"}支付并下载`}
        </button>

        {/* 支付状态显示 */}
        {orderId && (
          <div className="mt-6 rounded-md border border-slate-200 p-4 bg-slate-50">
            <div className="text-sm text-slate-700">
              <div className="font-medium mb-2">订单信息</div>
              <div>订单号：{orderId}</div>
              <div>支付方式：{method === "paypal" ? "PayPal" : method === "stripe" ? "信用卡" : "银行转账"}</div>
              <div>金额：{getCurrencySymbol(currency)} {getPrice(29)}</div>
              
              {method === 'paypal' && paypalApprovalUrl && (
                <div className="mt-3">
                  <PayPalPayment
                    approvalUrl={paypalApprovalUrl}
                    orderId={orderId}
                    amount={Number(getPrice(29))}
                    currency={currency}
                    onSuccess={() => {
                      // PayPal支付成功后的处理
                      window.localStorage.setItem("hasPaid", "1");
                      navigate(returnTo, { replace: true });
                    }}
                    onError={(error) => setError(error)}
                  />
                </div>
              )}
              
              {method === 'stripe' && stripeClientSecret && (
                <div className="mt-3">
                  <div className="text-violet-700 font-medium">信用卡支付</div>
                  <StripePaymentForm
                    clientSecret={stripeClientSecret}
                    publishableKey={stripePublishableKey}
                    amount={Number(getPrice(29))}
                    currency={currency}
                    onSuccess={() => {
                      // Stripe支付成功后的处理
                      window.localStorage.setItem("hasPaid", "1");
                      navigate(returnTo, { replace: true });
                    }}
                    onError={(error: string) => setError(error)}
                  />
                </div>
              )}
              
              {method === 'banktransfer' && bankInfo && (
                <div className="mt-3">
                  <BankTransferInfo
                    bankInfo={bankInfo}
                    amount={Number(getPrice(29))}
                    currency={currency}
                    orderId={orderId}
                  />
                </div>
              )}
              
              <div className="text-xs text-slate-500 mt-3">
                我们正在监控支付状态，支付成功后将自动跳转
              </div>
            </div>
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


