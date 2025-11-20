import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightReport } from '../data/insightReports';
import ReportPurchaseModal from './ReportPurchaseModal';
import fvLogoUrl from '@/images/future-vision-logo.png';
import { PDFDocument, degrees } from 'pdf-lib';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';
// 使用ESM worker入口以兼容最新版本
// @ts-ignore
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min?url";
GlobalWorkerOptions.disableWorker = true;
GlobalWorkerOptions.workerSrc = pdfWorkerUrl as any;

interface InsightReportDetailProps {
  report: InsightReport;
  isOpen: boolean;
  onClose: () => void;
}

export default function InsightReportDetail({ report, isOpen, onClose }: InsightReportDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contents'>('overview');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [renderCache, setRenderCache] = useState<Record<string, string>>({});
  const [renderingState, setRenderingState] = useState<Record<string, 'loading' | 'error' | 'complete'>>({});
  const { language } = useLanguage();

  const formatYearMonth = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    if (language === 'en-US') return `${y}-${m}`;
    if (language === 'zh-HK') return `${y}年${m}月`;
    return `${y}年${m}月`;
  };

  const handleContactPurchase = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
  };

  const renderPageImage = useCallback(async (pageNum: number): Promise<string | null> => {
    try {
      const url = report.pdfUrl;
      if (!url) return null;
      
      // 设置加载状态
      setRenderingState(prev => ({ ...prev, [String(pageNum)]: 'loading' }));
      
      const loadingTask = getDocument({ url });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      // 提升渲染清晰度：按设备像素比放大
      const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
      const baseScale = 1.0;
      const targetScale = Math.min(3, Math.max(2, dpr * 2));
      const viewport = page.getViewport({ scale: baseScale * targetScale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // 传入 canvas 以符合类型要求
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const dataUrl = canvas.toDataURL('image/png');
      setRenderCache((c) => ({ ...c, [String(pageNum)]: dataUrl }));
      setRenderingState(prev => ({ ...prev, [String(pageNum)]: 'complete' }));
      return dataUrl;
    } catch (e) {
      console.warn('Failed to render PDF page', pageNum, e);
      setRenderingState(prev => ({ ...prev, [String(pageNum)]: 'error' }));
      return null;
    }
  }, [report.pdfUrl]);

  const openWatermarkedPdf = useCallback(async () => {
    try {
      if (!report.pdfUrl) return;
      const resp = await fetch(report.pdfUrl);
      const buf = await resp.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const logoResp = await fetch(fvLogoUrl);
      const logoBuf = await logoResp.arrayBuffer();
      const logo = await pdf.embedPng(logoBuf);
      const pageCount = pdf.getPageCount();
      for (let i = 0; i < pageCount; i++) {
        if (i === 0 || i === pageCount - 1) continue;
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        const dims = logo.scale(1);
        const base = Math.min(width, height) * 0.9;
        const scale = base / Math.min(dims.width, dims.height);
        const scaled = logo.scale(scale);
        const offsetX = 150; // 右移 20
        const offsetY = -100; // 下移 30
        const x = (width - scaled.width) / 2 + offsetX;
        const y = (height - scaled.height) / 2 + offsetY;
        page.drawImage(logo, { x, y, width: scaled.width, height: scaled.height, rotate: degrees(30), opacity: 0.12 });
      }
      const out = await pdf.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      if (report.pdfUrl) window.open(report.pdfUrl, '_blank');
    }
  }, [report.pdfUrl]);

  useEffect(() => {
    (async () => {
      if (!report.pdfUrl) return;
      const coverPg = report.coverPage || 1;
      const firstToc = (report.tocPages && report.tocPages[0]) || coverPg;
      if (!renderCache[String(coverPg)]) await renderPageImage(coverPg);
      if (!renderCache[String(firstToc)]) await renderPageImage(firstToc);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.pdfUrl]);

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
                <div className="aspect-video bg-white-100 overflow-hidden">
                  {(() => {
                    const cacheKey = String(report.coverPage || 1);
                    const cachedImage = renderCache[cacheKey];
                    const currentState = renderingState[cacheKey];
                    
                    // 如果正在加载，显示加载状态
                    if (currentState === 'loading') {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                            <div className="text-sm text-gray-500">加载封面...</div>
                          </div>
                        </div>
                      );
                    }
                    
                    // 如果有缓存图像，显示缓存图像
                    if (cachedImage) {
                      return (
                        <img
                          src={cachedImage}
                          alt={language === 'en-US' ? (report.titleEn || report.title) : language === 'zh-HK' ? convertToTraditional(report.title || '') : report.title}
                          className="w-full h-full object-contain"
                        />
                      );
                    }
                    
                    // 默认情况：显示空白或备用图片
                    return (
                      <div className="w-full h-full bg-gray-50"></div>
                    );
                  })()}
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
                    {language === 'en-US' ? (report.titleEn || report.title) : language === 'zh-HK' ? convertToTraditional(report.title || '') : report.title}
                  </h1>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">{language === 'en-US' ? 'Industry' : language === 'zh-HK' ? '行業' : '行业'}</span>
                      <p className="font-medium">{language === 'en-US' ? (report.industryEn || report.industry) : language === 'zh-HK' ? convertToTraditional(report.industry || '') : report.industry}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{language === 'en-US' ? 'Topic' : language === 'zh-HK' ? '議題' : '议题'}</span>
                      <p className="font-medium">{language === 'en-US' ? (report.topicEn || report.topic) : language === 'zh-HK' ? convertToTraditional(report.topic || '') : report.topic}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{language === 'en-US' ? 'Pages' : language === 'zh-HK' ? '頁數' : '页数'}</span>
                      <p className="font-medium">{report.pages}{language === 'en-US' ? ' pages' : language === 'zh-HK' ? '頁' : '页'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{language === 'en-US' ? 'Source' : language === 'zh-HK' ? '來源' : '来源'}</span>
                      <p className="font-medium">{report.source || (language === 'en-US' ? 'Future Vision Research Institute' : language === 'zh-HK' ? '未來視界研究院' : '未来视界研究院')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{language === 'en-US' ? 'Publish Date' : language === 'zh-HK' ? '發佈時間' : '发布时间'}</span>
                      <p className="font-medium">{formatYearMonth(report.date)}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: language === 'en-US' ? 'Report Overview' : language === 'zh-HK' ? '報告概覽' : '报告概览' },
                      { id: 'contents', label: language === 'en-US' ? 'Table of Contents' : language === 'zh-HK' ? '目錄結構' : '目录结构' }
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
                <div className="max-h-[80vh] overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{language === 'en-US' ? 'Report Summary' : language === 'zh-HK' ? '報告摘要' : '报告摘要'}</h3>
                        {(() => {
                          const summary = language === 'en-US' ? (report.summaryEn || report.summary) : language === 'zh-HK' ? convertToTraditional(report.summary || '') : report.summary;
                          const detailed = language === 'en-US' ? (report.detailedSummaryEn || report.detailedSummary || report.summaryEn || report.summary) : language === 'zh-HK' ? convertToTraditional(report.detailedSummary || '') : report.detailedSummary;
                          const raw = (detailed || summary || '').trim();
                          const parts = raw.includes('\n\n') ? raw.split(/\n{2,}/) : raw.split(/\n/);
                          return (
                            <div className="space-y-3">
                              {parts.filter(Boolean).map((para, idx) => (
                                <p key={idx} className="text-gray-700 leading-relaxed">{para}</p>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {activeTab === 'contents' && (
                    <div>
                      <div className="rounded-lg border bg-gray-50 p-2">
                        {report.pdfUrl ? (
                          <div className="space-y-4">
                            {((report.tocPages && report.tocPages.length > 0) ? report.tocPages : [report.coverPage || 1]).map((p) => (
                              <PdfPreview key={p} page={p} getImage={renderPageImage} cache={renderCache} language={language} />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={report.tocImageUrl}
                            alt={language === 'en-US' ? 'Table of Contents' : language === 'zh-HK' ? '目錄結構' : '目录结构'}
                            className="w-full h-auto object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* 已移除“示例页面”标签：PDF可自由查看，避免冗余 */}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {language === 'en-US' ? 'Report is free to download; for interpretation/customization, please contact us.' : 
                     language === 'zh-HK' ? '報告免費下載；如需解讀/定制，請聯繫我們。' : '报告免费下载；如需解读/定制，请联系我们。'}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      {language === 'en-US' ? 'Close' : language === 'zh-HK' ? '關閉' : '关闭'}
                    </button>
                    {report.pdfUrl && (
                      <button
                        onClick={openWatermarkedPdf}
                        className="px-6 py-2 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors duration-200 rounded"
                      >
                        {language === 'en-US' ? 'View Online' : language === 'zh-HK' ? '在線查看PDF' : '在线查看PDF'}
                      </button>
                    )}
                    <button
                      onClick={handleContactPurchase}
                      className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 rounded"
                    >
                      {language === 'en-US' ? 'Customization Request' : language === 'zh-HK' ? '聯繫解讀/定制' : '联系解读/定制'}
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

function PdfPreview({ page, getImage, cache, language }: { page: number; getImage: (p: number) => Promise<string | null>; cache: Record<string, string>; language: string; }) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    (async () => {
      if (cache[String(page)]) { 
        setUrl(cache[String(page)]); 
        return; 
      }
      setIsLoading(true);
      const u = await getImage(page);
      setUrl(u);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  
  const altText = language === 'en-US' ? `Page ${page}` : language === 'zh-HK' ? `第${page}頁` : `第${page}页`;
  
  if (isLoading) {
    return (
      <div className="w-full h-64 rounded border bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <div className="text-sm text-gray-500">加载页面...</div>
        </div>
      </div>
    );
  }
  
  if (!url) return <div className="w-full h-64 rounded border bg-gray-50" />;
  
  return (
    <img src={url} alt={altText} className="w-full h-auto object-contain rounded border bg-white" />
  );
}
