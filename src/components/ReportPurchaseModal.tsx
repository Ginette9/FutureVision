import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { InsightReport } from '../data/insightReports';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';

interface ReportPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: InsightReport;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  message: string;
}

export default function ReportPurchaseModal({ isOpen, onClose, report }: ReportPurchaseModalProps) {
  const { language } = useLanguage();
  
  const getDefaultMessage = () => {
    if (language === 'en-US') {
      return `The report is available for free. I would like to learn more about the interpretation/customization services for "${report.titleEn || report.title}". Please contact me.`;
    } else if (language === 'zh-HK') {
      return `報告可免費獲取。我希望了解《${convertToTraditional(report.title)}》的解讀/定制服務，請聯繫我。`;
    } else {
      return `报告可免费获取。我希望了解《${report.title}》的解读/定制服务，请联系我。`;
    }
  };
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    position: '',
    phone: '',
    message: getDefaultMessage()
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
      // 模拟提交过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 这里应该调用实际的API来发送邮件或保存联系信息
      console.log('Report Contact:', {
        ...formData,
        reportId: report.id,
        reportTitle: report.title
      });
      
      setSubmitStatus('success');
      
      // 3秒后自动关闭弹窗
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
        setFormData({
          name: '',
          email: '',
          company: '',
          position: '',
          phone: '',
          message: getDefaultMessage()
        });
      }, 3000);
      
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSubmitStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {language === 'en-US' ? 'Contact for Interpretation/Customization Services' : language === 'zh-HK' ? '聯繫解讀/定制服務' : '联系解读/定制服务'}
                  </h2>
                  <p className="text-gray-600">
                    {language === 'en-US' ? 'Report available for free download; fill in your information and we will contact you soon' : language === 'zh-HK' ? '報告免費下載；填寫信息，我們將盡快與您取得聯繫' : '报告免费下载；填写信息，我们将尽快与您取得联系'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Report Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">
                  {language === 'en-US' ? (report.titleEn || report.title) : language === 'zh-HK' ? convertToTraditional(report.title || '') : report.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{language === 'en-US' ? 'Industry: ' : language === 'zh-HK' ? '行業：' : '行业：'}</span>
                    {language === 'en-US' ? (report.industryEn || report.industry) : language === 'zh-HK' ? convertToTraditional(report.industry || '') : report.industry}
                  </div>
                  <div>
                    <span className="font-medium">{language === 'en-US' ? 'Pages: ' : language === 'zh-HK' ? '頁數：' : '页数：'}</span>
                    {report.pages}{language === 'en-US' ? ' pages' : language === 'zh-HK' ? '頁' : '页'}
                  </div>
                  <div>
                    <span className="font-medium">{language === 'en-US' ? 'Topic: ' : language === 'zh-HK' ? '議題：' : '议题：'}</span>
                    {language === 'en-US' ? (report.topicEn || report.topic) : language === 'zh-HK' ? convertToTraditional(report.topic || '') : report.topic}
                  </div>
                </div>
                {report.contactInfo && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{language === 'en-US' ? 'Contact:' : language === 'zh-HK' ? '聯繫人：' : '联系人：'}</span>
                      {report.contactInfo.contactPerson} ({report.contactInfo.department})
                    </p>
                  </div>
                )}
              </div>

              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {language === 'en-US' ? 'Submission Successful!' : language === 'zh-HK' ? '提交成功！' : '提交成功！'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'en-US' ? 'We have received your contact information and will contact you within 24 hours.' : language === 'zh-HK' ? '我們已收到您的聯繫信息，將在24小時內與您取得聯繫。' : '我们已收到您的联系信息，将在24小时内与您取得联系。'}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'en-US' ? 'Name *' : language === 'zh-HK' ? '姓名 *' : '姓名 *'}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder={language === 'en-US' ? 'Please enter your name' : language === 'zh-HK' ? '請輸入您的姓名' : '请输入您的姓名'}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'en-US' ? 'Email *' : language === 'zh-HK' ? '郵箱 *' : '邮箱 *'}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder={language === 'en-US' ? 'Please enter your email address' : language === 'zh-HK' ? '請輸入您的郵箱地址' : '请输入您的邮箱地址'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'en-US' ? 'Company *' : language === 'zh-HK' ? '公司名稱 *' : '公司名称 *'}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder={language === 'en-US' ? 'Please enter company name' : language === 'zh-HK' ? '請輸入公司名稱' : '请输入公司名称'}
                      />
                    </div>
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'en-US' ? 'Position *' : language === 'zh-HK' ? '職位 *' : '职位 *'}
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        required
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder={language === 'en-US' ? 'Please enter your position' : language === 'zh-HK' ? '請輸入您的職位' : '请输入您的职位'}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en-US' ? 'Phone *' : language === 'zh-HK' ? '聯繫電話 *' : '联系电话 *'}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder={language === 'en-US' ? 'Please enter your phone number' : language === 'zh-HK' ? '請輸入您的聯繫電話' : '请输入您的联系电话'}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'en-US' ? 'Message *' : language === 'zh-HK' ? '留言 *' : '留言 *'}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                      placeholder={language === 'en-US' ? 'Please describe your requirements or questions in detail...' : language === 'zh-HK' ? '請詳細描述您的需求或問題...' : '请详细描述您的需求或问题...'}
                    />
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">
                        {language === 'en-US' ? 'Submission failed, please try again later or contact us directly.' : language === 'zh-HK' ? '提交失敗，請稍後重試或直接聯繫我們。' : '提交失败，请稍后重试或直接联系我们。'}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
                    >
                      {language === 'en-US' ? 'Cancel' : language === 'zh-HK' ? '取消' : '取消'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSubmitting ? (language === 'en-US' ? 'Submitting...' : language === 'zh-HK' ? '提交中...' : '提交中...') : (language === 'en-US' ? 'Submit' : language === 'zh-HK' ? '提交' : '提交')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}