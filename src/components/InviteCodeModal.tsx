import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCodeChange: (code: string) => void;
  onContactAdvisor?: () => void;
}

export default function InviteCodeModal({ isOpen, onClose, onSuccess, onCodeChange, onContactAdvisor }: InviteCodeModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { language } = useLanguage();

  const labels = {
    title: language === 'en-US' ? 'Enter Invitation Code' : language === 'zh-HK' ? '輸入邀請碼' : '输入邀请码',
    description: language === 'en-US' ? 'Please enter your invitation code to access the full ESG report generation feature.' : language === 'zh-HK' ? '請輸入您的邀請碼以訪問完整的ESG報告生成功能。' : '请输入您的邀请码以访问完整的ESG报告生成功能。',
    noCode: language === 'en-US' ? 'Don\'t have an invitation code?' : language === 'zh-HK' ? '沒有邀請碼？' : '没有邀请码？',
    contactAdvisor: language === 'en-US' ? 'Contact Advisor' : language === 'zh-HK' ? '聯繫顧問' : '联系顾问',
    codeLabel: language === 'en-US' ? 'Invitation Code *' : language === 'zh-HK' ? '邀請碼 *' : '邀请码 *',
    codePlaceholder: language === 'en-US' ? 'Please enter your invitation code' : language === 'zh-HK' ? '請輸入您的邀請碼' : '请输入您的邀请码',
    verifyButton: language === 'en-US' ? 'Verify & Access' : language === 'zh-HK' ? '驗證並訪問' : '验证并访问',
    verifying: language === 'en-US' ? 'Verifying...' : language === 'zh-HK' ? '驗證中...' : '验证中...',
    success: language === 'en-US' ? 'Verification successful! Redirecting...' : language === 'zh-HK' ? '驗證成功！正在轉跳...' : '验证成功！正在转跳...',
    error: language === 'en-US' ? 'Invalid invitation code. Please try again.' : language === 'zh-HK' ? '無效的邀請碼，請重試。' : '无效的邀请码，请重试。'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setInviteCode(code);
    onCodeChange(code);
    if (verifyStatus === 'error') {
      setVerifyStatus('idle');
      setErrorMessage('');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsVerifying(true);
    setVerifyStatus('idle');

    try {
      let userIp = 'unknown';
      
      // 尝试获取用户IP地址，但失败时不中断流程
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          userIp = ipData.ip;
        }
      } catch (ipError) {
        console.warn('Unable to get user IP, using default:', ipError);
      }

      // 验证邀请码
      const base = (await import('@/lib/utils')).getApiBaseUrl();
      const endpoints = [
        base ? `${base}/api/verify-invite-code` : null,
        '/api/verify-invite-code',
        'http://localhost:3001/api/verify-invite-code',
        'http://localhost:3002/api/verify-invite-code'
      ].filter(Boolean) as string[];

      let verifySuccess = false;
      const trimmedCode = inviteCode.trim().toLowerCase();
      
      // 直接尝试API验证（统一使用后端邀请码系统）
      for (const ep of endpoints) {
        try {
          const response = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: trimmedCode,
              ip: userIp
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid) {
              verifySuccess = true;
              break;
            }
          }
        } catch (error) {
          console.error('Error verifying invite code via API:', error);
        }
      }

      if (verifySuccess) {
        setVerifyStatus('success');
        // 记录邀请码使用
        try {
          const analyticsEndpoints = [
            base ? `${base}/api/admin/analytics` : null,
            '/api/admin/analytics',
            'http://localhost:3001/api/admin/analytics',
              'http://localhost:3002/api/admin/analytics'
            ].filter(Boolean) as string[];
            
            // 移除对analytics.json的记录，因为邀请码信息已经在ESG表单提交时保存到esg-form-leads.json中
        } catch (error) {
          console.error('Error in analytics recording:', error);
        }

        // 3秒后自动关闭弹窗并跳转到表单
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setVerifyStatus('error');
        setErrorMessage(labels.error);
      }
    } catch (error) {
      console.error('Verification process error:', error);
      setVerifyStatus('error');
      setErrorMessage(labels.error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContactAdvisor = () => {
    onClose();
    // 触发联系顾问的回调函数，打开联系模态框
    if (onContactAdvisor) {
      onContactAdvisor();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* 弹窗内容 */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 表单内容 */}
              <div className="p-8">
                <h2 className="text-2xl font-light text-gray-900 mb-4 text-center">
                  {labels.title}
                </h2>

                <p className="text-gray-600 text-center mb-8">
                  {labels.description}
                </p>

                {verifyStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-900 text-center text-sm">
                      {labels.success}
                    </p>
                  </div>
                )}

                {verifyStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-900 text-center text-sm">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-900 mb-2">
                      {labels.codeLabel}
                    </label>
                    <input
                      type="text"
                      id="inviteCode"
                      name="inviteCode"
                      required
                      value={inviteCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder={labels.codePlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || verifyStatus === 'success'}
                    className="w-full bg-gray-900 text-white py-3 px-4 font-medium hover:bg-gray-800 focus:outline-none focus:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isVerifying ? labels.verifying : labels.verifyButton}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-2">
                    {labels.noCode}
                  </p>
                  <button
                    onClick={handleContactAdvisor}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {labels.contactAdvisor}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
