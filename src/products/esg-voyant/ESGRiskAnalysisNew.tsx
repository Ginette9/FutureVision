import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LogoCarousel from '@/components/LogoCarousel';
import NewDemoPlayer from './NewDemoPlayer';
import ContactModal from '@/components/ContactModal';
import InviteCodeModal from '@/components/InviteCodeModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';
import { apiPost } from '@/lib/utils';

export default function ESGRiskAnalysisNew() {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const { language } = useLanguage();

  const L = {
    hero1: language === 'en-US' ? 'Stop Paying Tuition Overseas' : language === 'zh-HK' ? '停止在海外交學費' : '停止在海外交学费',
    hero2: language === 'en-US' ? 'Avoid failing beyond compliance on ESG risks' : language === 'zh-HK' ? '避免ESG風險層面合規卻失守' : '避免ESG风险层面合规却失守',
    productSubtitle: language === 'en-US' ? 'AI-driven global ESG risk decision support system' : language === 'zh-HK' ? '人工智能驅動的全球ESG風險決策支持系統' : '人工智能驱动的全球ESG风险决策支持系统',
    vp1t: language === 'en-US' ? 'expensive local due diligence' : language === 'zh-HK' ? '高額在地化背調成本' : '高额在地化背调成本',
    vp1d: language === 'en-US' ? 'No more paying for' : language === 'zh-HK' ? '不再需要支付' : '不再需要支付',
    vp2t: language === 'en-US' ? 'missing hidden risks beyond compliance' : language === 'zh-HK' ? '遺漏合規之外的隱性風險' : '遗漏合规之外的隐性风险',
    vp2d: language === 'en-US' ? 'No more worrying about' : language === 'zh-HK' ? '不再需要擔心' : '不再需要担心',
    vp3t: language === 'en-US' ? 'heavy financial and reputational losses' : language === 'zh-HK' ? '高昂的財務損失與聲譽損害' : '高昂的财务损失与声誉损害',
    vp3d: language === 'en-US' ? 'No more suffering' : language === 'zh-HK' ? '不再需要承受' : '不再需要承受',
    coreStmt: language === 'en-US' ? 'Build 100% ESG risk defense' : language === 'zh-HK' ? '構築100%的ESG風險防線' : '构筑100%的ESG风险防线',
    coverage: language === 'en-US' ? 'Comprehensive Coverage' : language === 'zh-HK' ? '全面覆蓋' : '全面覆盖',
    chip1: language === 'en-US' ? 'ESG Compliance Assessment' : language === 'zh-HK' ? 'ESG合規評估' : 'ESG合规评估',
    chip2: language === 'en-US' ? 'Major Social & Environmental Risk Identification' : language === 'zh-HK' ? '重大社會與環境風險識別' : '重大社会与环境风险识别',
    chip3: language === 'en-US' ? 'Pre-investment Risk Control for Factory Establishment/Mergers & Acquisitions/Supply Chain Layout' : language === 'zh-HK' ? '投資建廠/併購/供應鏈佈局前置風控' : '投资建厂/并购/供应链布局前置风控',
    chip4: language === 'en-US' ? 'Continuous Monitoring/Alert/Disposal of Compliance & Hidden Risks' : language === 'zh-HK' ? '合規及隱性風險\n持續監控/預警/處置' : '合规及隐性风险\n持续监控/预警/处置',
    stat1: language === 'en-US' ? 'Countries & Regions' : language === 'zh-HK' ? '國家與地區' : '国家与地区',
    stat2: language === 'en-US' ? 'GICS Industries' : language === 'zh-HK' ? 'GICS行業' : 'GICS行业',
    stat3: language === 'en-US' ? 'Trusted Data Sources' : language === 'zh-HK' ? '可靠數據來源' : '可靠数据来源',
    stat4: language === 'en-US' ? 'Risk Items' : language === 'zh-HK' ? '風險事項' : '风险事项',
    stat5: language === 'en-US' ? 'Global ESG Conflict Cases' : language === 'zh-HK' ? '全球ESG衝突案例' : '全球ESG冲突案例',
    stat6: language === 'en-US' ? 'Localized NGOs & Sustainability Communities' : language === 'zh-HK' ? '在地化NGO與可持續關注社群' : '在地化NGO与可持续关注社群',
    feat1: language === 'en-US' ? 'Sensitive Topic Assessment' : language === 'zh-HK' ? '敏感議題評估' : '敏感议题评估',
    feat2: language === 'en-US' ? 'Supply Chain Risk Analysis' : language === 'zh-HK' ? '供應鏈風險分析' : '供应链风险分析',
    feat3: language === 'en-US' ? 'ESG Trend Forecast' : language === 'zh-HK' ? 'ESG趨勢預判' : 'ESG趋势预判',
    feat4: language === 'en-US' ? 'High-Risk Alerts' : language === 'zh-HK' ? '高風險預警' : '高风险预警',
    feat5: language === 'en-US' ? 'Conflict Case Analysis' : language === 'zh-HK' ? '衝突案例分析' : '冲突案例分析',
    feat6: language === 'en-US' ? 'Localized Risk Management' : language === 'zh-HK' ? '在地化風險管理' : '在地化风险管理',
    flowTitle: language === 'en-US' ? 'Start Your ESGVoyant Journey Now' : language === 'zh-HK' ? '即刻開啟ESGVoyant體驗之旅' : '即刻开启ESGVoyant体验之旅',
    flowSub: language === 'en-US' ? 'Get your exclusive ESG risk analysis report, comprehensively covering compliance and hidden ESG risks' : language === 'zh-HK' ? '獲取專屬ESG風險分析報告，全面覆蓋合規及隱性ESG風險' : '获取专属ESG风险分析报告，全面覆盖合规及隐性ESG风险',
    step1: language === 'en-US' ? 'Step 1' : 'Step 1',
    step1t: language === 'en-US' ? 'Get Invitation Code' : language === 'zh-HK' ? '獲取邀請碼' : '获取邀请码',
    step2: language === 'en-US' ? 'Step 2' : 'Step 2',
    step2t: language === 'en-US' ? 'Enter Industry & Country' : language === 'zh-HK' ? '輸入所屬行業與國家' : '输入所属行业与国家',
    step3: language === 'en-US' ? 'Step 3' : 'Step 3',
    step3t: language === 'en-US' ? 'AI Intelligent Analysis' : language === 'zh-HK' ? 'AI智能分析' : 'AI智能分析',
    step4: language === 'en-US' ? 'Step 4' : 'Step 4',
    step4t: language === 'en-US' ? 'View full report' : language === 'zh-HK' ? '查看完整報告' : '查看完整报告',
    step5: language === 'en-US' ? 'Step 5' : 'Step 5',
    step5t: language === 'en-US' ? 'Customize report' : language === 'zh-HK' ? '定制報告' : '定制报告',
    ctaUse: language === 'en-US' ? 'Experience & Invitation Code Entry' : language === 'zh-HK' ? '體驗及邀請碼獲取入口' : '体验及邀请码获取入口',
    nexusTitle: 'ESGNexus',
    nexusDesc: language === 'en-US' ? 'Global localized ESG risk management consulting suite, ensuring your business is secure, resilient and sustainable worldwide' : language === 'zh-HK' ? '全球在地化ESG風險管理諮詢服務套件，確保您的業務在全球安全、穩健、可持續' : '全球在地化ESG风险管理咨询服务套件，确保您的业务在全球安全、稳健、可持续',
    nexusList: (language === 'en-US'
      ? [
          'Localized ESG risk assessment (cross-border compliance + hidden risks)',
          'ESG risk monitoring and alerts',
          'Sustainability strategy execution and ESG governance building',
          'Stakeholder engagement and relationship building',
          'ESG crisis planning and conflict response',
          'Ongoing ESG disclosure and communication'
        ]
      : language === 'zh-HK'
        ? [
            '全球在地化ESG風險評估（跨國合規+隱性風險）',
            'ESG風險監控與告警',
            '可持續發展戰略落地與ESG治理體系建設',
            '在地化利害關係人溝通與關係搭建',
            'ESG危機預案與衝突應對',
            'ESG持續披露與溝通'
          ]
        : [
            '全球在地化ESG风险评估（跨国合规+隐性风险）',
            'ESG风险监控与告警',
            '可持续发展战略落地与ESG治理体系建设',
            '在地化利益相关方沟通与关系搭建',
            'ESG危机预案与冲突应对',
            'ESG持续披露与沟通'
          ]),
    contactAdvisor: language === 'en-US' ? 'Contact Your Advisor' : language === 'zh-HK' ? '聯繫專屬顧問' : '联系专属顾问',
    trustTitle: language === 'en-US' ? 'Trusted by These Leading Companies' : language === 'zh-HK' ? '已獲得這些知名企業信任' : '已获得这些知名企业信任',
    // 定价相关翻译
    priceTitle: language === 'en-US' ? 'Only 1% of the investment required' : language === 'zh-HK' ? '只需1%的投入' : '只需1%的投入',
    basicPlan: language === 'en-US' ? 'Basic Plan' : language === 'zh-HK' ? '基礎版' : '基础版',
    professionalPlan: language === 'en-US' ? 'Professional Plan' : language === 'zh-HK' ? '專業版' : '专业版',
    enterprisePlan: language === 'en-US' ? 'Enterprise Plan' : language === 'zh-HK' ? '旗艦版' : '旗舰版',
    customPlan: language === 'en-US' ? 'Custom Plan' : language === 'zh-HK' ? '定制版' : '定制版',
    annualBilling: language === 'en-US' ? 'Billed Annually' : language === 'zh-HK' ? '按年計費' : '按年计费',
    projectBased: language === 'en-US' ? 'Project-based' : language === 'zh-HK' ? '項目制' : '项目制',
    onDemand: language === 'en-US' ? 'On-demand Billing' : language === 'zh-HK' ? '按需計費' : '按需计费',
    mostPopular: language === 'en-US' ? 'Most Popular' : language === 'zh-HK' ? '最受歡迎' : '最受欢迎',
    perfectFor: language === 'en-US' ? 'Perfect For' : language === 'zh-HK' ? '非常適合' : '非常适合',
    memberBenefits: language === 'en-US' ? 'Member Benefits' : language === 'zh-HK' ? '會員權益' : '会员权益',
    serviceScope: language === 'en-US' ? 'Service Scope' : language === 'zh-HK' ? '服務範圍' : '服务范围',
    selectPlan: language === 'en-US' ? 'Select Plan' : language === 'zh-HK' ? '選擇套餐' : '选择套餐',
    contactUs: language === 'en-US' ? 'Contact Us' : language === 'zh-HK' ? '聯繫我們' : '联系我们',
    // 基础版内容
    basicPerfectFor: language === 'en-US' ? 'First-time overseas expansion\nCross-border e-commerce/luxury manufacturing/foreign trade enterprises' : language === 'zh-HK' ? '首次出海\n跨境電商/輕奢製造/外貿企業' : '首次出海\n跨境电商/轻奢制造/外贸企业',
    basicBenefit1: language === 'en-US' ? 'Countries & Regions Covered: 20' : language === 'zh-HK' ? '覆蓋國家和地區 20個' : '覆盖国家和地区 20个',
    basicBenefit2: language === 'en-US' ? 'Industries Covered: 5' : language === 'zh-HK' ? '覆蓋行業 5個' : '覆盖行业 5个',
    basicBenefit3: language === 'en-US' ? 'Annual Reports Generated: 100' : language === 'zh-HK' ? '年度生成報告 100份' : '年度生成报告 100份',
    basicBenefit4: language === 'en-US' ? 'Quarterly Data Updates' : language === 'zh-HK' ? '按季度更新數據' : '按季度更新数据',
    basicBenefit5: language === 'en-US' ? 'PDF Export Support' : language === 'zh-HK' ? '支持導出PDF' : '支持导出PDF',
    // 专业版内容
    professionalPerfectFor: language === 'en-US' ? 'Multi-country layout listed companies/planned listed companies\nOverseas factories/offices' : language === 'zh-HK' ? '多國家佈局上市企業/擬上市企業\n海外設廠/辦事處' : '多国家布局上市企业/拟上市企业\n海外设厂/办事处',
    professionalBenefit1: language === 'en-US' ? 'Countries & Regions Covered: 50' : language === 'zh-HK' ? '覆蓋國家和地區 50個' : '覆盖国家和地区 50个',
    professionalBenefit2: language === 'en-US' ? 'Industries Covered: 10' : language === 'zh-HK' ? '覆蓋行業 10個' : '覆盖行业 10个',
    professionalBenefit3: language === 'en-US' ? 'Annual Reports Generated: 500' : language === 'zh-HK' ? '年度生成報告 500份' : '年度生成报告 500份',
    professionalBenefit4: language === 'en-US' ? 'Monthly Data Updates' : language === 'zh-HK' ? '按月度更新數據' : '按月度更新数据',
    professionalBenefit5: language === 'en-US' ? 'PDF/Word Export Support' : language === 'zh-HK' ? '支持導出PDF/Word' : '支持导出PDF/Word',
    professionalBenefit6: language === 'en-US' ? 'Country Comparison Support' : language === 'zh-HK' ? '支持國家間對比' : '支持国家间对比',
    // 旗舰版内容
    enterprisePerfectFor: language === 'en-US' ? 'High-compliance assets/high ESG regulatory pressure\nManufacturing/energy/mining/infrastructure enterprises\nOverseas mergers & acquisitions/park investments' : language === 'zh-HK' ? '高合規資產/高ESG監管壓力\n製造業/能源/礦業/基建類企業\n海外並購/園區投資' : '高合规资产/高ESG监管压力\n制造业/能源/矿业/基建类企业\n海外并购/园区投资',
    enterpriseBenefit1: language === 'en-US' ? 'Countries & Regions Covered: 252' : language === 'zh-HK' ? '覆蓋國家和地區 252個' : '覆盖国家和地区 252个',
    enterpriseBenefit2: language === 'en-US' ? 'Industries Covered: 471' : language === 'zh-HK' ? '覆蓋行業 471個' : '覆盖行业 471个',
    enterpriseBenefit3: language === 'en-US' ? 'Annual Reports Generated: Unlimited' : language === 'zh-HK' ? '年度生成報告 不限' : '年度生成报告 不限',
    enterpriseBenefit4: language === 'en-US' ? 'Weekly Data Updates' : language === 'zh-HK' ? '按周更新數據' : '按周更新数据',
    enterpriseBenefit5: language === 'en-US' ? 'PDF/Word Export Support' : language === 'zh-HK' ? '支持導出PDF/Word' : '支持导出PDF/Word',
    enterpriseBenefit6: language === 'en-US' ? 'Country/Industry Comparison Support' : language === 'zh-HK' ? '支持國家/行業間對比' : '支持国家/行业间对比',
    enterpriseBenefit7: language === 'en-US' ? 'API Interface Support' : language === 'zh-HK' ? '支持API接口' : '支持API接口',
    enterpriseBenefit8: language === 'en-US' ? '4 Major Risk Alerts Annually' : language === 'zh-HK' ? '每年4次重大風險預警' : '每年4次重大风险预警',
    // 定制版内容
    customPerfectFor: language === 'en-US' ? 'Fortune 500 enterprises\nFinancial institutions/investment banks/funds\nCentral enterprises/overseas M&A institutions' : language === 'zh-HK' ? '世界500強企業\n金融機構/投行/基金\n央企/海外並購機構' : '世界500强企业\n金融机构/投行/基金\n央企/海外并购机构',
    customBenefit1: language === 'en-US' ? 'Basic Plan Member Benefits Included' : language === 'zh-HK' ? '贈送基礎版會員權益' : '赠送基础版会员权益',
    customBenefit2: language === 'en-US' ? 'National-level Deep Customization' : language === 'zh-HK' ? '國家級深度定制' : '国家级深度定制',
    customBenefit3: language === 'en-US' ? 'Regional White Papers/Research Reports' : language === 'zh-HK' ? '區域白皮書/調研報告' : '区域白皮书/调研报告',
    customBenefit4: language === 'en-US' ? 'M&A Risk Control Model' : language === 'zh-HK' ? '並購風控模型' : '并购风控模型',
    customBenefit5: language === 'en-US' ? 'ESG Monitoring and Audit System' : language === 'zh-HK' ? 'ESG監控與審核系統' : 'ESG监控与审核系统',
    customBenefit6: language === 'en-US' ? 'Unconventional ESG Risk Identification and Assessment' : language === 'zh-HK' ? '非傳統ESG風險識別與評估' : '非常规ESG风险识别与评估',
    customBenefit7: language === 'en-US' ? 'Supply Chain ESG Risk Control' : language === 'zh-HK' ? '供應鏈ESG風控' : '供应链ESG风控',
    customBenefit8: language === 'en-US' ? 'Crisis Preparedness and Localized Disposal' : language === 'zh-HK' ? '危機預案與在地化處置' : '危机预案与在地化处置'
  };

  const handleGetStarted = () => {
    // 显示邀请码模态框
    setShowInviteCodeModal(true);
  };

  const renderWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleInviteCodeSuccess = () => {
    // 邀请码验证成功后跳转到本地表单页面，并传递邀请码参数（确保去除空格）
    navigate(`/esg-voyant/form?invite-code=${encodeURIComponent(inviteCode.trim())}`);
  };

  const handleGetUnlimitedPlan = () => {
    // 处理无限计划订购
    console.log('订购无限计划');
  };

  const handleBuyWhitepaper = () => {
    // 处理白皮书购买
    console.log('购买白皮书');
  };

  const handleContactAdvisor = () => {
    setIsContactOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 核心价值主张 */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-900 mb-6 sm:mb-8 tracking-tight leading-tight">{L.hero1}</h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-light text-slate-600 mb-6">{L.hero2}</h2>
          </motion.div>
        </div>
      </section>

      {/* 第一个板块：ESGVoyant + ESGNexus */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-900 mb-4">
              ESGVoyant
            </h3>
            <p className="text-lg sm:text-xl text-slate-600 mb-3 leading-relaxed">{L.productSubtitle}</p>
          </motion.div>

          {/* Value Propositions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 md:p-10 grid md:grid-cols-3 gap-6 md:gap-10 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <h4 className="text-lg sm:text-xl text-slate-600 mb-3">{L.vp1t}</h4>
              <p className="font-medium text-slate-900 leading-relaxed text-base sm:text-lg">{L.vp1d}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <h4 className="text-lg sm:text-xl text-slate-600 mb-3">{L.vp2t}</h4>
              <p className="font-medium text-slate-900 leading-relaxed text-base sm:text-lg">{L.vp2d}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <h4 className="text-lg sm:text-xl text-slate-600 mb-3">{L.vp3t}</h4>
              <p className="font-medium text-slate-900 leading-relaxed text-base sm:text-lg">{L.vp3d}</p>
            </motion.div>
          </div>

          {/* ESGNexus Section - 延伸定制化产品 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 md:p-12">
                <p className="text-lg sm:text-xl text-slate-600 text-center max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed">{language === 'en-US' ? 'One-stop solution to ensure your business is secure, resilient, and sustainable worldwide' : language === 'zh-HK' ? '一站式解決方案，確保您的業務在全球安全、穩健、可持續' : '一站式解决方案，确保您的业务在全球安全、稳健、可持续'}</p>
              <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {L.nexusList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 sm:p-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 text-white text-xs sm:text-sm flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <p className="text-base sm:text-lg text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <button
                  onClick={handleContactAdvisor}
                  className="bg-slate-900 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium text-base"
                >
                  {L.contactAdvisor}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

          {/* 第二个板块：构筑100%的ESG风险防线 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-slate-900 mb-6 sm:mb-8 md:mb-10 leading-relaxed">{L.coreStmt}</h3>
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 md:p-10">
              <div className="mb-4 md:mb-6">
                <span className="inline-block text-xl sm:text-2xl md:text-2xl font-medium text-slate-900 tracking-tight">{L.coverage}</span>
              </div>
              {/* Helper function to handle line breaks */}
              {(() => {
                const renderWithLineBreaks = (text: string) => {
                  return text.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ));
                };

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-slate-700 mb-12 md:mb-16">
                    <div className="text-center text-sm md:text-base bg-slate-50 rounded-lg py-4 px-4 flex items-center justify-center min-h-[80px] md:min-h-[100px]">{renderWithLineBreaks(L.chip1)}</div>
                    <div className="text-center text-sm md:text-base bg-slate-50 rounded-lg py-4 px-4 flex items-center justify-center min-h-[80px] md:min-h-[100px]">{renderWithLineBreaks(L.chip2)}</div>
                    <div className="text-center text-sm md:text-base bg-slate-50 rounded-lg py-4 px-4 flex items-center justify-center min-h-[80px] md:min-h-[100px]">{renderWithLineBreaks(L.chip3)}</div>
                    <div className="text-center text-sm md:text-base bg-slate-50 rounded-lg py-4 px-4 flex items-center justify-center min-h-[80px] md:min-h-[100px]">{renderWithLineBreaks(L.chip4)}</div>
                  </div>
                );
              })()}
              <div className="mt-6 sm:mt-8 md:mt-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6 text-center mb-6 sm:mb-8 md:mb-10">
                  <div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-light text-slate-900 mb-1 md:mb-2">252</div>
                    <div className="text-xs sm:text-sm text-slate-500">{L.stat1}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-light text-slate-900 mb-1 md:mb-2">471</div>
                    <div className="text-xs sm:text-sm text-slate-500">{L.stat2}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-light text-slate-900 mb-1 md:mb-2">4,000+</div>
                    <div className="text-xs sm:text-sm text-slate-500">{L.stat3}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-light text-slate-900 mb-1 md:mb-2">5,500+</div>
                    <div className="text-xs sm:text-sm text-slate-500">{L.stat4}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-light text-slate-900 mb-1 md:mb-2">10,000+</div>
                    <div className="text-xs sm:text-sm text-slate-500">{L.stat5}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-light text-slate-900 mb-1 md:mb-2">30,000+</div>
                    <div className="text-xs sm:text-sm text-slate-500">{L.stat6}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                  {[
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: L.feat1 },
                    { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', title: L.feat2 },
                    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: L.feat3 },
                    { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z', title: L.feat4 },
                    { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: L.feat5 },
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: L.feat6 }
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors mb-2 md:mb-3">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 text-center">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="text-center mb-20"
          >
            <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-8">{L.priceTitle}</h3>
          </motion.div>

          {/* Four Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* First Card - 基础版 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.7 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-slate-900 mb-2">{L.basicPlan}</h4>
                <div className="text-3xl font-light text-slate-900">¥19,800</div>
                <div className="text-sm text-slate-500 mt-1">{L.annualBilling}</div>
              </div>
              <div className="mb-8 flex-1">
                <div className="border-t border-slate-200 pt-4 mb-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.perfectFor}</div>
                  <div className="text-sm text-slate-700">{renderWithLineBreaks(L.basicPerfectFor)}</div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.memberBenefits}</div>
                  <div className="text-sm text-slate-700 space-y-2">
                    <div>{L.basicBenefit1}</div>
                    <div>{L.basicBenefit2}</div>
                    <div>{L.basicBenefit3}</div>
                    <div>{L.basicBenefit4}</div>
                    <div>{L.basicBenefit5}</div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-slate-100 text-slate-900 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium mt-4"
              >
                {L.selectPlan}
              </button>
            </motion.div>

            {/* Second Card - 专业版 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200 flex flex-col relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full">{L.mostPopular}</div>
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-slate-900 mb-2">{L.professionalPlan}</h4>
                <div className="text-3xl font-light text-blue-700">¥69,800</div>
                <div className="text-sm text-slate-500 mt-1">{L.annualBilling}</div>
              </div>
              <div className="mb-8 flex-1">
                <div className="border-t border-slate-200 pt-4 mb-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.perfectFor}</div>
                  <div className="text-sm text-slate-700">{renderWithLineBreaks(L.professionalPerfectFor)}</div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.memberBenefits}</div>
                  <div className="text-sm text-slate-700 space-y-2">
                    <div>{L.professionalBenefit1}</div>
                    <div>{L.professionalBenefit2}</div>
                    <div>{L.professionalBenefit3}</div>
                    <div>{L.professionalBenefit4}</div>
                    <div>{L.professionalBenefit5}</div>
                    <div>{L.professionalBenefit6}</div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium mt-4"
              >
                {L.selectPlan}
              </button>
            </motion.div>

            {/* Third Card - 旗舰版 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.9 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-slate-900 mb-2">{L.enterprisePlan}</h4>
                <div className="text-3xl font-light text-slate-900">¥188,000</div>
                <div className="text-sm text-slate-500 mt-1">{L.annualBilling}</div>
              </div>
              <div className="mb-8 flex-1">
                <div className="border-t border-slate-200 pt-4 mb-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.perfectFor}</div>
                  <div className="text-sm text-slate-700">{renderWithLineBreaks(L.enterprisePerfectFor)}</div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.memberBenefits}</div>
                  <div className="text-sm text-slate-700 space-y-2">
                    <div>{L.enterpriseBenefit1}</div>
                    <div>{L.enterpriseBenefit2}</div>
                    <div>{L.enterpriseBenefit3}</div>
                    <div>{L.enterpriseBenefit4}</div>
                    <div>{L.enterpriseBenefit5}</div>
                    <div>{L.enterpriseBenefit6}</div>
                    <div>{L.enterpriseBenefit7}</div>
                    <div>{L.enterpriseBenefit8}</div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-slate-100 text-slate-900 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium mt-4"
              >
                {L.selectPlan}
              </button>
            </motion.div>

            {/* Fourth Card - 定制版 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-slate-900 mb-2">{L.customPlan}</h4>
                <div className="text-2xl font-light text-slate-900">{L.onDemand}</div>
                <div className="text-sm text-slate-500 mt-1">{L.projectBased}</div>
              </div>
              <div className="mb-8 flex-1">
                <div className="border-t border-slate-200 pt-4 mb-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.perfectFor}</div>
                  <div className="text-sm text-slate-700">{renderWithLineBreaks(L.customPerfectFor)}</div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{L.serviceScope}</div>
                  <div className="text-sm text-slate-700 space-y-2">
                    <div>{L.customBenefit1}</div>
                    <div>{L.customBenefit2}</div>
                    <div>{L.customBenefit3}</div>
                    <div>{L.customBenefit4}</div>
                    <div>{L.customBenefit5}</div>
                    <div>{L.customBenefit6}</div>
                    <div>{L.customBenefit7}</div>
                    <div>{L.customBenefit8}</div>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleGetStarted}
                className="w-full bg-slate-100 text-slate-900 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium mt-4"
              >
                {L.contactUs}
              </button>
            </motion.div>
          </div>
        </div>
       </section>

      {/* Usage Flow Section - 移到最后 */}
      <section id="usage-flow" className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-900 mb-6">{L.flowTitle}</h3>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">{L.flowSub}</p>
          </motion.div>

          <div className="mb-16">
            <NewDemoPlayer />
          </div>

          {/* 注意：步骤卡片现在由NewDemoPlayer组件内部管理，这里不再需要显示 */}
          <div className="text-center">
            <button
              onClick={handleGetStarted}
              className="bg-slate-900 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg hover:bg-slate-800 transition-colors font-medium text-base sm:text-lg shadow-lg hover:shadow-xl"
            >
              {L.ctaUse}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
          </motion.div>
        </div>
      </section>

      {/* Customer Logos Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-light text-slate-900 mb-4">{L.trustTitle}</h3>
          </motion.div>
          <LogoCarousel />
        </div>
      </section>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <InviteCodeModal
          isOpen={showInviteCodeModal}
          onClose={() => setShowInviteCodeModal(false)}
          onSuccess={handleInviteCodeSuccess}
          onCodeChange={setInviteCode}
          onContactAdvisor={() => setIsContactOpen(true)}
        />
    </div>
  );
}