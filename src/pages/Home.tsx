import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContactModal from '../components/ContactModal';
import graphGlobal from '../images/graph-global.png';
import graphListed from '../images/graph-listed.png';
import graphSme from '../images/graph-sme.png';

export default function NewHome() {
  const [isVisible, setIsVisible] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
      description: '为中企出海提供全球环境、社会与治理全面风险评估、监控预警与在地化管理，帮助企业规避ESG冲突事件，避免重大财务和声誉损失。',
      image: graphGlobal,
      link: '/services'
    },
    {
      id: 2,
      title: '上市公司',
      subtitle: '可持续增长战略与ESG评级提升',
      description: '帮助企业规避供应链风险，从ESG评级提升及践行ESG行动中获得转型机遇并提升社会影响力。',
      image: graphListed,
      link: '/services'
    },
    {
      id: 3,
      title: '中小企业',
      subtitle: '简便可行的产品出海策略',
      description: '帮助中小企业提炼ESG议题成就，获得差异化竞争优势，提高产品出海成功率。',
      image: graphSme,
      link: '/services'
    }
  ];

  // 专家资源数据
  const expertResources = [
    {
      id: 1,
      title: '每周要闻',
      description: '全球最新ESG政策动态、行业资讯',
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
      description: '全球可靠来源公开发布的可持续发展领域最新课程与行业指引',
      link: '/knowledge'
    }
  ];

  // 独家洞察数据
  const insights = [
    {
      id: 1,
      title: '2024年全球ESG监管趋势报告',
      summary: '深度分析全球主要经济体ESG监管政策变化趋势',
      date: '2024-01-20',
      category: '政策解读',
      readTime: '15分钟',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      featured: true
    },
    {
      id: 2,
      title: '中小企业出海ESG合规指南',
      summary: '针对中小企业的实用ESG合规操作手册',
      date: '2024-01-18',
      category: '实操指南',
      readTime: '12分钟',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: '供应链透明度最佳实践',
      summary: '全球领先企业供应链透明度管理案例分析',
      date: '2024-01-15',
      category: '案例研究',
      readTime: '18分钟',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop'
    }
  ];

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
                <span className="block font-normal text-gray-700">冲突风险管理</span>
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
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop"
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
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                  {service.description}
                </p>
                <Link
                  to={service.link}
                  className="inline-flex items-center text-gray-900 hover:text-gray-700 font-medium transition-colors duration-300 mt-auto"
                >
                  了解更多
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            ))}
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
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={insight.image}
                    alt={insight.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {insight.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {insight.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
                    {insight.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {insight.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {insight.date}
                    </span>
                    <Link
                      to="/insights"
                      className="inline-flex items-center text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors duration-300"
                    >
                      阅读更多
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 知识中心 */}
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
                className="flex flex-col h-full text-center p-8 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group"
              >
                {/* 调整图标为黑白灰风格，统一大小 */}
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-all duration-300">
                    {index === 0 && (
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                  {resource.description}
                </p>
                <Link
                  to={resource.link}
                  className="inline-flex items-center justify-center text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors duration-300 mt-auto"
                >
                  了解详情
                  <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            ))}
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
    </div>
  );
}