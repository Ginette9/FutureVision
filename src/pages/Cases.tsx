import { motion } from 'framer-motion';
import { useState } from 'react';
import ContactModal from '../components/ContactModal';

export default function Cases() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const cases = [
    {
      id: 1,
      title: '某头部活性炭生产制造企业产品出海',
      industry: '制造业',
      region: '全球',
      challenge: '企业计划扩大产品海外市场，但在品牌认知度、海外市场布局以及本土化运营方面面临挑战。',
      solution: '我们帮助企业梳理海外市场需求，制定清晰的出海策略，并构建本地化品牌与渠道体系。',
      results: [
        '成功进入多个海外核心市场',
        '建立本土化品牌体系',
        '提升全球竞争力与客户认知'
      ],
      tags: ['出海策略', '市场进入', '品牌建设']
    },
    {
      id: 2,
      title: '一家数据服务公司的可持续发展战略制定',
      industry: '科技',
      region: '中国',
      challenge: '企业缺乏系统的可持续发展战略框架，对利益相关方需求理解不足。',
      solution: '通过调研、访谈和数据分析，明确企业 ESG 关键议题，构建完整可持续发展战略与落地路径。',
      results: [
        '建立系统化可持续战略',
        '提升内部管理机制',
        '加强与客户及员工的信任关系'
      ],
      tags: ['可持续发展', '战略规划', '利益相关方研究']
    },
    {
      id: 3,
      title: '一家农业科技公司的增长战略优化',
      industry: '农业科技',
      region: '中国',
      challenge: '在业务扩张中缺乏清晰增长路线，对核心赛道和战略重点判断不清。',
      solution: '从用户洞察、行业对标与趋势分析入手，明确核心增长路径，优化产品线与市场进入模型。',
      results: [
        '形成清晰第二增长曲线',
        '新业务布局更加聚焦',
        '组织目标与战略方向一致性提升'
      ],
      tags: ['增长战略', '商业模式', '市场洞察']
    },
    {
      id: 4,
      title: '某百强游戏公司生态战略重塑',
      industry: '科技',
      region: '中国',
      challenge: '企业希望构建“游戏+”生态，拓展医疗、科普等跨界业务，但缺乏整体战略规划。',
      solution: '通过深度访谈和内部外部分析，梳理核心优势，明确“游戏+医疗”“游戏+科普”等跨界路径，并成立可持续发展战略办公室。',
      results: [
        '推动“数字疗法”研发并获得行业首证',
        '明确多产业融合生态路线图',
        '推动多个跨界创新课题落地'
      ],
      tags: ['生态战略', '第二增长曲线', '跨界创新']
    },
    {
      id: 5,
      title: '法国大型化妆品集团中国本土化品牌策略',
      industry: '消费品',
      region: '中国',
      challenge: '集团虽有全球可持续项目，但对中国消费者、文化与社会议题理解不足，品牌价值难以有效传递。',
      solution: '基于近 2000 份定量调研与品牌会员访谈，梳理中国消费者关注议题，构建符合本土市场的品牌策略与女性赋能项目。',
      results: [
        '女性自信课程播放量 10 万+',
        '触达 20 万+ 用户',
        '强化品牌在可持续与社会价值领域的影响力'
      ],
      tags: ['本土化', '品牌策略', '消费者洞察']
    },
    {
      id: 6,
      title: '保温杯行业龙头企业自有品牌高端化战略',
      industry: '消费品',
      region: '全球',
      challenge: '行业竞争同质化严重，国内品牌希望突破国际品牌认知壁垒，构建高端化产品力与品牌力。',
      solution: '围绕户外、儿童钛杯、定制礼品三大赛道构建高端化战略，并完成全球渠道布局与品牌体系梳理。',
      results: [
        '产品销往全球 80+ 国家',
        '2022 年营收 24.28 亿元',
        '高端渠道成功突破'
      ],
      tags: ['品牌升级', '高端化', '全球化布局']
    },
    {
      id: 7,
      title: '国际化妆品连锁品牌绿色产品革新',
      industry: '消费品',
      region: '全球',
      challenge: '美妆行业塑料包装大量增长，企业需提升产品可持续性并与用户建立情感链接。',
      solution: '从原料、生产到包装全链梳理可持续元素，进行原料产地调研并融入产业扶贫内容，重构绿色产品故事与营销策略。',
      results: [
        '推出多款可持续产品',
        '增强消费者对绿色理念的认同',
        '实现品牌社会价值提升'
      ],
      tags: ['绿色供应链', '可持续产品创新', '全链路策略']
    },
    {
      id: 8,
      title: '智慧终端品牌全球可持续发展战略',
      industry: '科技',
      region: '全球',
      challenge: '在国际市场竞争激烈，需要构建全球化与本地化兼容的可持续发展能力。',
      solution: '梳理研发投入、专利体系、全球工厂布局与智能化产品开发路径，推动品牌形成全球可持续战略。',
      results: [
        '631 项专利',
        '推出智能水杯等创新产品',
        '提升全球品牌竞争力'
      ],
      tags: ['智能产品', '国际化', '可持续创新']
    },
    {
      id: 9,
      title: '跨国汽车企业可持续战略本地化',
      industry: '汽车',
      region: '中国',
      challenge: '跨国集团需将全球可持续战略与中国本地实际情况结合，完善本土组织与管理体系。',
      solution: '通过战略目标梳理、流程设计和组织管理变革，构建更适配本土市场的战略及执行体系。',
      results: [
        '实现集团战略本地化落地',
        '提高部门协同效率',
        '优化母子公司管理体系'
      ],
      tags: ['本地化', '组织管理', '战略融合']
    },
    {
      id: 10,
      title: '运动品牌代理 ESG 评级提升',
      industry: '消费品',
      region: '全球',
      challenge: '企业需要提升 ESG 评级，以增强全球市场竞争力和品牌影响力。',
      solution: '围绕可持续产品、气候行动、可持续供应链、员工与社区四大模块开展系统性提升，并制定全链路 ESG 路线图。',
      results: [
        '发布行业首份 ESG 报告',
        '完成范围 1、2 温室气体盘查',
        '识别范围 3 减排潜力并制定改进路径'
      ],
      tags: ['ESG评估', '评级提升', '供应链管理']
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
          在过去的数十年中，我们帮助众多企业成功应对全球化和增长挑战
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
          <h2 className="text-2xl font-light text-gray-900 mb-6">
            和我们一起，开启您的成功故事
          </h2>
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
