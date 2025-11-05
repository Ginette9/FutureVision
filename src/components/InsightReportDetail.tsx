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
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {report.category}
                    </span>
                    <span className="text-sm text-gray-500">{report.date}</span>
                    <span className="text-sm text-gray-500">{report.readTime}</span>
                  </div>
                  
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {report.title}
                  </h1>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                      <span className="text-sm text-gray-500">价格</span>
                      <p className="font-medium">
                        {report.isPurchasable ? `¥${report.price}` : '免费'}
                      </p>
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

                      {report.keyFindings && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">主要发现</h3>
                          <ul className="space-y-2">
                            {report.keyFindings.map((finding, index) => (
                              <li key={index} className="flex items-start">
                                <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></span>
                                <span className="text-gray-700">{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.methodology && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">研究方法</h3>
                          <p className="text-gray-700 leading-relaxed">{report.methodology}</p>
                        </div>
                      )}

                      {report.targetAudience && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">目标受众</h3>
                          <p className="text-gray-700 leading-relaxed">{report.targetAudience}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'contents' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">目录结构</h3>
                      <div className="space-y-2">
                        {report.tableOfContents.map((item) => (
                          <div key={item.id}>
                            <div className={`flex justify-between items-center py-2 ${
                              item.level === 1 ? 'font-medium' : 'ml-4 text-sm text-gray-600'
                            }`}>
                              <span>{item.title}</span>
                              <span className="text-gray-500">第{item.pageNumber}页</span>
                            </div>
                            {item.children && (
                              <div className="ml-4">
                                {item.children.map((child) => (
                                  <div key={child.id} className="flex justify-between items-center py-1 text-sm text-gray-600">
                                    <span>{child.title}</span>
                                    <span className="text-gray-500">第{child.pageNumber}页</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'samples' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">示例页面</h3>
                      <div className="space-y-4">
                        {report.samplePages.map((page) => (
                          <div key={page.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{page.title}</h4>
                              <span className="text-sm text-gray-500">第{page.pageNumber}页</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{page.content}</p>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                page.type === 'text' ? 'bg-blue-100 text-blue-800' :
                                page.type === 'chart' ? 'bg-green-100 text-green-800' :
                                page.type === 'table' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {page.type === 'text' ? '文本' :
                                 page.type === 'chart' ? '图表' :
                                 page.type === 'table' ? '表格' : '信息图'}
                              </span>
                            </div>
                            {page.imageUrl && (
                              <div className="mt-3">
                                <img
                                  src={page.imageUrl}
                                  alt={page.title}
                                  className="w-full h-32 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {report.isPurchasable ? '完整报告需要购买' : '完整报告免费获取'}
                  </div>
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
                      {report.isPurchasable ? '联系购买' : '获取报告'}
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