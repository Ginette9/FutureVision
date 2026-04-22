import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ContactModal from '../components/ContactModal';

export default function Services() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const services = (language === 'en-US' ? [
    {
      category: 'Multinational Enterprises',
      title: 'ESG Risk Management for Global Operations',
      description: 'Identify, prevent and resolve ESG risks across global markets; build secure, resilient and sustainable supply chains and operations to ensure regulatory safety and long-term growth.',
      services: [
        'Localized ESG risk assessment',
        'ESG risk monitoring and alerts',
        'Sustainability strategy execution and ESG governance building',
        'Stakeholder engagement and relationship building',
        'ESG crisis planning and conflict response',
        'Ongoing ESG disclosure and communication'
      ],
      buttonText: 'Learn More',
      action: () => navigate('/esg-voyant')
    },
    {
      category: 'Public Companies',
      title: 'Sustainable Growth Strategy & ESG Rating Improvement',
      description: 'Build sustainable growth strategies and upgrade ESG governance to enhance resilience, market trust, and long-term valuation recognized by capital markets.',
      services: [
        'Sustainable growth diagnosis and strategy development',
        'ESG governance diagnosis and optimization',
        'Mainstream ESG rating improvement strategy and execution',
        'Sustainable brand narrative and market communication',
        'Sustainable growth execution support and annual co-creation',
        'Corporate social impact enhancement program'
      ],
      buttonText: 'Learn More',
      action: () => window.open('https://mscfv.com/futureVision/', '_blank')
    },
    {
      category: 'SMEs',
      title: 'Practical Export Strategy for Products',
      description: 'Help SMEs articulate sustainable value and build differentiated export competitiveness; support overseas channel rollout and agency sales to boost success rate and profitability.',
      services: [
        'Overseas market opportunity identification and entry planning',
        'Sustainable value extraction and differentiated positioning',
        'Overseas channels and end-user information gathering',
        'Corporate website, collateral and product system optimization',
        'Overseas channel rollout and agency sales',
        'Overseas compliance, risk management and localized operations support'
      ],
      buttonText: 'Learn More',
      action: () => navigate('/market-entry-engine/search'),
      disabled: false
    }
  ] : language === 'zh-HK' ? [
    {
      category: '跨國企業',
      title: '全球化運營ESG風險管理',
      description: '幫助出海企業識別、預防與解決全球市場的ESG風險，構建安全、穩健、可持續的供應鏈與運營體系，獲得監管安全與長期增長的確定性。',
      services: [
        '全球在地化ESG風險評估（跨國合規+隱性風險）',
        'ESG風險監控與告警',
        '可持續發展戰略落地與ESG治理體系建設',
        '在地化利害關係人溝通與關係搭建',
        'ESG危機預案與衝突應對',
        'ESG持續披露與溝通'
      ],
      buttonText: '了解更多',
      action: () => navigate('/esg-voyant')
    },
    {
      category: '上市公司',
      title: '可持續增長戰略與ESG評級提升',
      description: '通過構建可持續增長戰略、升級ESG治理體系，提升上市公司穩健增長能力與市場信任，增強長期估值韌性，形成資本市場認可的差異化優勢。',
      services: [
        '可持續增長診斷與戰略制定',
        'ESG治理體系診斷及優化升級',
        '主流ESG評級提升策略及執行落地',
        '可持續品牌敘事與市場溝通',
        '可持續增長執行陪跑與年度共創',
        '企業社會影響力提升計劃'
      ],
      buttonText: '了解更多',
      action: () => window.open('https://mscfv.com/futureVision/', '_blank')
    },
    {
      category: '中小企業',
      title: '簡便可行的產品出海策略',
      description: '幫助中小企業提煉產品及服務的可持續價值並形成出海差異化競爭力，提供海外渠道落地與代理銷售服務，顯著提升出海成功率與利潤空間。',
      services: [
        '海外市場機會識別與進入路徑規劃',
        '產品與服務的可持續價值提煉與差異化定位',
        '海外渠道與終端用戶信息搜集',
        '公司官網、對外宣傳材料、產品體系等優化設計',
        '海外渠道落地與代理銷售',
        '海外合規、風險管理與在地化運營支持'
      ],
      buttonText: '了解更多',
      action: () => navigate('/market-entry-engine/search'),
      disabled: false
    }
  ] : [
    {
      category: "跨国企业",
      title: "全球化运营ESG风险管理",
      description: "帮助出海企业识别、预防和解决全球市场的环境、社会与治理风险，构建安全、稳健、可持续的供应链与运营体系，获得监管安全与长期增长的确定性",
      services: [
        "全球在地化ESG风险评估",
        "ESG风险监控与告警",
        "可持续发展战略落地与ESG治理体系建设",
        "在地化利益相关方沟通与关系搭建",
        "ESG危机预案与冲突应对",
        "ESG持续披露与沟通"
      ],
      buttonText: "了解详情",
      action: () => navigate('/esg-voyant')
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
      buttonText: "了解详情",
      action: () => navigate('/market-entry-engine/search'),
      disabled: false
    }
  ]);

  const labels = {
    title: language === 'en-US' ? 'Services' : language === 'zh-HK' ? '專業服務' : '专业服务',
    subtitle: language === 'en-US' ? 'Integrate sustainability, consulting methodologies and AI to unlock global growth opportunities' : language === 'zh-HK' ? '融合可持續理念、管理諮詢方法與AI技術，為更多企業解鎖全球增長機會' : '融合可持续发展理念、管理咨询方法与AI技术，为更多企业解锁全球增长机会',
    sectionTitle: language === 'en-US' ? 'Service Content' : language === 'zh-HK' ? '服務內容' : '服务内容',
    contactTitle: language === 'en-US' ? 'Need to know more?' : language === 'zh-HK' ? '需要了解更多？' : '需要了解更多？',
    contactDesc: language === 'en-US' ? 'Describe your needs and our consultants will contact you shortly.' : language === 'zh-HK' ? '請描述您的需求，我們的顧問會盡快聯繫您。' : '请描述您的需求，我们的顾问会尽快联系您。',
    contactBtn: language === 'en-US' ? 'Contact Us' : language === 'zh-HK' ? '聯繫我們' : '联系我们'
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
          {labels.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {labels.subtitle}
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
                <h4 className="font-medium text-gray-900 mb-6">{labels.sectionTitle}</h4>
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
            {labels.contactTitle}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            {labels.contactDesc}
          </p>
          <button 
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium"
          >
            {labels.contactBtn}
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
