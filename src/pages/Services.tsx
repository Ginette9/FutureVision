import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ContactModal from '../components/ContactModal';

export default function Services() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const services = [
    {
      category: "跨国企业",
      title: "全球化运营ESG风险管理",
      description: "帮助出海企业识别、预防和解决全球市场的环境、社会与治理风险，构建安全、稳健、可持续的供应链与运营体系，获得监管安全与长期增长的确定性",
      services: [
        "全球在地化ESG风险评估（跨国合规+隐性风险）",
        "ESG风险监控与告警",
        "可持续发展战略落地与ESG治理体系建设",
        "在地化利益相关方沟通与关系搭建",
        "ESG危机预案与冲突应对",
        "ESG持续披露与沟通"
      ],
      buttonText: "了解详情",
      action: () => navigate('/esg-voyant/intro')
    },
    {
      category: "上市公司",
      title: "可持续增长战略与ESG评级提升",
      description: "通过构建可持续增长战略、升级ESG治理体系，提升上市公司稳健增长能力、市场信任度与长期估值韧性，形成可被资本市场认可的差异化竞争优势",
      services: [
        "可持续增长诊断与可持续增长战略制定",
        "ESG治理体系诊断及优化升级",
        "主流ESG评级提升策略及执行落地",
        "可持续品牌叙事与市场沟通",
        "可持续增长执行陪跑与年度共创",
        "企业社会影响力提升计划"
      ],
      buttonText: "了解详情",
      action: () => window.open('https://mscfv.com/futureVision/', '_blank')
    },
    {
      category: "中小企业",
      title: "简便可行的产品出海策略",
      description: "帮助中小企业提炼产品及服务的可持续价值并形成出海差异化竞争力，提供海外渠道落地与代理销售服务，显著提升出海成功率与利润空间",
      services: [
        "海外市场机会识别与进入路径规划",
        "产品与服务的可持续价值提炼与差异化定位",
        "海外渠道与终端用户信息搜集",
        "公司官网、对外宣传材料、产品体系等优化设计",
        "海外渠道落地与代理销售",
        "海外合规、风险管理与在地化运营支持"
      ],
      buttonText: "即将推出",
      action: null,
      disabled: true
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
          专业服务
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          融合可持续发展理念、管理咨询方法与AI技术，为更多企业解锁全球增长机会
        </p>
      </motion.div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Card Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {service.category}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 leading-tight">
                    {service.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Services List */}
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="font-medium text-gray-900 mb-6">服务内容</h4>
                <ul className="space-y-4 flex-1">
                  {service.services.map((item, idx) => (
                    <li key={idx} className="flex items-start text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button 
                    className={`w-full py-3 px-6 font-medium transition-colors duration-300 ${
                      service.disabled 
                        ? 'text-gray-400 border border-gray-200 cursor-not-allowed bg-gray-50' 
                        : 'text-gray-900 border border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={service.action || undefined}
                    disabled={service.disabled}
                  >
                    {service.buttonText}
                  </button>
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
          <h2 className="text-2xl font-light text-gray-900 mb-6 max-w-lg mx-auto">
            需要了解更多？
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            请描述您的需求，我们的顾问会尽快联系您。
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