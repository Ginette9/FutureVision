import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContactModal from '../components/ContactModal';
import InsightReportDetail from '../components/InsightReportDetail';
import { getAllInsightReports, InsightReport } from '../data/insightReports';
import graphGlobal from '../images/graph-global.png';
import graphListed from '../images/graph-listed.png';
import graphSme from '../images/graph-sme.png';

export default function NewHome() {
  const [isVisible, setIsVisible] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InsightReport | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);

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

  // 添加滚动动画效果
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 核心服务数据
  const coreServices = [
    {
      id: 1,
      title: '跨国企业',
      subtitle: '全球化运营ESG风险管理',
      description: '帮助出海企业识别、预防和解决全球市场的环境、社会与治理风险，构建安全、稳健、可持续的供应链与运营体系，获得监管安全与长期增长的确定性。',
      image: graphGlobal,
      link: '/services'
    },
    {
      id: 2,
      title: '上市公司',
      subtitle: '可持续增长战略与ESG评级提升',
      description: '通过构建可持续增长战略、升级ESG治理体系，提升上市公司稳健增长能力与长期估值韧性，提升市场信任与品牌溢价。',
      image: graphListed,
      link: '/services'
    },
    {
      id: 3,
      title: '中小企业',
      subtitle: '简便可行的产品出海策略',
      description: '帮助中小企业提炼产品及服务的可持续价值并形成出海差异化竞争力，提供海外渠道落地与代理销售服务，显著提升出海成功率与利润空间。',
      image: graphSme,
      link: '/services'
    }
  ];

  // 专家资源数据
  const expertResources = [
    {
      id: 1,
      title: '全球要闻',
      description: '全球最新可持续发展动态',
      link: '/knowledge'
    },
    {
      id: 2,
      title: '必读报告',
      description: '全球可持续发展领域最新重磅报告',
      link: '/knowledge'
    },
    {
      id: 3,
      title: '课程资源',
      description: '可持续发展领域最新课程、工具与指引',
      link: '/knowledge'
    }
  ];

  // 独家洞察数据 - 使用新的数据结构
  // 首页展示顺序与管理页一致：直接按数组顺序取前3个
  const [insights, setInsights] = useState<InsightReport[]>(getAllInsightReports().slice(0, 3));

  // 监听数据层更新事件，自动刷新首页展示
  useEffect(() => {
    const handler = () => setInsights(getAllInsightReports().slice(0, 3));
    window.addEventListener('insights-store-updated', handler);
    return () => window.removeEventListener('insights-store-updated', handler);
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}年${m}月`;
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
                企业全球环境与社会
                <span className="block font-normal text-gray-700 mt-2">冲突风险管理</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                为中企出海提供全球ESG风险全面评估、监控预警与在地化管理，帮助企业规避ESG冲突事件，避免重大财务和声誉损失。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/esg-risk-analysis/intro"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300"
                >
                  了解服务
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
              我们的专注领域
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              融合可持续发展理念、管理咨询方法与AI技术，为更多企业解锁全球增长机会
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
              了解更多
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
              独家洞察
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              独家数据+可持续发展视角分析方法，洞悉未来商业增长机遇及风险
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
                  <img
                    src={insight.coverImage}
                    alt={insight.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
                    {insight.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {insight.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(insight.date)}
                    </span>
                    <button
                      onClick={() => handleReportClick(insight)}
                      className="inline-flex items-center text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors duration-300"
                    >
                      阅读更多
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
              知识中心
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              实时监控，汇聚全球最新资讯与情报的集成资料平台
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
              了解详情
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
              <h2 className="text-3xl lg:text-4xl font-light mb-4">成功案例</h2>
              <p className="text-lg text-gray-600 mb-6">
                在过去的数十年中，
                我们帮助众多企业成功应对全球化和增长挑战
              </p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-gray-400 to-gray-700 rounded-full mb-8"></div>
              <Link
                to="/cases"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors duration-300 font-medium"
              >
                了解更多
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            {/* 右侧：四项案例数字与描述 */}
            {(() => {
              const caseItems = [
                { count: '100+', text: '以可口可乐、宝洁、强生、百威英博、欧莱雅为代表的外企' },
                { count: '50+', text: '以国家电网、中国福彩、华润集团为代表的国企央企' },
                { count: '500+', text: '以隆基、吉利、三一重工、vivo为代表的民营企业' },
                { count: '200+', text: '以腾讯、阿里巴巴、快手、美团点评为代表的独角兽企业' },
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
                  en: 'Monitor',
                  top: ['分析监测', '行业数据实时掌控'],
                  bottom: '可持续发展 / ESG / 碳数据',
                  icon: (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 18h16" />
                      <path d="M6 15l4-6 3 4 3-5" />
                    </svg>
                  ),
                },
                {
                  en: 'Intelligence',
                  top: ['定期情报', '独家推送专属情报'],
                  bottom: '新闻 / 政策 / 会议 / 热点',
                  icon: (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 17 L11 8 L16 17 Z" />
                      <path d="M15 17 L19 12 L21 17 Z" />
                    </svg>
                  ),
                },
                {
                  en: 'Insights',
                  top: ['会员洞察', '多维视角深度报告'],
                  bottom: '行业 / 议题 / 职能 / 消费者',
                  icon: (
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="5" width="14" height="14" rx="2" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  ),
                },
                {
                  en: 'Links',
                  top: ['关键链接', '稀缺资源全面直联'],
                  bottom: '全球专家 / 学者 / 国际组织 / 媒体平台',
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
                        <div className="text-2xl font-semibold tracking-tight">{item.en}</div>
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
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">会员门户</h2>
              <p className="text-lg text-gray-600 mb-6">Future Vision会员专属资源与服务</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-gray-400 to-gray-700 rounded-full mb-8 ml-auto"></div>
              <a
                href="https://mscfv.com/futureVision/"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors duration-300 font-medium block ml-auto"
              >
                会员入口
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
              准备开始您的ESG之旅？
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              让我们的专业团队为您提供定制化的ESG解决方案，助力企业可持续发展
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/esg-risk-analysis/intro"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-900 bg-white hover:bg-gray-100 transition-colors duration-300"
              >
                免费风险评估
              </Link>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white border border-gray-600 hover:border-gray-500 transition-colors duration-300"
              >
                联系我们
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