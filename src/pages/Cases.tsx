import { motion } from 'framer-motion';
import { useState } from 'react';
import ContactModal from '../components/ContactModal';

export default function Cases() {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const cases = [
    {
      id: 1,
      title: '某制造业企业东南亚市场拓展',
      client: '大型制造企业',
      industry: '制造业',
      region: '东南亚',
      challenge: '该企业计划在东南亚建立生产基地，但面临复杂的ESG合规要求和当地政策风险',
      solution: '我们为客户提供了全面的ESG风险评估，制定了详细的合规策略，并建立了持续监测机制',
      results: [
        '成功规避3项重大ESG风险',
        '合规成本降低30%',
        '项目按期完成，获得当地政府支持'
      ],
      tags: ['ESG合规', '风险管理', '政策分析']
    },
    {
      id: 2,
      title: '科技公司欧洲市场ESG评级提升',
      client: '上市科技公司',
      industry: '科技',
      region: '欧洲',
      challenge: '客户的MSCI ESG评级较低，影响了在欧洲市场的融资和业务拓展',
      solution: '通过深度分析MSCI评级体系，制定了针对性的ESG改进方案，涵盖环境、社会和治理三个维度',
      results: [
        'MSCI ESG评级从B提升至A',
        '欧洲市场融资成本降低15%',
        '品牌声誉显著提升'
      ],
      tags: ['MSCI评级', 'ESG提升', '融资优化']
    },
    {
      id: 3,
      title: '能源企业全球可持续发展战略',
      client: '大型能源集团',
      industry: '能源',
      region: '全球',
      challenge: '面临全球能源转型压力，需要制定长期可持续发展战略',
      solution: '制定了涵盖清洁能源转型、碳中和路径、利益相关者参与的综合性可持续发展战略',
      results: [
        '制定了2030年碳中和路线图',
        '获得国际绿色金融认证',
        '可持续投资增长50%'
      ],
      tags: ['可持续发展', '碳中和', '绿色金融']
    },
    {
      id: 4,
      title: '消费品牌供应链ESG管理',
      client: '知名消费品牌',
      industry: '消费品',
      region: '亚太',
      challenge: '供应链ESG风险频发，影响品牌声誉和市场表现',
      solution: '建立了全链条ESG监测体系，实施供应商ESG认证和持续改进机制',
      results: [
        '供应链ESG事件减少80%',
        '供应商ESG合规率达95%',
        '消费者满意度提升25%'
      ],
      tags: ['供应链管理', 'ESG监测', '品牌保护']
    },
    {
      id: 5,
      title: '金融机构ESG投资框架构建',
      client: '大型投资银行',
      industry: '金融',
      region: '全球',
      challenge: '需要建立符合国际标准的ESG投资评估和决策框架',
      solution: '设计了多层次ESG投资框架，包括评估标准、风险模型和投资决策流程',
      results: [
        'ESG投资规模增长200%',
        '投资风险显著降低',
        '获得多项ESG投资奖项'
      ],
      tags: ['ESG投资', '风险模型', '投资决策']
    },
    {
      id: 6,
      title: '房地产企业绿色建筑认证',
      client: '大型房地产开发商',
      industry: '房地产',
      region: '中国',
      challenge: '需要获得国际绿色建筑认证，提升项目竞争力',
      solution: '提供了LEED和BREEAM认证咨询服务，优化建筑设计和施工方案',
      results: [
        '获得LEED金级认证',
        '建筑能耗降低40%',
        '项目溢价提升20%'
      ],
      tags: ['绿色建筑', 'LEED认证', '可持续设计']
    }
  ];

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
          成功案例
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          通过专业的ESG解决方案，我们帮助众多企业成功应对全球化挑战
        </p>
      </motion.div>

      {/* Cases Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {cases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Case Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {caseItem.industry}
                      </span>
                      <span className="text-sm text-gray-500">
                        {caseItem.region}
                      </span>
                    </div>
                    <h3 className="text-2xl font-medium text-gray-900">
                      {caseItem.title}
                    </h3>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {caseItem.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Case Content */}
              <div className="p-8">
                {/* Challenge */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">挑战</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {caseItem.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">解决方案</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {caseItem.solution}
                  </p>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h4 className="font-medium text-gray-900 mb-3">成果</h4>
                  <ul className="space-y-2">
                    {caseItem.results.map((result, idx) => (
                      <li key={idx} className="flex items-start text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setSelectedCase(selectedCase === caseItem.id ? null : caseItem.id)}
                  className="text-gray-900 hover:text-gray-700 font-medium"
                >
                  {selectedCase === caseItem.id ? '收起详情' : '查看详情'} →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-50 p-12"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              我们的成果
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              通过专业服务，我们帮助客户取得了显著成效
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-light text-gray-900 mb-2">100+</div>
              <div className="text-gray-600">成功案例</div>
            </div>
            <div>
              <div className="text-4xl font-light text-gray-900 mb-2">50+</div>
              <div className="text-gray-600">合作企业</div>
            </div>
            <div>
              <div className="text-4xl font-light text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">客户满意度</div>
            </div>
            <div>
              <div className="text-4xl font-light text-gray-900 mb-2">30+</div>
              <div className="text-gray-600">覆盖国家</div>
            </div>
          </div>
        </motion.div>
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
            开始您的成功故事
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            让我们的专业团队为您量身定制ESG解决方案
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