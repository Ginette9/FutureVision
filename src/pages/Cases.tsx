import { motion } from 'framer-motion';
import { useState } from 'react';
import ContactModal from '../components/ContactModal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Cases() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { language } = useLanguage();

  const casesByLanguage: Record<'en-US' | 'zh-CN' | 'zh-HK', Array<{
    id: number;
    title: string;
    industry: string;
    region: string;
    challenge: string;
    solution: string;
    results: string[];
    tags: string[];
  }>> = {
    'zh-CN': [
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
    ],
    'en-US': [
      {
        id: 1,
        title: 'Overseas Expansion Strategy for a Leading Activated Carbon Manufacturer',
        industry: 'Manufacturing',
        region: 'Global',
        challenge: 'The company aimed to expand into international markets but faced challenges in brand awareness, market layout, and localized operations.',
        solution: 'We supported the client by analyzing overseas demand, formulating a clear export strategy, and building a localized brand and channel system.',
        results: [
          'Successful entry into several key global markets',
          'Established a localized brand framework',
          'Strengthened global competitiveness and customer recognition'
        ],
        tags: ['Export Strategy', 'Market Entry', 'Brand Development']
      },
      {
        id: 2,
        title: 'Sustainability Strategy Development for a Data Service Company',
        industry: 'Technology',
        region: 'China',
        challenge: 'The company lacked a systematic sustainability framework and a clear understanding of stakeholder expectations.',
        solution: 'Through surveys, interviews, and data analysis, we identified key ESG issues and developed a comprehensive sustainability strategy and implementation roadmap.',
        results: [
          'Built a structured sustainability strategy',
          'Improved internal management mechanisms',
          'Enhanced trust with clients and employees'
        ],
        tags: ['Sustainability', 'Strategic Planning', 'Stakeholder Research']
      },
      {
        id: 3,
        title: 'Growth Strategy Optimization for an Agricultural Technology Company',
        industry: 'Agri-Tech',
        region: 'China',
        challenge: 'The company lacked clarity in its growth direction, core strategic priorities, and future business focus.',
        solution: 'We analyzed user insights, industry benchmarks, and emerging trends to define growth pathways, refine product lines, and enhance market-entry decisions.',
        results: [
          'Defined a clear second growth curve',
          'More focused new-business layout',
          'Improved alignment between strategy and organizational goals'
        ],
        tags: ['Growth Strategy', 'Business Model', 'Market Insights']
      },
      {
        id: 4,
        title: 'Ecosystem Strategy Redesign for a Top 100 Gaming Company',
        industry: 'Technology',
        region: 'China',
        challenge: 'The company sought to build a “Game+” ecosystem and expand into healthcare and science-education fields but lacked a unified strategic roadmap.',
        solution: 'Through deep interviews and internal–external analysis, we clarified core strengths, identified cross-industry opportunities, and established a Sustainability Strategy Office.',
        results: [
          'Achieved China’s first “digital therapeutics” approval in gaming',
          'Defined a multi-industry integration roadmap',
          'Promoted multiple cross-disciplinary research projects'
        ],
        tags: ['Ecosystem Strategy', 'Second Growth Curve', 'Cross-Industry Innovation']
      },
      {
        id: 5,
        title: 'Localization Strategy for a Major French Cosmetics Group',
        industry: 'Consumer Goods',
        region: 'China',
        challenge: 'Although the group had global sustainability programs, it needed deeper understanding of Chinese consumer values, social issues, and cultural context.',
        solution: 'Using 2,000+ surveys and user interviews, we identified key societal concerns and created a localized brand strategy supported by women empowerment initiatives.',
        results: [
          'Women’s confidence program reached 100,000+ plays',
          'Over 200,000 users engaged',
          'Enhanced brand reputation and social impact'
        ],
        tags: ['Localization', 'Brand Strategy', 'Consumer Insights']
      },
      {
        id: 6,
        title: 'High-End Brand Strategy for a Leading Thermos Manufacturer',
        industry: 'Consumer Goods',
        region: 'Global',
        challenge: 'Facing homogeneous competition, the company aimed to break global perception barriers and build premium product and brand competitiveness.',
        solution: 'We developed a premiumization strategy around outdoor products, children’s titanium cups, and customized gifts while aligning global channels and brand architecture.',
        results: [
          'Products sold in 80+ countries',
          'Revenue reached RMB 2.428 billion in 2022',
          'Successfully expanded high-end channels'
        ],
        tags: ['Brand Upgrade', 'Premiumization', 'Global Expansion']
      },
      {
        id: 7,
        title: 'Green Product Innovation Strategy for an International Cosmetic Retail Brand',
        industry: 'Consumer Goods',
        region: 'Global',
        challenge: 'With plastic packaging surging, the company needed to enhance product sustainability and strengthen emotional connection with consumers.',
        solution: 'We assessed sustainability across raw materials, production, and packaging, conducted origin-site field studies, and integrated poverty-alleviation elements into product storytelling.',
        results: [
          'Launched multiple sustainable product lines',
          'Strengthened consumer recognition of green values',
          'Enhanced brand social impact'
        ],
        tags: ['Green Supply Chain', 'Sustainable Product Innovation', 'End-to-End Strategy']
      },
      {
        id: 8,
        title: 'Global Sustainability Strategy for a Leading Smart Device Brand',
        industry: 'Technology',
        region: 'Global',
        challenge: 'The company needed to align global competition with localized sustainable practices and build strong product innovation capabilities.',
        solution: 'We supported R&D planning, patent system development, global facility layout, and smart-product innovation to build an integrated sustainability strategy.',
        results: [
          '631 accumulated patents',
          'Introduced IoT-enabled smart thermos products',
          'Enhanced brand competitiveness globally'
        ],
        tags: ['Smart Products', 'Internationalization', 'Sustainable Innovation']
      },
      {
        id: 9,
        title: 'Localization of Sustainability Strategy for a Multinational Auto Group',
        industry: 'Automotive',
        region: 'China',
        challenge: 'The company needed to adapt global sustainability strategies to the Chinese market and optimize its organizational and management frameworks.',
        solution: 'We redesigned strategic goals, management processes, and organizational structures to enable local execution and stronger cross-team coordination.',
        results: [
          'Successful localization of group strategy',
          'Improved cross-department collaboration',
          'Enhanced parent-subsidiary management efficiency'
        ],
        tags: ['Localization', 'Organizational Management', 'Strategic Alignment']
      },
      {
        id: 10,
        title: 'ESG Rating Enhancement for a Global Sports Brand Distributor',
        industry: 'Consumer Goods',
        region: 'Global',
        challenge: 'The distributor needed to improve ESG performance to enhance competitiveness and global brand reputation.',
        solution: 'We implemented improvements across sustainable products, climate action, responsible supply chains, and employee & community initiatives, aligned with ESG reporting standards.',
        results: [
          'Published its first ESG report in the industry',
          'Completed Scope 1 & 2 GHG accounting',
          'Identified Scope 3 reduction opportunities and pathways'
        ],
        tags: ['ESG Assessment', 'Rating Improvement', 'Supply Chain Management']
      }
    ],
    'zh-HK': [
      {
        id: 1,
        title: '某頭部活性炭生產企業產品出海',
        industry: '製造業',
        region: '全球',
        challenge: '企業希望擴大海外市場，但在品牌知名度、海外佈局及本土化運營方面面臨挑戰。',
        solution: '我們協助企業分析海外需求，制定清晰的出海策略，並搭建本土化品牌與渠道體系。',
        results: [
          '成功進入多個海外核心市場',
          '建立本土化品牌架構',
          '增強全球競爭力與客戶認知度'
        ],
        tags: ['出海策略', '市場進入', '品牌建設']
      },
      {
        id: 2,
        title: '某數據服務公司可持續發展戰略制定',
        industry: '科技',
        region: '中國',
        challenge: '企業缺乏完整的可持續發展框架，對利害關係人的需求理解不足。',
        solution: '透過調研、訪談與數據分析，識別核心 ESG 議題，並建立完整的可持續發展策略與落地路線圖。',
        results: [
          '建立系統化的可持續發展戰略',
          '提升內部管理能力',
          '強化客戶與員工信任'
        ],
        tags: ['可持續發展', '策略規劃', '利害關係人研究']
      },
      {
        id: 3,
        title: '某農業科技公司增長戰略優化',
        industry: '農業科技',
        region: '中國',
        challenge: '企業在業務擴張中缺乏清晰的增長方向與策略重點。',
        solution: '基於使用者洞察、行業標竿與趨勢研究，重新界定增長路徑並梳理產品線與市場策略。',
        results: [
          '形成第二增長曲線',
          '新業務佈局更聚焦',
          '提升組織與戰略方向的一致性'
        ],
        tags: ['增長戰略', '商業模式', '市場洞察']
      },
      {
        id: 4,
        title: '某百強遊戲公司生態戰略重塑',
        industry: '科技',
        region: '中國',
        challenge: '企業希望構建「遊戲+」生態，跨界醫療、科普等領域，但缺乏完整的戰略設計。',
        solution: '透過深度訪談與內外部分析，梳理企業核心優勢，明確跨界方向，並成立可持續發展戰略辦公室。',
        results: [
          '取得國內遊戲產業首個數字療法認證',
          '形成多產業融合的生態路線圖',
          '推動多項跨界研究項目落地'
        ],
        tags: ['生態戰略', '第二增長曲線', '跨界創新']
      },
      {
        id: 5,
        title: '法國大型化妝品集團中國本土化品牌策略',
        industry: '消費品',
        region: '中國',
        challenge: '集團雖具備全球可持續項目，但對中國文化與消費者社會議題理解不足。',
        solution: '基於 2000 份問卷與品牌會員訪談，梳理本土社會議題與消費需求，並設計女性賦能項目支持品牌傳遞。',
        results: [
          '女性自信課程播放量超 10 萬',
          '觸達超 20 萬用戶',
          '提升品牌在可持續領域的影響力'
        ],
        tags: ['本土化', '品牌策略', '消費者洞察']
      },
      {
        id: 6,
        title: '保溫杯龍頭企業自有品牌高端化戰略',
        industry: '消費品',
        region: '全球',
        challenge: '行業競爭趨同，企業希望突破海外品牌的認知壁壘並提升高端競爭力。',
        solution: '圍繞戶外、兒童鈦杯、定製禮品三大賽道設計高端化策略，並完善全球渠道與品牌架構。',
        results: [
          '產品銷售覆蓋 80+ 國家',
          '2022 年營收達 24.28 億元',
          '成功打通高端渠道'
        ],
        tags: ['品牌升級', '高端化', '全球佈局']
      },
      {
        id: 7,
        title: '國際化妝品連鎖品牌綠色產品革新',
        industry: '消費品',
        region: '全球',
        challenge: '美妝行業塑料包裝高速增長，企業需實現綠色轉型並與消費者建立更深情感連結。',
        solution: '從原料、製程到包裝全面導入可持續元素，並深入原產地田調融入扶貧內容，強化產品故事。',
        results: [
          '推出多款綠色產品',
          '提升綠色理念的品牌認同',
          '強化企業社會價值'
        ],
        tags: ['綠色供應鏈', '可持續產品創新', '全鏈策略']
      },
      {
        id: 8,
        title: '智慧終端企業全球可持續發展戰略',
        industry: '科技',
        region: '全球',
        challenge: '需在激烈全球競爭中構建兼具本地化的可持續發展能力。',
        solution: '梳理研發投入、專利佈局、全球工廠體系與智能化產品創新路徑，形成可持續發展總體戰略。',
        results: [
          '累計 631 項專利',
          '推出物聯網智能水杯',
          '提升全球競爭力'
        ],
        tags: ['智慧產品', '國際化', '可持續創新']
      },
      {
        id: 9,
        title: '跨國汽車企業可持續戰略本土化',
        industry: '汽車',
        region: '中國',
        challenge: '需將全球可持續戰略與中國本地需求融合，並優化管理體系。',
        solution: '重新設計戰略目標、流程與組織架構，以提升本地執行力與跨部門協同。',
        results: [
          '成功實現戰略本土化落地',
          '提升跨部門協作效率',
          '優化母子公司管理方式'
        ],
        tags: ['本土化', '組織管理', '戰略整合']
      },
      {
        id: 10,
        title: '全球運動品牌代理 ESG 評級提升與戰略輔導',
        industry: '消費品',
        region: '全球',
        challenge: '企業需提升 ESG 表現以增強全球競爭力與品牌聲譽。',
        solution: '圍繞可持續產品、氣候行動、永續供應鏈及員工與社區投入四大面向進行系統提升並制定 ESG 路線圖。',
        results: [
          '發布行業首份 ESG 報告',
          '完成範圍 1、2 溫室氣體盤查',
          '識別範圍 3 減排潛力並形成改進計畫'
        ],
        tags: ['ESG 評估', '評級提升', '供應鏈管理']
      }
    ]
  };

  const cases = casesByLanguage[language] || casesByLanguage['en-US'];

  const labels = {
    title: language === 'en-US' ? 'Cases' : '成功案例',
    subtitle:
      language === 'en-US'
        ? 'Over the past decades, we have helped many enterprises navigate globalization and growth challenges successfully'
        : language === 'zh-HK'
          ? '在過去的數十年中，我們幫助眾多企業成功應對全球化與增長挑戰'
          : '在过去的数十年中，我们帮助众多企业成功应对全球化和增长挑战',
    challenge: language === 'en-US' ? 'Challenge' : language === 'zh-HK' ? '挑戰' : '挑战',
    solution: language === 'en-US' ? 'Solution' : language === 'zh-HK' ? '解決方案' : '解决方案',
    results: language === 'en-US' ? 'Results' : '成果',
    contactCtaTitle:
      language === 'en-US' ? 'Start your success story with us' : language === 'zh-HK' ? '與我們一起，開啟您的成功故事' : '和我们一起，开启您的成功故事',
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
                  <h4 className="font-medium text-gray-900 mb-3">{labels.challenge}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {caseItem.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">{labels.solution}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {caseItem.solution}
                  </p>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h4 className="font-medium text-gray-900 mb-3">{labels.results}</h4>
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
            {labels.contactCtaTitle}
          </h2>
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
