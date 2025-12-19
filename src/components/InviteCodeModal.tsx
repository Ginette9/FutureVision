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
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { language } = useLanguage();

  const labels = {
    title: language === 'en-US' ? 'Enter Invitation Code' : language === 'zh-HK' ? '輸入邀請碼' : '输入邀请码',
    description: language === 'en-US' ? 'Please enter your invitation code to access the full ESG report generation feature.' : language === 'zh-HK' ? '請輸入您的邀請碼以訪問完整的ESG報告。' : '请输入您的邀请码以访问完整的ESG报告。',
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
                ip: userIp,
                isRouteGuard: false
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
        // 记录邀请码使用功能已移除，因为邀请码信息已经在ESG表单提交时保存到esg-form-leads.json中

        // 显示核销弹窗
        setTimeout(() => {
          setShowRedemptionModal(true);
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
                    <div className="relative">
                      <input
                        type={showCode ? "text" : "password"}
                        id="inviteCode"
                        name="inviteCode"
                        required
                        value={inviteCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors pr-10"
                        placeholder={labels.codePlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="absolute inset-y-0 right-0 px-3 py-2 text-gray-500 hover:text-gray-900 transition-colors"
                        aria-label={showCode ? (language === 'en-US' ? 'Hide code' : language === 'zh-HK' ? '隱藏代碼' : '隐藏代码') : (language === 'en-US' ? 'Show code' : language === 'zh-HK' ? '顯示代碼' : '显示代码')}
                      >
                        {showCode ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        )}
                      </button>
                    </div>
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

          {/* 核销弹窗 */}
          <AnimatePresence>
            {showRedemptionModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* 背景遮罩 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                  onClick={() => setShowRedemptionModal(false)}
                />
                
                {/* 弹窗内容 */}
                <div className="flex min-h-full items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* 关闭按钮 */}
                    <button
                      onClick={() => setShowRedemptionModal(false)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* 核销内容 */}
                    <div className="p-8">
                      {/* 成功图标 */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="flex justify-center mb-6"
                      >
                        <div className="bg-white border-2 border-gray-300 p-3 rounded-full">
                          <svg className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>

                      <h2 className="text-xl font-light text-gray-900 mb-2 text-center">
                        {language === 'en-US' ? 'Invitation Code Redemption' : language === 'zh-HK' ? '邀請碼核銷' : '邀请码核销'}
                      </h2>
                      <p className="text-gray-600 text-center mb-8 text-sm">
                        {language === 'en-US' ? 'Your invitation code has been successfully verified' : language === 'zh-HK' ? '您的邀請碼已成功驗證' : '您的邀请码已成功验证'}
                      </p>

                      {/* 价值信息卡片 */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8"
                      >
                        <div className="flex flex-col items-center text-center">
                          <p className="text-gray-500 text-sm font-medium mb-2">
                            {language === 'en-US' ? 'VALUE' : language === 'zh-HK' ? '價值' : '价值'}
                          </p>
                          <div className="flex items-baseline justify-center space-x-1">
                            <span className="text-3xl font-bold text-gray-900">
                              {language === 'en-US' ? '$' : ''}3,980
                            </span>
                            <span className="text-gray-600 font-medium">
                              {language === 'en-US' ? '' : language === 'zh-HK' ? '元' : '元'}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-4 leading-relaxed">
                            {language === 'en-US' ? 'You can redeem this code for one free ESG report generation.' : language === 'zh-HK' ? '您可使用此邀請碼免費獲得一份ESG報告。' : '您可使用此邀请码免费获得一份ESG报告。'}
                          </p>
                        </div>
                      </motion.div>

                      {/* 确认按钮 */}
                      <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        whileHover={{ backgroundColor: '#1f2937' }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setShowRedemptionModal(false);
                          onSuccess();
                          onClose();
                        }}
                        className="w-full bg-gray-900 text-white py-3 px-4 font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-300"
                      >
                        {language === 'en-US' ? 'Confirm & Access' : language === 'zh-HK' ? '確認並訪問' : '确认并访问'}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
