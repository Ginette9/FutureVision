import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  message: string;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    position: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { language } = useLanguage();
  const labels = {
    title: language === 'en-US' ? 'Contact Us' : language === 'zh-HK' ? '聯繫我們' : '联系我们',
    success: language === 'en-US' ? 'Thanks for your inquiry! We will contact you shortly.' : language === 'zh-HK' ? '感謝您的諮詢！我們會盡快與您聯繫。' : '感谢您的咨询！我们会尽快与您联系。',
    error: language === 'en-US' ? 'Submission failed. Please try again or contact us directly.' : language === 'zh-HK' ? '提交失敗，請稍後重試或直接聯繫我們。' : '提交失败，请稍后重试或直接联系我们。',
    name: language === 'en-US' ? 'Name *' : language === 'zh-HK' ? '姓名 *' : '姓名 *',
    email: language === 'en-US' ? 'Email *' : language === 'zh-HK' ? '郵箱 *' : '邮箱 *',
    company: language === 'en-US' ? 'Company *' : language === 'zh-HK' ? '公司 *' : '公司 *',
    position: language === 'en-US' ? 'Position *' : language === 'zh-HK' ? '職位 *' : '职位 *',
    phone: language === 'en-US' ? 'Phone *' : language === 'zh-HK' ? '手機號碼 *' : '手机号码 *',
    message: language === 'en-US' ? 'Requirement Description *' : language === 'zh-HK' ? '需求描述 *' : '需求描述 *',
    phName: language === 'en-US' ? 'Please enter your name' : language === 'zh-HK' ? '請輸入您的姓名' : '请输入您的姓名',
    phEmail: language === 'en-US' ? 'Enter your email' : language === 'zh-HK' ? '請輸入您的郵箱' : '请输入您的邮箱',
    phCompany: language === 'en-US' ? 'Please enter your company name' : language === 'zh-HK' ? '請輸入您的公司名稱' : '请输入您的公司名称',
    phPosition: language === 'en-US' ? 'Please enter your position' : language === 'zh-HK' ? '請輸入您的職位' : '请输入您的职位',
    phPhone: language === 'en-US' ? 'Please enter your phone number' : language === 'zh-HK' ? '請輸入您的電話號碼' : '请输入您的电话号码',
    phMessage: language === 'en-US' ? 'Please describe your requirements in detail...' : language === 'zh-HK' ? '請詳細描述您的需求...' : '请详细描述您的需求...',
    submitIdle: language === 'en-US' ? 'Submit Inquiry' : language === 'zh-HK' ? '提交諮詢' : '提交咨询',
    submitting: language === 'en-US' ? 'Submitting...' : language === 'zh-HK' ? '提交中...' : '提交中...',
    submitted: language === 'en-US' ? 'Submitted' : language === 'zh-HK' ? '提交成功' : '提交成功'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 使用Formspree发送邮件 - 需要先在Formspree注册并创建表单
      // 临时使用一个通用的测试端点
      const formData_obj = new FormData();
      formData_obj.append('name', formData.name);
      formData_obj.append('email', formData.email);
      formData_obj.append('company', formData.company);
      formData_obj.append('position', formData.position);
      formData_obj.append('phone', formData.phone);
      formData_obj.append('message', formData.message);
      formData_obj.append('_replyto', formData.email);
      formData_obj.append('_subject', `来自${formData.name}的咨询 - ${formData.company || '未提供公司信息'}`);

      // 使用一个公开的测试表单服务
      const response = await fetch('https://formspree.io/f/xeorwlpd', {
        method: 'POST',
        body: formData_obj,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        try {
          const envEp = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_CONTACT_ENDPOINT) ? String((import.meta as any).env.VITE_CONTACT_ENDPOINT) : null;
          const endpoints = [envEp, '/api/contact', ...(window.location.protocol === 'https:' ? [] : ['http://123.56.247.231:3001/api/contact', 'http://localhost:3001/api/contact', 'http://localhost:3002/api/contact'])].filter(Boolean) as string[];
          for (const ep of endpoints) {
            try {
              const resp2 = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
              if (resp2.ok) break;
              if (resp2.status === 405) {
                const u = new URL(ep, window.location.origin);
                Object.entries(formData).forEach(([k, v]) => u.searchParams.set(k, String(v ?? '')));
                const r3 = await fetch(u.toString(), { method: 'GET' });
                if (r3.ok) break;
              }
            } catch {}
          }
        } catch {}
        setSubmitStatus('success');
        // 重置表单
        setFormData({
          name: '',
          email: '',
          company: '',
          position: '',
          phone: '',
          message: ''
        });
        
        // 3秒后自动关闭弹窗
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 3000);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('发送邮件失败:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
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
                <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">
                  {labels.title}
                </h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-gray-900 text-center text-sm">
                      {labels.success}
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-gray-900 text-center text-sm">
                      {labels.error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                      {labels.name}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder={labels.phName}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      {labels.email}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder={labels.phEmail}
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-900 mb-2">
                      {labels.company}
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder={labels.phCompany}
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-2">
                      {labels.position}
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder={labels.phPosition}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                      {labels.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder={labels.phPhone}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                      {labels.message}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors resize-none"
                      placeholder={labels.phMessage}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success'}
                    className="w-full bg-gray-900 text-white py-3 px-4 font-medium hover:bg-gray-800 focus:outline-none focus:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isSubmitting ? labels.submitting : submitStatus === 'success' ? labels.submitted : labels.submitIdle}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
