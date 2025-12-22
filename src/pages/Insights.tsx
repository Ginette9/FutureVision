import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getAllInsightReports, InsightReport } from '../data/insightReports';
import InsightReportDetail from '../components/InsightReportDetail';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import pdfWorkerRaw from "pdfjs-dist/build/pdf.worker.min?raw";
const __pdfBlob = new Blob([pdfWorkerRaw], { type: 'text/javascript' });
const __pdfWorkerUrl = URL.createObjectURL(__pdfBlob);
GlobalWorkerOptions.workerSrc = __pdfWorkerUrl as string;
import { getBackendBase, getApiBaseUrl } from '@/lib/utils';

export default function Insights() {
  const [selectedReport, setSelectedReport] = useState<InsightReport | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);
  const [renderCache, setRenderCache] = useState<Record<string, string>>({});
  const [renderingState, setRenderingState] = useState<Record<string, 'loading' | 'error' | 'complete'>>({});
  const { language } = useLanguage();

  // 获取所有独家洞察报告（状态 + 事件刷新）
  const [insights, setInsights] = useState<InsightReport[]>(getAllInsightReports());

  useEffect(() => {
    const handler = () => setInsights(getAllInsightReports());
    window.addEventListener('insights-store-updated', handler);
    return () => window.removeEventListener('insights-store-updated', handler);
  }, []);

  const handleReportClick = (report: InsightReport) => {
    setSelectedReport(report);
    setIsReportDetailOpen(true);
  };

  const handleCloseReportDetail = () => {
    setIsReportDetailOpen(false);
    setSelectedReport(null);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    if (language === 'en-US') return `${y}-${m}`;
    if (language === 'zh-HK') return `${y}年${m}月`;
    return `${y}年${m}月`;
  };

  const getCoverImageUrl = useCallback((report: InsightReport): string => {
    const cacheKey = `${report.id}-${report.coverPage || 1}`;
    return renderCache[cacheKey] || report.coverImage;
  }, [renderCache]);

  const renderCoverPage = useCallback(async (report: InsightReport): Promise<string | null> => {
    try {
      let url = report.pdfUrl;
      const coverPage = report.coverPage || 1;
      if (!url) return null;
      try {
        const { type, base } = getBackendBase();
        const isExternal = /^https?:\/\//.test(String(url));
        if (isExternal) {
          const proxied = type === 'same-origin' ? `${base}/pdf` : `${base}/proxy/pdf`;
          const u = new URL(proxied, window.location.origin);
          u.searchParams.set('url', String(url));
          url = u.toString();
        }
      } catch {}
      
      const cacheKey = `${report.id}-${coverPage}`;
      if (renderCache[cacheKey]) return renderCache[cacheKey];
      
      // 设置加载状态
      setRenderingState(prev => ({ ...prev, [cacheKey]: 'loading' }));
      
      let pdf: any;
      try {
        const t1 = getDocument({ url });
        pdf = await t1.promise;
      } catch {
        const direct = report.pdfUrl as string;
        const t2 = getDocument({ url: direct });
        pdf = await t2.promise;
      }
      const page = await pdf.getPage(coverPage);
      
      const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
      const baseScale = 1.0;
      const targetScale = Math.min(2, Math.max(1.5, dpr * 1.5));
      const viewport = page.getViewport({ scale: baseScale * targetScale });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      await page.render({ canvasContext: ctx, viewport }).promise;
      
      const dataUrl = canvas.toDataURL('image/png');
      setRenderCache(prev => ({ ...prev, [cacheKey]: dataUrl }));
      setRenderingState(prev => ({ ...prev, [cacheKey]: 'complete' }));
      return dataUrl;
    } catch (e) {
      console.warn('Failed to render cover page for report', report.id, e);
      setRenderingState(prev => ({ ...prev, [`${report.id}-${report.coverPage || 1}`]: 'error' }));
      return null;
    }
  }, [renderCache]);

  const renderPageImage = useCallback(async (report: InsightReport, pageNum: number): Promise<string | null> => {
    try {
      let url = report.pdfUrl;
      if (!url) return null;
      try {
        const { type, base } = getBackendBase();
        const isExternal = /^https?:\/\//.test(String(url));
        if (isExternal) {
          const proxied = type === 'same-origin' ? `${base}/pdf` : `${base}/proxy/pdf`;
          const u = new URL(proxied, window.location.origin);
          u.searchParams.set('url', String(url));
          url = u.toString();
        }
      } catch {}
      let pdf: any;
      try {
        const t1 = getDocument({ url });
        pdf = await t1.promise;
      } catch {
        const direct = report.pdfUrl as string;
        const t2 = getDocument({ url: direct });
        pdf = await t2.promise;
      }
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
      return dataUrl;
    } catch (e) {
      console.warn('Failed to render PDF page', pageNum, e);
      return null;
    }
  }, []);

  // 添加PDF封面渲染触发机制
  useEffect(() => {
    (async () => {
      // 遍历所有报告，渲染封面页
      for (const insight of insights) {
        if (insight.pdfUrl && !renderCache[`${insight.id}-${insight.coverPage || 1}`]) {
          await renderCoverPage(insight);
        }
      }
    })();
  }, [insights]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16"
      >
        <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
          {language === 'en-US' ? 'Exclusive Insight Reports' : language === 'zh-HK' ? '獨家洞察報告' : '独家洞察报告'}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {language === 'en-US' ? 'In-depth industry insights and professional analysis to grasp global business trends' : language === 'zh-HK' ? '深度行業洞察、專業分析報告，助您把握全球商業趨勢' : '深度行业洞察、专业分析报告，助您把握全球商业趋势'}
        </p>
      </motion.div>

      {/* Insights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {insights.map((insight, index) => (
            <motion.article
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 ${
                insight.featured ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {insight.coverImage && (
                <div className="aspect-video bg-white-100 overflow-hidden mt-8">
                  {(() => {
                    const cacheKey = `${insight.id}-${insight.coverPage || 1}`;
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
                          alt={(language === 'en-US' ? (insight.titleEn || insight.title) : language === 'zh-HK' ? convertToTraditional(insight.title || '') : insight.title)}
                          className="w-full h-full object-contain"
                        />
                      );
                    }
                                        
                    // 如果加载失败，显示备用图片
                    if (currentState === 'error') {
                      return (
                        <img
                          src={insight.coverImage}
                          alt={language === 'en-US' ? (insight.titleEn || insight.title) : language === 'zh-HK' ? convertToTraditional(insight.title || '') : insight.title}
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
              )}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1">
                    {(() => {
                      const zh = String(insight.industry || '');
                      if (language === 'en-US') {
                        // 简单行业映射；未知则回退中文
                        const map: Record<string, string> = {
                          '泛行业': 'Cross-Industry'
                        };
                        return map[zh] || zh;
                      }
                      if (language === 'zh-HK') return convertToTraditional(zh);
                      return zh;
                    })()}
                  </span>
                  <span className="text-sm text-gray-400">
                    {insight.pages}{language === 'en-US' ? ' pages' : language === 'zh-HK' ? '頁' : '页'}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3 leading-tight">
                  {language === 'en-US' ? (insight.titleEn || insight.title) : language === 'zh-HK' ? convertToTraditional(insight.title || '') : insight.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {language === 'en-US' ? (insight.summaryEn || insight.summary) : language === 'zh-HK' ? convertToTraditional(insight.summary || '') : insight.summary}
                </p>
                
                <div className="flex items-center justify-between">
                    <time className="text-sm text-gray-500">
                      {formatDate(insight.date)}
                    </time>
                  <button 
                    onClick={() => handleReportClick(insight)}
                    className="text-gray-900 hover:text-gray-600 transition-colors duration-300 font-medium"
                  >
                    {language === 'en-US' ? 'Read More →' : language === 'zh-HK' ? '閱讀更多 →' : '阅读更多 →'}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 p-12"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8">
            {language === 'en-US' ? 'Subscribe to our Insight Reports' : language === 'zh-HK' ? '訂閱我們的洞察報告' : '订阅我们的洞察报告'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder={language === 'en-US' ? 'Enter your email address' : language === 'zh-HK' ? '輸入您的郵箱地址' : '输入您的邮箱地址'}
              className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
              id="insights-subscribe-email"
            />
            <button
              className="px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium"
              onClick={async () => {
                try {
                  const el = document.getElementById('insights-subscribe-email') as HTMLInputElement | null;
                  const email = (el?.value || '').trim();
                  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                  if (!emailOk) { toast('请输入有效邮箱地址'); return; }
                  const category = 'insights';
                  const envEp = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_SUBSCRIBE_ENDPOINT) ? String((import.meta as any).env.VITE_SUBSCRIBE_ENDPOINT) : null;
                  const devLocal = (typeof window !== 'undefined') && /localhost|127\.0\.0\.1|^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname);
                  const base = getApiBaseUrl();
                  const endpoints = [
                    envEp,
                    base ? `${base}/api/subscribe` : null,
                    '/api/subscribe',
                    devLocal ? 'http://localhost:3001/api/subscribe' : null,
                    devLocal ? 'http://localhost:3002/api/subscribe' : null
                  ].filter(Boolean) as string[];
                  let ok = false;
                  for (const ep of endpoints) {
                    try {
                      const resp = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, category }) });
                      if (resp.ok) { ok = true; break; }
                      if (resp.status === 405) {
                        const u = new URL(ep, window.location.origin);
                        u.searchParams.set('email', email);
                        u.searchParams.set('category', category);
                        const r2 = await fetch(u.toString(), { method: 'GET' });
                        if (r2.ok) { ok = true; break; }
                      }
                    } catch {}
                  }
                  if (ok) {
                    toast('订阅成功');
                    if (el) el.value = '';
                  } else {
                    toast('订阅失败，请稍后再试');
                  }
                } catch {
                  toast('订阅失败，请稍后再试');
                }
              }}
            >
              {language === 'en-US' ? 'Subscribe' : language === 'zh-HK' ? '訂閱' : '订阅'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* 报告详情弹窗 */}
      {selectedReport && (
        <InsightReportDetail
          report={selectedReport}
          isOpen={isReportDetailOpen}
          onClose={handleCloseReportDetail}
        />
      )}
    </div>
  );
}
