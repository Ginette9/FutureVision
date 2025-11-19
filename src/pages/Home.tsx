import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ContactModal from '../components/ContactModal';
import InsightReportDetail from '../components/InsightReportDetail';
import { getAllInsightReports, InsightReport } from '../data/insightReports';
import graphGlobal from '../images/graph-global.png';
import graphListed from '../images/graph-listed.png';
import graphSme from '../images/graph-sme.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// @ts-ignore
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl as any;

export default function NewHome() {
  const [isVisible, setIsVisible] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InsightReport | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);
  const [renderCache, setRenderCache] = useState<Record<string, string>>({});
  const [renderingState, setRenderingState] = useState<Record<string, 'loading' | 'error' | 'complete'>>({});
  const { language } = useLanguage();

  const labels = {
    heroTitleMain: language === 'en-US' ? 'Global ESG Conflict Risk Management' : language === 'zh-HK' ? '企業全球環境與社會' : '企业全球环境与社会',
    heroTitleSub: language === 'en-US' ? 'for Enterprises' : language === 'zh-HK' ? '衝突風險管理' : '冲突风险管理',
    heroDesc: language === 'en-US' ? 'Provide comprehensive ESG risk assessment, early warning, and localized management for Chinese enterprises going global, helping avoid ESG conflict events and major financial and reputational losses.' : language === 'zh-HK' ? '為中企出海提供全球ESG風險全面評估、監控預警與在地化管理，幫助企業規避ESG衝突事件，避免重大財務與聲譽損失。' : '为中企出海提供全球ESG风险全面评估、监控预警与在地化管理，帮助企业规避ESG冲突事件，避免重大财务和声誉损失。',
    heroBtn: language === 'en-US' ? 'Learn More' : language === 'zh-HK' ? '了解服務' : '了解服务',
    focusTitle: language === 'en-US' ? 'Our Focus Areas' : language === 'zh-HK' ? '我們的專注領域' : '我们的专注领域',
    focusDesc: language === 'en-US' ? 'Integrate sustainability, consulting methodologies and AI to unlock global growth opportunities' : language === 'zh-HK' ? '融合可持續理念、管理諮詢方法與AI技術，為更多企業解鎖全球增長機會' : '融合可持续发展理念、管理咨询方法与AI技术，为更多企业解锁全球增长机会',
    learnMore: language === 'en-US' ? 'Learn More' : language === 'zh-HK' ? '了解更多' : '了解更多',
    insightsTitle: language === 'en-US' ? 'Exclusive Insights' : language === 'zh-HK' ? '獨家洞察' : '独家洞察',
    insightsDesc: language === 'en-US' ? 'Exclusive data and sustainability perspective reveal future growth opportunities and risks' : language === 'zh-HK' ? '獨家數據與可持續視角分析方法，洞悉未來商業增長機遇及風險' : '独家数据+可持续发展视角分析方法，洞悉未来商业增长机遇及风险',
    readMore: language === 'en-US' ? 'Read More' : language === 'zh-HK' ? '閱讀更多' : '阅读更多',
    knowledgeTitle: language === 'en-US' ? 'Knowledge Center' : language === 'zh-HK' ? '知識中心' : '知识中心',
    knowledgeDesc: language === 'en-US' ? 'A real-time platform aggregating global updates and intelligence' : language === 'zh-HK' ? '實時監控，匯聚全球最新資訊與情報的集成平台' : '实时监控，汇聚全球最新资讯与情报的集成资料平台',
    knowledgeBtn: language === 'en-US' ? 'View Details' : language === 'zh-HK' ? '了解詳情' : '了解详情',
    casesTitle: language === 'en-US' ? 'Cases' : '成功案例',
    casesDesc: language === 'en-US' ? 'Over the past decades, we have helped many enterprises navigate globalization and growth challenges successfully' : language === 'zh-HK' ? '在過去的數十年中，我們幫助眾多企業成功應對全球化與增長挑戰' : '在过去的数十年中，\n我们帮助众多企业成功应对全球化和增长挑战',
    membershipTitle: language === 'en-US' ? 'Member Portal' : language === 'zh-HK' ? '會員門戶' : '会员门户',
    membershipDesc: language === 'en-US' ? 'Exclusive resources and services for Future Vision members' : language === 'zh-HK' ? 'Future Vision 會員專屬資源與服務' : 'Future Vision会员专属资源与服务',
    membershipBtn: language === 'en-US' ? 'Member Portal' : language === 'zh-HK' ? '會員入口' : '会员入口',
    ctaTitle: language === 'en-US' ? 'Ready to start your global growth journey?' : language === 'zh-HK' ? '準備開始您的全球化增長之旅？' : '准备开始您的全球化增长之旅？',
    ctaDesc: language === 'en-US' ? 'Let our expert team provide tailored solutions to support sustainable development' : language === 'zh-HK' ? '讓我們的專業團隊為您提供定制解決方案，助力企業可持續發展' : '让我们的专业团队为您提供定制解决方案，助力企业可持续发展'
  };

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
  };

  const handleReportClick = (report: InsightReport) => {
    setSelectedReport(report);
    setIsReportDetailOpen(true);
  };

  const handleCloseReportDetail = () => {
    setIsReportDetailOpen(false);
    setSelectedReport(null);
  };

  // PDF封面渲染函数
  const renderCoverPage = useCallback(async (report: InsightReport): Promise<string | null> => {
    console.log(`renderCoverPage called for report: ${report.id}, pdfUrl: ${report.pdfUrl}`);
    if (!report.pdfUrl) {
      console.log(`No PDF URL for report: ${report.id}`);
      return null;
    }
    
    const coverPage = report.coverPage || 1;
    const cacheKey = `${report.id}-${coverPage}`;
    
    if (renderCache[cacheKey]) {
      console.log(`Cache hit for report: ${report.id}, returning cached image`);
      return renderCache[cacheKey];
    }
    
    // 设置加载状态
    setRenderingState(prev => ({ ...prev, [cacheKey]: 'loading' }));
    console.log(`Cache miss for report: ${report.id}, starting PDF rendering...`);
    
    try {
      const url = report.pdfUrl;
      console.log(`Loading PDF from URL: ${url}`);
      const loadingTask = getDocument({ url });
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully, numPages: ${pdf.numPages}`);
      const page = await pdf.getPage(coverPage);
      console.log(`Page ${coverPage} loaded successfully`);
      
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
      
      console.log(`Rendering page ${coverPage} to canvas...`);
      await page.render({ canvasContext: ctx, viewport }).promise;
      console.log(`Page rendered successfully`);
      
      const dataUrl = canvas.toDataURL('image/png');
      console.log(`Canvas converted to data URL, length: ${dataUrl.length}`);
      setRenderCache(prev => ({ ...prev, [cacheKey]: dataUrl }));
      setRenderingState(prev => ({ ...prev, [cacheKey]: 'complete' }));
      console.log(`Cache updated for report: ${report.id}`);
      return dataUrl;
    } catch (e) {
      console.error(`Failed to render cover page for report ${report.id}:`, e);
      setRenderingState(prev => ({ ...prev, [cacheKey]: 'error' }));
      return null;
    }
  }, [renderCache]);

  // 添加滚动动画效果
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 独家洞察数据 - 使用新的数据结构
  // 首页展示顺序与管理页一致：直接按数组顺序取前3个
  const [insights, setInsights] = useState<InsightReport[]>(getAllInsightReports().slice(0, 3));

  // 核心服务数据
  const coreServices = [
    {
      id: 1,
      title: language === 'en-US' ? 'Multinational Enterprises' : language === 'zh-HK' ? '跨國企業' : '跨国企业',
      subtitle: language === 'en-US' ? 'Global ESG Risk Management' : language === 'zh-HK' ? '全球化運營ESG風險管理' : '全球化运营ESG风险管理',
      description: language === 'en-US' ? 'Help global enterprises identify, prevent and resolve environmental, social and governance risks in global markets, build safe, stable and sustainable supply chains and operational systems, ensuring regulatory compliance and long-term growth certainty.' : language === 'zh-HK' ? '幫助出海企業識別、預防和解決全球市場的環境、社會與治理風險，構建安全、穩健、可持續的供應鏈與運營體系，獲得監管安全與長期增長的確定性。' : '帮助出海企业识别、预防和解决全球市场的环境、社会与治理风险，构建安全、稳健、可持续的供应链与运营体系，获得监管安全与长期增长的确定性。',
      image: graphGlobal,
      link: '/services'
    },
    {
      id: 2,
      title: language === 'en-US' ? 'Listed Companies' : language === 'zh-HK' ? '上市公司' : '上市公司',
      subtitle: language === 'en-US' ? 'Sustainable Growth Strategy & ESG Rating Improvement' : language === 'zh-HK' ? '可持續增長戰略與ESG評級提升' : '可持续增长战略与ESG评级提升',
      description: language === 'en-US' ? 'By building sustainable growth strategies and upgrading ESG governance systems, enhance listed companies steady growth capabilities and long-term valuation resilience, improving market trust and brand premium.' : language === 'zh-HK' ? '通過構建可持續增長戰略、升級ESG治理體系，提升上市公司穩健增長能力與長期估值韌性，提升市場信任與品牌溢價。' : '通过构建可持续增长战略、升级ESG治理体系，提升上市公司稳健增长能力与长期估值韧性，提升市场信任与品牌溢价。',
      image: graphListed,
      link: '/services'
    },
    {
      id: 3,
      title: language === 'en-US' ? 'SMEs' : language === 'zh-HK' ? '中小企業' : '中小企业',
      subtitle: language === 'en-US' ? 'Simple & Feasible Product Globalization Strategy' : language === 'zh-HK' ? '簡便可行的產品出海策略' : '简便可行的产品出海策略',
      description: language === 'en-US' ? 'Help SMEs extract sustainable value from products and services to form differentiated competitiveness for global expansion, provide overseas channel establishment and sales agency services, significantly improving globalization success rate and profit margins.' : language === 'zh-HK' ? '幫助中小企業提煉產品及服務的可持續價值並形成出海差異化競爭力，提供海外渠道落地與代理銷售服務，顯著提升出海成功率與利潤空間。' : '帮助中小企业提炼产品及服务的可持续价值并形成出海差异化竞争力，提供海外渠道落地与代理销售服务，显著提升出海成功率与利润空间。',
      image: graphSme,
      link: '/services'
    }
  ];

  // 专家资源数据
  const expertResources = [
    {
      id: 1,
      title: language === 'en-US' ? 'Global News' : language === 'zh-HK' ? '全球要聞' : '全球要闻',
      description: language === 'en-US' ? 'Latest global sustainable development updates' : language === 'zh-HK' ? '全球最新可持續發展動態' : '全球最新可持续发展动态',
      link: '/knowledge'
    },
    {
      id: 2,
      title: language === 'en-US' ? 'Must-Read Reports' : language === 'zh-HK' ? '必讀報告' : '必读报告',
      description: language === 'en-US' ? 'Latest major reports in global sustainable development' : language === 'zh-HK' ? '全球可持續發展領域最新重磅報告' : '全球可持续发展领域最新重磅报告',
      link: '/knowledge'
    },
    {
      id: 3,
      title: language === 'en-US' ? 'Course Resources' : language === 'zh-HK' ? '課程資源' : '课程资源',
      description: language === 'en-US' ? 'Latest courses, tools and guidelines in sustainable development' : language === 'zh-HK' ? '可持續發展領域最新課程、工具與指引' : '可持续发展领域最新课程、工具与指引',
      link: '/knowledge'
    }
  ];

  // 监听数据层更新事件，自动刷新首页展示
  useEffect(() => {
    const handler = () => setInsights(getAllInsightReports().slice(0, 3));
    window.addEventListener('insights-store-updated', handler);
    return () => window.removeEventListener('insights-store-updated', handler);
  }, []);

  // 添加PDF封面渲染触发机制
  useEffect(() => {
    (async () => {
      console.log('Home page PDF rendering triggered for insights:', insights.length);
      // 遍历首页展示的报告，渲染封面页
      for (const insight of insights) {
        const cacheKey = `${insight.id}-${insight.coverPage || 1}`;
        console.log(`Checking insight: ${insight.id}, hasPdfUrl: ${!!insight.pdfUrl}, inCache: ${!!renderCache[cacheKey]}`);
        if (insight.pdfUrl && !renderCache[cacheKey]) {
          console.log(`Rendering cover page for: ${insight.id}`);
          const result = await renderCoverPage(insight);
          console.log(`Render result for ${insight.id}:`, result ? 'Success' : 'Failed');
        }
      }
      
      // 调试用：显示当前缓存状态
      console.log('Current renderCache keys:', Object.keys(renderCache));
      console.log('First few insights data:', insights.map(i => ({id: i.id, title: i.title, pdfUrl: i.pdfUrl, coverPage: i.coverPage})));
    })();
  }, [insights]);



  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    if (language === 'en-US') return `${y}-${m}`;
    if (language === 'zh-HK') return `${y}年${m}月`;
    return `${y}年${m}月`;
  };

  // 调试用：手动测试PDF渲染
  const testPdfRendering = async () => {
    console.log('Manual PDF rendering test started');
    if (insights.length > 0) {
      const testInsight = insights[0];
      console.log('Testing with first insight:', testInsight.id, testInsight.title);
      const result = await renderCoverPage(testInsight);
      console.log('PDF rendering result:', result ? 'Success' : 'Failed');
      if (result) {
        alert('PDF渲染成功！数据URL长度: ' + result.length);
      } else {
        alert('PDF渲染失败，请查看控制台');
      }
    }
  };

  // 调试用：显示缓存状态
  const getCacheDebugInfo = () => {
    const cacheKeys = Object.keys(renderCache);
    return {
      cacheKeys,
      cacheSize: cacheKeys.length,
      insightsCount: insights.length,
      firstInsight: insights.length > 0 ? {
        id: insights[0].id,
        title: insights[0].title,
        pdfUrl: insights[0].pdfUrl,
        coverPage: insights[0].coverPage,
        cacheKey: `${insights[0].id}-${insights[0].coverPage || 1}`,
        hasCachedImage: !!renderCache[`${insights[0].id}-${insights[0].coverPage || 1}`]
      } : null
    };
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
                {labels.heroTitleMain}
                <span className="block font-normal text-gray-700 mt-2">{labels.heroTitleSub}</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                {labels.heroDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/esg-voyant/intro"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300"
                >
                  {labels.heroBtn}
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square bg-white-50 rounded-lg overflow-hidden">
                <img
                  src="/images/square_earth.png"
                  alt="ESG咨询服务"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 核心服务 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              {labels.focusTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {labels.focusDesc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
              >
                {/* 图标 + 标题 + 副标题 居中 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-6 flex items-center justify-center bg-gray-50 rounded-lg">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    {service.subtitle}
                  </h4>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
          {/* 整个区块统一“了解更多”按钮 */}
          <div className="text-center mt-12">
            <Link
              to="/services"  // 可替换成你的统一跳转链接
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-300"
            >
              {labels.learnMore}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 独家洞察 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              {labels.insightsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {labels.insightsDesc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-video bg-white-100 overflow-hidden">
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
                          alt={language === 'en-US' ? (insight.titleEn || insight.title) : language === 'zh-HK' ? convertToTraditional(insight.title || '') : insight.title}
                          className="w-full h-full object-contain"
                        />
                      );
                    }
                    
                    // 如果加载失败，显示备用图片
                    if (currentState === 'error') {
                      return (
                        <img
                          src={insight.coverImage || '/images/pdf-cover.png'}
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
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
                  {language === 'en-US' ? (insight.titleEn || insight.title) : language === 'zh-HK' ? convertToTraditional(insight.title || '') : insight.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {language === 'en-US' ? (insight.summaryEn || insight.summary) : language === 'zh-HK' ? convertToTraditional(insight.summary || '') : insight.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(insight.date)}
                    </span>
                    <button
                      onClick={() => handleReportClick(insight)}
                      className="inline-flex items-center text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors duration-300"
                    >
                      {labels.readMore}
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 知识中心 */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        {/* 背景装饰图形（无文本，仅提升层次感） */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-gradient-to-br from-gray-100 to-white blur-3xl opacity-70"></div>
          <div className="absolute top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-white to-gray-100 blur-3xl opacity-70"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              {labels.knowledgeTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {labels.knowledgeDesc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col h-full text-center p-10 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                {/* 图标与装饰条，增强层次但不改变文案 */}
                <div className="mb-8 flex flex-col items-center">
                  <div className="w-10 h-1 bg-gradient-to-r from-gray-400 to-gray-700 rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-0.5">
                    {/* 使用图片资源替换图标：0新闻、1报告、2课程 */}
                    <img
                      src={[
                        '/images/icons/icon-news.png',
                        '/images/icons/icon-report.png',
                        '/images/icons/icon-course.png',
                      ][index]}
                      alt={resource.title}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 tracking-tight">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                  {resource.description}
                </p>
                {/* 卡片底部装饰线，增强精致感 */}
                <div className="mx-auto w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
          {/* 统一“了解详情”按钮 */}
          <div className="mt-12 text-center">
            <Link
              to="/knowledge"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors duration-300 font-medium"
            >
              {labels.knowledgeBtn}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 成功案例（切换为浅色底以与深色页脚区分） */}
      <section className="py-28 bg-white relative overflow-hidden text-gray-900">
        {/* 背景氛围光（浅色） */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gray-100 blur-3xl"></div>
          <div className="absolute top-40 -right-32 w-96 h-96 rounded-full bg-gray-100 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-start gap-12">
            {/* 左侧：标题、副标题、按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:w-5/12"
            >
              <h2 className="text-3xl lg:text-4xl font-light mb-4">{labels.casesTitle}</h2>
              <p className="text-lg text-gray-600 mb-6">
                {labels.casesDesc}
              </p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-gray-400 to-gray-700 rounded-full mb-8"></div>
              <Link
                to="/cases"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors duration-300 font-medium"
              >
                {labels.learnMore}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            {/* 右侧：四项案例数字与描述 */}
            {(() => {
              const caseItems = [
                { 
                  count: '100+', 
                  text: language === 'en-US' 
                    ? 'Foreign enterprises represented by Coca-Cola, P&G, Johnson & Johnson, AB InBev, and L\'Oréal' 
                    : language === 'zh-HK' 
                      ? '以可口可樂、寶潔、強生、百威英博、歐萊雅為代表的外企' 
                      : '以可口可乐、宝洁、强生、百威英博、欧莱雅为代表的外企' 
                },
                { 
                  count: '50+', 
                  text: language === 'en-US' 
                    ? 'State-owned enterprises represented by State Grid, China Welfare Lottery, and China Resources Group' 
                    : language === 'zh-HK' 
                      ? '以國家電網、中國福彩、華潤集團為代表的國企央企' 
                      : '以国家电网、中国福彩、华润集团为代表的国企央企' 
                },
                { 
                  count: '500+', 
                  text: language === 'en-US' 
                    ? 'Private enterprises represented by LONGi, Geely, Sany Heavy Industry, and vivo' 
                    : language === 'zh-HK' 
                      ? '以隆基、吉利、三一重工、vivo為代表的民營企業' 
                      : '以隆基、吉利、三一重工、vivo为代表的民营企业' 
                },
                { 
                  count: '200+', 
                  text: language === 'en-US' 
                    ? 'Unicorn companies represented by Tencent, Alibaba, Kuaishou, and Meituan-Dianping' 
                    : language === 'zh-HK' 
                      ? '以騰訊、阿里巴巴、快手、美團點評為代表的獨角獸企業' 
                      : '以腾讯、阿里巴巴、快手、美团点评为代表的独角兽企业' 
                },
              ];
              return (
                <div className="md:w-7/12 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {caseItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      viewport={{ once: true }}
                      className="group rounded-xl border border-gray-200 bg-white hover:bg-white/95 p-10 shadow-sm hover:shadow-lg transition-all duration-300 min-h-[160px] flex flex-col"
                    >
                      <div className="text-4xl font-semibold tracking-tight mb-6 text-gray-900">{item.count}</div>
                      <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                        {item.text}
                      </p>
                      <div className="mx-auto w-16 h-0.5 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 会员门户（浅灰底 + 左右分栏，镜像成功案例） */}
      <section className="py-28 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-12">
            {/* 左侧：四卡片网格（镜像成功案例右侧） */}
            {(() => {
              const items = [
                {
                  title: language === 'en-US' ? 'Monitor' : language === 'zh-HK' ? '監測' : '监测',
                  top: [
                    language === 'en-US' ? 'Analytic Monitoring' : language === 'zh-HK' ? '分析監測' : '分析监测',
                    language === 'en-US' ? 'Real-time industry data' : language === 'zh-HK' ? '行業數據實時掌控' : '行业数据实时掌控',
                  ],
                  bottom: language === 'en-US' ? 'Sustainability / ESG / Carbon Data' : language === 'zh-HK' ? '可持續發展 / ESG / 碳數據' : '可持续发展 / ESG / 碳数据',
                  icon: (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 18h16" />
                      <path d="M6 15l4-6 3 4 3-5" />
                    </svg>
                  ),
                },
                {
                  title: language === 'en-US' ? 'Intelligence' : language === 'zh-HK' ? '情報' : '情报',
                  top: [
                    language === 'en-US' ? 'Regular Briefings' : language === 'zh-HK' ? '定期情報' : '定期情报',
                    language === 'en-US' ? 'Exclusive intelligence push' : language === 'zh-HK' ? '獨家推送專屬情報' : '独家推送专属情报',
                  ],
                  bottom: language === 'en-US' ? 'News / Policy / Events / Hotspots' : language === 'zh-HK' ? '新聞 / 政策 / 會議 / 熱點' : '新闻 / 政策 / 会议 / 热点',
                  icon: (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 17 L11 8 L16 17 Z" />
                      <path d="M15 17 L19 12 L21 17 Z" />
                    </svg>
                  ),
                },
                {
                  title: language === 'en-US' ? 'Insights' : language === 'zh-HK' ? '洞察' : '洞察',
                  top: [
                    language === 'en-US' ? 'Member Insights' : language === 'zh-HK' ? '會員洞察' : '会员洞察',
                    language === 'en-US' ? 'Multi-perspective deep reports' : language === 'zh-HK' ? '多維視角深度報告' : '多维视角深度报告',
                  ],
                  bottom: language === 'en-US' ? 'Industry / Topics / Functions / Consumers' : language === 'zh-HK' ? '行業 / 議題 / 職能 / 消費者' : '行业 / 议题 / 职能 / 消费者',
                  icon: (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="5" width="14" height="14" rx="2" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  ),
                },
                {
                  title: language === 'en-US' ? 'Links' : language === 'zh-HK' ? '鏈接' : '链接',
                  top: [
                    language === 'en-US' ? 'Key Links' : language === 'zh-HK' ? '關鍵鏈接' : '关键链接',
                    language === 'en-US' ? 'Direct access to scarce resources' : language === 'zh-HK' ? '稀缺資源全面直聯' : '稀缺资源全面直联',
                  ],
                  bottom: language === 'en-US' ? 'Global experts / Scholars / International orgs / Media' : language === 'zh-HK' ? '全球專家 / 學者 / 國際組織 / 媒體平台' : '全球专家 / 学者 / 国际组织 / 媒体平台',
                  icon: (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9.5" cy="12" r="4" />
                      <circle cx="14.5" cy="12" r="4" />
                    </svg>
                  ),
                },
              ];
              return (
                <div className="md:w-7/12 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className="group rounded-xl border border-gray-200 bg-white hover:bg-white/95 shadow-sm hover:shadow-lg transition-all duration-300 p-8 flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-4 text-gray-900">
                        <div className="shrink-0 text-gray-900">{item.icon}</div>
                        <div className="text-2xl font-semibold tracking-tight">{item.title}</div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <p className="text-sm text-gray-800">{item.top[0]}</p>
                        <p className="text-sm text-gray-800">{item.top[1]}</p>
                      </div>
                      <p className="mt-auto text-xs text-gray-600">{item.bottom}</p>
                    </motion.div>
                  ))}
                </div>
              );
            })()}

            {/* 右侧：标题、副标题与按钮（镜像成功案例左侧） */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:w-5/12 text-right"
            >
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">{labels.membershipTitle}</h2>
              <p className="text-lg text-gray-600 mb-6">{labels.membershipDesc}</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-gray-400 to-gray-700 rounded-full mb-8 ml-auto"></div>
              <a
                href="https://mscfv.com/futureVision/"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors duration-300 font-medium block ml-auto"
              >
                {labels.membershipBtn}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-light text-white mb-6">
              {labels.ctaTitle}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {labels.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* 左侧按钮隐藏 */}
              <Link
                to="/esg-voyant/intro"
                className="hidden"
              >
                {language === 'en-US' ? 'Free Risk Assessment' : language === 'zh-HK' ? '免費風險評估' : '免费风险评估'}
              </Link>

              {/* 右侧按钮改成白底样式 */}
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-900 bg-white hover:bg-gray-100 border border-gray-300 transition-colors duration-300"
              >
                {language === 'en-US' ? 'Contact Us' : language === 'zh-HK' ? '聯繫我們' : '联系我们'}
              </button>
            </div>

          </motion.div>
        </div>
      </section>
      
      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

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
