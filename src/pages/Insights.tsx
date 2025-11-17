import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAllInsightReports, InsightReport } from '../data/insightReports';
import InsightReportDetail from '../components/InsightReportDetail';

export default function Insights() {
  const [selectedReport, setSelectedReport] = useState<InsightReport | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);

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
    return `${y}年${m}月`;
  };

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
          独家洞察报告
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          深度行业洞察、专业分析报告，助您把握全球商业趋势
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
                  <img 
                    src={insight.coverImage} 
                    alt={insight.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1">
                    {insight.industry}
                  </span>
                  <span className="text-sm text-gray-400">
                    {insight.pages}页
                  </span>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3 leading-tight">
                  {insight.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {insight.summary}
                </p>
                
                <div className="flex items-center justify-between">
                    <time className="text-sm text-gray-500">
                      {formatDate(insight.date)}
                    </time>
                  <button 
                    onClick={() => handleReportClick(insight)}
                    className="text-gray-900 hover:text-gray-600 transition-colors duration-300 font-medium"
                  >
                    阅读更多 →
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
            订阅我们的洞察报告
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="输入您的邮箱地址"
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
                  const endpoints = ['/api/subscribe', 'http://localhost:3001/api/subscribe', 'http://localhost:3002/api/subscribe'];
                  let ok = false;
                  for (const ep of endpoints) {
                    try {
                      const resp = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, category }) });
                      if (resp.ok) { ok = true; break; }
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
              订阅
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
