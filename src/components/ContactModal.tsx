import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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
                  联系我们
                </h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-gray-900 text-center text-sm">
                      感谢您的咨询！我们会尽快与您联系。
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                    <p className="text-gray-900 text-center text-sm">
                      提交失败，请稍后重试或直接联系我们。
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                      姓名 *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder="请输入您的姓名"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      邮箱 *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder="请输入您的邮箱"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-900 mb-2">
                      公司
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder="请输入您的公司名称"
                    />
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-2">
                      职位
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder="请输入您的职位"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                      手机号码
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors"
                      placeholder="请输入您的电话号码"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                      需求描述 *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:border-gray-900 focus:outline-none transition-colors resize-none"
                      placeholder="请详细描述您的需求..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success'}
                    className="w-full bg-gray-900 text-white py-3 px-4 font-medium hover:bg-gray-800 focus:outline-none focus:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isSubmitting ? '提交中...' : submitStatus === 'success' ? '提交成功' : '提交咨询'}
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