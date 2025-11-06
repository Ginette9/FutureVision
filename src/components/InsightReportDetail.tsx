import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightReport } from '../data/insightReports';
import ReportPurchaseModal from './ReportPurchaseModal';

interface InsightReportDetailProps {
  report: InsightReport;
  isOpen: boolean;
  onClose: () => void;
}

export default function InsightReportDetail({ report, isOpen, onClose }: InsightReportDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contents' | 'samples'>('overview');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const formatYearMonth = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}年${m}月`;
  };

  const handleContactPurchase = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={report.coverImage}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title and Meta */}
                <div className="mb-6">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {report.title}
                  </h1>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">行业</span>
                      <p className="font-medium">{report.industry}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">议题</span>
                      <p className="font-medium">{report.topic}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">页数</span>
                      <p className="font-medium">{report.pages}页</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">来源</span>
                      <p className="font-medium">{report.source || '未来视界研究院'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">发布时间</span>
                      <p className="font-medium">{formatYearMonth(report.date)}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: '报告概览' },
                      { id: 'contents', label: '目录结构' },
                      { id: 'samples', label: '示例页面' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">报告摘要</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {report.detailedSummary || report.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'contents' && (
                    <div>
                      <div className="rounded-lg border bg-gray-50 p-2">
                        <img
                          src={(report as any).tocImageUrl || report.coverImage}
                          alt="目录结构"
                          className="w-full object-contain max-h-96"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'samples' && (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {report.samplePages.filter(p => p.imageUrl).length > 0 ? (
                          report.samplePages.filter(p => p.imageUrl).map((page) => (
                            <img
                              key={page.id}
                              src={page.imageUrl as string}
                              alt={page.title}
                              className="w-full object-cover rounded border max-h-64"
                            />
                          ))
                        ) : (
                          <img
                            src={report.coverImage}
                            alt="示例页面"
                            className="w-full object-contain rounded border max-h-96 bg-gray-50"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">报告免费下载；如需解读/定制，请联系我们。</div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      关闭
                    </button>
                    <button
                      onClick={handleContactPurchase}
                      className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 rounded"
                    >
                      联系解读/定制
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Purchase Modal */}
      <ReportPurchaseModal
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
        report={report}
      />
    </>
  );
}