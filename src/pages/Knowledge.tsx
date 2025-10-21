import { motion } from 'framer-motion';
import { useState } from 'react';

interface KnowledgeItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: string;
  readTime: string;
  featured?: boolean;
}

export default function Knowledge() {
  const [activeCategory, setActiveCategory] = useState('weekly');

  const categories = [
    { id: 'weekly', name: '每周要闻' },
    { id: 'industry', name: '必读报告' },
    { id: 'courses', name: '课程资源' }
  ];

  const knowledgeItems: Record<string, KnowledgeItem[]> = {
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
      },
      {
        id: 10,
        title: '本周可持续发展动态',
        summary: '全球可持续发展领域的最新动态和政策变化',
        date: '2024-01-22',
        category: '政策解读',
        readTime: '12分钟'
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
      },
      {
        id: 11,
        title: '金融业ESG实践指南',
        summary: '金融机构ESG实践的最佳案例和实施路径',
        date: '2024-01-06',
        category: '行业洞察',
        readTime: '16分钟'
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
      },
      {
        id: 12,
        title: '可持续供应链管理',
        summary: '构建可持续供应链的策略和实施方法',
        date: '2023-12-25',
        category: '专业课程',
        readTime: '90分钟'
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
          知识中心
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          及时资讯、行业洞察和专业课程，全方位提升您的ESG知识储备
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

      {/* Knowledge Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {knowledgeItems[activeCategory]?.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1">
                    {item.category}
                  </span>
                  <span className="text-sm text-gray-400">
                    {item.readTime}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3 leading-tight">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-500">
                    {formatDate(item.date)}
                  </time>
                  <button className="text-gray-900 hover:text-gray-600 transition-colors duration-300 font-medium">
                    {activeCategory === 'courses' ? '开始学习' : '阅读更多'} →
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
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            订阅知识更新
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            第一时间获取最新的行业资讯、专业洞察和课程更新
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