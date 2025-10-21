import { motion } from 'framer-motion';

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
  // 只保留独家洞察报告
  const insights: InsightItem[] = [
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
  ];

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
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1">
                    {insight.category}
                  </span>
                  <span className="text-sm text-gray-400">
                    {insight.readTime}
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
                  <button className="text-gray-900 hover:text-gray-600 transition-colors duration-300 font-medium">
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