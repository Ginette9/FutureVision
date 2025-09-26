import { motion } from 'framer-motion';
import { useState } from 'react';

interface InsightItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
}

export default function Insights() {
  const [activeCategory, setActiveCategory] = useState('reports');

  const categories = [
    { id: 'reports', name: '独家洞察报告' },
    { id: 'weekly', name: '每周要闻' },
    { id: 'industry', name: '行业必读' },
    { id: 'courses', name: '课程资源' }
  ];

  const insights: Record<string, InsightItem[]> = {
    reports: [
      {
        id: 1,
        title: '2024年全球ESG风险趋势报告',
        summary: '深度分析全球ESG风险发展趋势，为企业出海提供战略指导',
        date: '2024-01-15',
        category: '市场分析',
        readTime: '15分钟',
        featured: true
      },
      {
        id: 2,
        title: '中小企业出海合规指南',
        summary: '针对中小企业的海外合规要求和最佳实践',
        date: '2024-01-10',
        category: '合规指导',
        readTime: '12分钟'
      },
      {
        id: 3,
        title: 'MSCI ESG评级提升策略',
        summary: '系统性提升企业MSCI ESG评级的方法论和实施路径',
        date: '2024-01-05',
        category: 'ESG评级',
        readTime: '20分钟'
      }
    ],
    weekly: [
      {
        id: 4,
        title: '本周ESG要闻：欧盟新法规影响分析',
        summary: '欧盟最新ESG法规对中国企业的影响及应对策略',
        date: '2024-01-20',
        category: '政策解读',
        readTime: '8分钟'
      },
      {
        id: 5,
        title: '全球供应链风险周报',
        summary: '本周全球供应链重大风险事件汇总',
        date: '2024-01-18',
        category: '风险监测',
        readTime: '10分钟'
      }
    ],
    industry: [
      {
        id: 6,
        title: '制造业ESG转型必读',
        summary: '制造业企业ESG转型的关键要素和成功案例',
        date: '2024-01-12',
        category: '行业洞察',
        readTime: '18分钟'
      },
      {
        id: 7,
        title: '科技行业可持续发展趋势',
        summary: '科技行业在可持续发展方面的最新趋势和机遇',
        date: '2024-01-08',
        category: '行业洞察',
        readTime: '14分钟'
      }
    ],
    courses: [
      {
        id: 8,
        title: 'ESG基础认知课程',
        summary: '从零开始了解ESG的基本概念和实施框架',
        date: '2024-01-03',
        category: '基础课程',
        readTime: '45分钟'
      },
      {
        id: 9,
        title: '企业出海风险管理实务',
        summary: '企业出海过程中的风险识别、评估和管理实务',
        date: '2023-12-28',
        category: '实务课程',
        readTime: '60分钟'
      }
    ]
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          洞察与观点
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          深度行业洞察、专业分析报告和实用资源，助您把握全球商业趋势
        </p>
      </motion.div>

      {/* Category Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 font-medium transition-colors duration-300 ${
                activeCategory === category.id
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {insights[activeCategory]?.map((insight, index) => (
            <motion.article
              key={insight.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 ${
                insight.featured ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              {/* Article Header */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {insight.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {insight.readTime}
                  </span>
                </div>
                
                <h3 className={`font-medium text-gray-900 mb-4 ${
                  insight.featured ? 'text-2xl lg:text-3xl' : 'text-xl'
                }`}>
                  {insight.title}
                </h3>
                
                <p className={`text-gray-600 leading-relaxed mb-6 ${
                  insight.featured ? 'text-lg' : ''
                }`}>
                  {insight.summary}
                </p>

                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-500">
                    {formatDate(insight.date)}
                  </time>
                  <button className="text-gray-900 hover:text-gray-700 font-medium">
                    阅读更多 →
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 p-12"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            订阅我们的洞察报告
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            获取最新的ESG趋势分析、市场洞察和专业指导
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="输入您的邮箱地址"
              className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
            />
            <button className="px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium">
              订阅
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}