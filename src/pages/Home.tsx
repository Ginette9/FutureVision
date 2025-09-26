import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NewHome() {
  const [isVisible, setIsVisible] = useState(false);

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
      title: 'ESG风险评估',
      description: '全面评估企业ESG风险，提供专业的风险管理建议',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      link: '/services'
    },
    {
      id: 2,
      title: '合规咨询服务',
      description: '专业的国际合规法律支持和政策解读',
      icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
      link: '/services'
    },
    {
      id: 3,
      title: '战略咨询',
      description: '定制化的ESG战略规划和实施方案',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      link: '/services'
    }
  ];

  // 专家资源数据
  const expertResources = [
    {
      id: 1,
      title: 'ESG专家咨询',
      description: '一对一ESG战略咨询服务',
      link: '/services'
    },
    {
      id: 2,
      title: '合规法律顾问',
      description: '专业的国际合规法律支持',
      link: '/services'
    },
    {
      id: 3,
      title: '市场研究报告',
      description: '定制化的市场分析和研究',
      link: '/insights'
    },
    {
      id: 4,
      title: '培训课程',
      description: '系统性的ESG能力建设培训',
      link: '/insights'
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
              <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
                智能全球化
                <span className="block font-normal text-gray-700">ESG咨询服务</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                为中国企业出海提供专业的ESG风险管理、合规咨询和战略支持服务，助力企业在全球市场中可持续发展。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/esg-risk-analysis"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300"
                >
                  开始风险评估
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-900 border border-gray-300 hover:border-gray-400 transition-colors duration-300"
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
              我们的核心服务
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              提供全方位的ESG解决方案，助力企业实现可持续发展目标
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
                className="bg-white p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 mb-6">
                  <svg className="w-full h-full text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={service.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <Link
                  to={service.link}
                  className="inline-flex items-center text-gray-900 hover:text-gray-700 font-medium transition-colors duration-300"
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

      {/* 专家资源 */}
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
              专业资源
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              汇聚行业专家和优质资源，为您的企业发展提供全方位支持
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 border border-gray-200 hover:border-gray-300 transition-colors duration-300"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {resource.description}
                </p>
                <Link
                  to={resource.link}
                  className="inline-flex items-center text-gray-900 hover:text-gray-700 text-sm font-medium transition-colors duration-300"
                >
                  了解详情
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 洞察与观点 */}
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
              洞察与观点
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              深度分析行业趋势，分享专业见解和实践经验
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
                to="/esg-risk-analysis"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-900 bg-white hover:bg-gray-100 transition-colors duration-300"
              >
                免费风险评估
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white border border-gray-600 hover:border-gray-500 transition-colors duration-300"
              >
                联系我们
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}