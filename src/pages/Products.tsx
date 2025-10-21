import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ContactModal from '../components/ContactModal';

export default function Products() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  const products = [
    {
      id: 'esg-risk-engine',
      title: '出海非常规风险/ESG冲突事件搜索引擎',
      description: '智能识别和分析全球ESG风险事件，为企业出海提供实时风险预警',
      status: 'available',
      features: [
        '实时风险监测',
        '智能分析报告',
        '多维度评估',
        '定制化预警'
      ],
      link: '/esg-risk-analysis/intro'
    },
    {
      id: 'market-entry-engine',
      title: 'SME全球市场进入策略引擎',
      description: '为中小企业提供个性化的全球市场进入策略和路径规划',
      status: 'coming-soon',
      features: [
        '市场机会分析',
        '进入策略规划',
        '风险评估',
        '资源匹配'
      ],
      link: '#'
    },
    {
      id: 'business-intelligence',
      title: '商业情报库',
      description: '全球商业情报数据库，提供深度的市场洞察和竞争分析',
      status: 'coming-soon',
      features: [
        '市场情报收集',
        '竞争对手分析',
        '行业趋势预测',
        '定制化报告'
      ],
      link: '#'
    },
    {
      id: 'msci-methodology',
      title: 'MSCI ESG评级提升方法论',
      description: '专业的MSCI ESG评级提升指导和实施方案',
      status: 'development',
      features: [
        '评级现状分析',
        '提升路径规划',
        '实施指导',
        '效果跟踪'
      ],
      link: '#'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200">
            可用
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200">
            即将推出
          </span>
        );
      case 'development':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200">
            开发中
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20"
      >
        <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
          产品与解决方案
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          基于先进技术和深度行业洞察，为企业出海提供全方位的智能化解决方案
        </p>
      </motion.div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Product Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-medium text-gray-900 flex-1 pr-4">
                    {product.title}
                  </h3>
                  {getStatusBadge(product.status)}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div className="p-8">
                <h4 className="font-medium text-gray-900 mb-6">核心功能</h4>
                <ul className="space-y-4 mb-8">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div>
                  {product.status === 'available' ? (
                    <Link
                      to={product.link}
                      className="inline-flex items-center px-6 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium"
                    >
                      立即体验
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center px-6 py-3 text-gray-500 bg-gray-100 cursor-not-allowed font-medium"
                    >
                      {product.status === 'coming-soon' ? '敬请期待' : '开发中'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 p-12"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            需要定制化产品？
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            我们可以根据您的具体业务需求，定制开发专属的解决方案
          </p>
          <button 
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium"
          >
            联系我们
          </button>
        </motion.div>
      </div>
      
      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
}