import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';
import ContactModal from '../components/ContactModal';
import LogoCarousel from '@/components/LogoCarousel';

export default function About() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { language } = useLanguage();
  const labels = {
    title: language === 'en-US' ? 'About Us' : language === 'zh-HK' ? '關於我們' : '关于我们',
    mission: language === 'en-US' ? 'Our Mission' : language === 'zh-HK' ? '我們的使命' : '我们的使命',
    missionDesc: language === 'en-US' ? 'Insight into new growth, universal sustainability' : language === 'zh-HK' ? '洞悉新增長 普惠可持續' : '洞悉新增长 普惠可持续',
    believe: language === 'en-US' ? 'We Believe' : language === 'zh-HK' ? '我們相信' : '我们相信',
    believe1: language === 'en-US' ? 'The future of business lies in creating social good' : language === 'zh-HK' ? '企業的利益與前途在於為社會創造福祉' : '企业的利益和前途在于为社会创造福祉',
    believe2: language === 'en-US' ? 'Social issues contain great business opportunities' : language === 'zh-HK' ? '社會問題中蘊藏著巨大的商業機會' : '社会问题中蕴藏着巨大的商业机会',
    commit: language === 'en-US' ? 'Our Commitment' : language === 'zh-HK' ? '我們致力於' : '我们致力于',
    commit1: language === 'en-US' ? 'Embed sustainability into corporate strategy and actions to achieve growth with positive social value' : language === 'zh-HK' ? '將可持續發展融入企業戰略與行為，幫助企業獲得增長的同時產生正向社會價值' : '将可持续发展融入到企业战略与行为中，帮助企业获得增长的同时产生正向社会价值',
    commit2: language === 'en-US' ? 'Integrate consulting methodologies with AI to democratize sustainability consulting' : language === 'zh-HK' ? '融合管理諮詢方法與AI技術，實現可持續發展諮詢的普惠' : '融合管理咨询方法与AI技术，实现可持续发展咨询的普惠',
    valuesTitle: language === 'en-US' ? 'Our Values' : language === 'zh-HK' ? '我們的價值觀' : '我们的价值观',
    valuesDesc: language === 'en-US' ? 'These core values guide our services and decisions' : language === 'zh-HK' ? '這些核心價值觀指導著我們的每一項服務和決策' : '这些核心价值观指导着我们的每一项服务和决策',
    teamTitle: language === 'en-US' ? 'Our Team' : language === 'zh-HK' ? '我們的團隊' : '我们的团队',
    teamDesc: language === 'en-US' ? 'A professional team of seasoned experts providing excellent consulting services' : language === 'zh-HK' ? '由資深專家組成的專業團隊，為您提供卓越的諮詢服務' : '由资深专家组成的专业团队，为您提供卓越的咨询服务',
    gradTitle: language === 'en-US' ? 'Consultant Education' : language === 'zh-HK' ? '顧問畢業院校' : '顾问毕业院校',
    expTitle: language === 'en-US' ? 'Consultant Experience' : language === 'zh-HK' ? '顧問職業經歷' : '顾问职业经历',
    honorTitle: language === 'en-US' ? 'Team Honors' : language === 'zh-HK' ? '團隊榮譽' : '团队荣誉',
    officesTitle: language === 'en-US' ? 'Our Offices' : language === 'zh-HK' ? '我們的辦公室' : '我们的办公室',
    officesDesc: language === 'en-US' ? 'Offices in major business hubs providing localized services' : language === 'zh-HK' ? '在主要商業中心設有辦公室，為客戶提供本地化服務' : '在主要商业中心设有办公室，为客户提供本地化服务',
    joinTitle: language === 'en-US' ? 'Join Us' : language === 'zh-HK' ? '加入我們' : '加入我们',
    joinDesc: language === 'en-US' ? 'Work with us to advance global sustainable business' : language === 'zh-HK' ? '與我們一起推動全球商業的可持續發展' : '与我们一起推动全球商业的可持续发展',
    contactBtn: language === 'en-US' ? 'Contact Us' : language === 'zh-HK' ? '聯繫我們' : '联系我们'
  };

  // 顾问毕业院校 logo（来自 public/images/universities）
  const universityLogos = [
    '/images/universities/university-cambridge.png',
    '/images/universities/university-oxford.png',
    '/images/universities/university-harvard.png',
    '/images/universities/university-duke.png',
    '/images/universities/university-penn.jpg',
    '/images/universities/university-nyu.png',
    '/images/universities/university-brown.jpg',
    '/images/universities/university-peking.png',
    '/images/universities/university-scientia.jpg',
    '/images/universities/university-lse.png',
    '/images/universities/university-manchester.jpg',
    '/images/universities/university-nottingham.jpg',
    '/images/universities/university-cuhk.png',
    '/images/universities/university-massachusetts.png',
    '/images/universities/university-fudan.png',
    '/images/universities/university-tsinghua.jpg',
    '/images/universities/university-royal-college-of-art.jpg',
    '/images/universities/university-zhejiang.png'
  ];

  // 顾问职业经历 logo（来自 public/images/companies）
  const companyLogos = [
    '/images/companies/company-mckinsey.png',
    '/images/companies/company-bcg.png',
    '/images/companies/company-berger.png',
    '/images/companies/company-nielsen.png',
    '/images/companies/company-bill-melinda-gates.png',
    '/images/companies/company-strategy&.png',
    '/images/companies/company-deloitte.png',
    '/images/companies/company-ibm.png',
    '/images/companies/company-msci.png',
    '/images/companies/company-ant-group.png',
    '/images/companies/company-cicc.png',
    '/images/companies/company-bytedance.png',
    '/images/companies/company-mars.png',
    '/images/companies/company-ey.png',
    '/images/companies/company-tencent.png',
    '/images/companies/company-apple.png',
    '/images/companies/company-alibaba.png',
    '/images/companies/company-sensetime.jpg',
    '/images/companies/company-kwai.png',
    '/images/companies/company-icbc.png',
    '/images/companies/company-bank-of-communications.png',
    '/images/companies/company-accenture.png'
  ];

  // 团队荣誉文本映射
  const honorText = {
    forbes: language === 'en-US' ? '5 Enlisted Forbes 30 Under 30' : language === 'zh-HK' ? '5人登上福布斯30位30歲以下精英' : '5人登上福布斯30位30岁以下精英',
    g20yea: language === 'en-US' ? '2 Enlisted G20 YEA' : language === 'zh-HK' ? '2人入選G20YEA領軍青年' : '2人入选G20YEA领军青年',
    apec: language === 'en-US' ? '2 Enlisted APEC VoF' : language === 'zh-HK' ? '2人入選APEC未來之聲' : '2人入选APEC未来之声',
    wef: language === 'en-US' ? '2 Enlisted WEF Global Shaper' : language === 'zh-HK' ? '2人入選世界經濟論壇全球傑出青年' : '2人入选世界经济论坛全球杰出青年',
    sdgs: language === 'en-US' ? '2 Enlisted UN SDGs Youth Leader' : language === 'zh-HK' ? '2人入選聯合國可持續青年領袖' : '2人入选联合国可持续青年领袖',
    tedx: language === 'en-US' ? '2 Invited By TEDx' : language === 'zh-HK' ? '2人登上TEDx演講' : '2人登上TEDx演讲'
  };

  const values = (language === 'en-US' ? [
    { title: 'Professionalism', description: 'Provide professional solutions based on deep industry knowledge and practical experience' },
    { title: 'Innovation', description: 'Apply latest technologies and methodologies; continuously innovate service models and solutions' },
    { title: 'Sustainability', description: 'Committed to advancing corporate sustainability and creating long-term value' },
    { title: 'Global Perspective', description: 'Possess global vision and cross-cultural understanding to support internationalization' }
  ] : language === 'zh-HK' ? [
    { title: '專業性', description: '基於深厚的行業知識和豐富的實踐經驗，為客戶提供專業的解決方案' },
    { title: '創新性', description: '運用最新的技術和方法論，持續創新服務模式和解決方案' },
    { title: '可持續性', description: '致力於推動企業可持續發展，創造長期價值' },
    { title: '全球視野', description: '具備全球化視野和跨文化理解能力，助力企業國際化發展' }
  ] : [
    { title: '专业性', description: '基于深厚的行业知识和丰富的实践经验，为客户提供专业的解决方案' },
    { title: '创新性', description: '运用最新的技术和方法论，持续创新服务模式和解决方案' },
    { title: '可持续性', description: '致力于推动企业可持续发展，创造长期价值' },
    { title: '全球视野', description: '具备全球化视野和跨文化理解能力，助力企业国际化发展' }
  ]);

  // 办公室中英地址（按中文顺序：杭州、上海、北京、沈阳、香港）
  const offices = [
    {
      cityZh: '杭州',
      cityEn: 'Hangzhou',
      addressZh: '杭州市萧山区鸿宁路广孚联合国际中心2402室',
      addressEn: 'Room 2402, Guangfu International Center Hongning Road, Xiaoshan District'
    },
    {
      cityZh: '上海',
      cityEn: 'Shanghai',
      addressZh: '上海市虹口区东大名路501号白玉兰广场42层',
      addressEn: '42/F, Magnolia Plaza, 501 East Da Ming Road, Hongkou District'
    },
    {
      cityZh: '北京',
      cityEn: 'Beijing',
      addressZh: '北京市朝阳区新源南路6号京城大厦 1805 室',
      addressEn: 'Room 1805, Capital Mansion 6 Xinyuan South Road, Chaoyang District'
    },
    {
      cityZh: '沈阳',
      cityEn: 'Shenyang',
      addressZh: '沈阳市沈抚新区彰武路李石经济区管委会大楼3层',
      addressEn: '3/F, Li Shi Economic Zone Committee Bldg Zhangwu Road, Shenfu New District'
    },
    {
      cityZh: '香港',
      cityEn: 'Hong Kong',
      addressZh: '香港新界沙田安耀街3号汇达大厦2605室',
      addressEn: 'Room 1318-19, Hollywood Plaza 610 Nathan Road, Mong Kok, Kowloon'
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
          {labels.title}
        </h1>
      </motion.div>

      {/* Company Introduction - 三个小标题与文字（左侧上下两个，右侧一个） */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
      >
        <div className="bg-gray-50 p-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* 左侧：上下两个块 */}
            <div className="space-y-6">
              <div className="bg-white p-6 border border-gray-200 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{labels.mission}</h3>
                <p className="text-gray-700 text-base leading-relaxed flex-1">{labels.missionDesc}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{labels.believe}</h3>
                <div className="space-y-2 flex-1">
                  <p className="text-gray-700 text-base leading-relaxed">{labels.believe1}</p>
                  <p className="text-gray-700 text-base leading-relaxed">{labels.believe2}</p>
                </div>
              </div>
            </div>
            {/* 右侧：一个块 */}
            <div className="bg-white p-6 border border-gray-200 flex flex-col justify-around">
              <h3 className="text-lg font-medium text-gray-900">{labels.commit}</h3>
              <div className="space-y-4">
                <p className="text-gray-700 text-base leading-relaxed">{labels.commit1}</p>
                <p className="text-gray-700 text-base leading-relaxed">{labels.commit2}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Values */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-6">{labels.valuesTitle}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{labels.valuesDesc}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="text-center"
            >
              <div className="bg-gray-50 p-8 h-full">
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-6">{labels.teamTitle}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{labels.teamDesc}</p>
        </div>
        {/* 顾问毕业院校 */}
        <div className="bg-white p-6 md:p-8 mb-8">
          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 md:mb-3">{labels.gradTitle}</h3>
          <div className="mt-4 md:mt-6">
            <LogoCarousel
              logos={universityLogos}
              directions={["right", "right"]}
              variant="card"
              boxed
              syncRows
              itemWidth={90}
              itemHeight={54}
              gapClassName="gap-4 md:gap-6"
              imageClassName="max-w-full max-h-full object-contain"
              speed={1.2}
            />
          </div>
        </div>

        {/* 顾问职业经历 */}
        <div className="bg-white p-6 md:p-8 mb-12">
          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 md:mb-3">{labels.expTitle}</h3>
          <div className="mt-4 md:mt-6">
            <LogoCarousel
              logos={companyLogos}
              directions={["right", "right"]}
              variant="card"
              boxed
              syncRows
              itemWidth={90}
              itemHeight={54}
              gapClassName="gap-4 md:gap-6"
              imageClassName="max-w-full max-h-full object-contain"
              speed={1.2}
            />
          </div>
        </div>

        {/* 团队荣誉（白底黑字自定义排版） */}
        <div className="bg-white p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-6">{labels.honorTitle}</h3>
          <div className="border border-gray-200 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 lg:auto-rows-[150px] gap-6">
            {/* 左列：Forbes 30 Under 30（加大） */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white p-4 md:p-6 lg:col-span-4 lg:row-span-2 flex h-full flex-col"
            >
              <div className="flex-1 w-full flex items-center justify-center">
                <img src="/images/achievements/achievement-forbes-under-30.png" alt="Forbes 30 Under 30" className="h-44 md:h-52 object-contain" />
              </div>
              <p className="mt-2 text-xs md:text-sm text-gray-900 text-center">{honorText.forbes}</p>
            </motion.div>

            {/* 中列：上 G20YEA，下 APEC */}
            <div className="space-y-8 lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white p-4 md:p-6 flex h-full flex-col min-h-[150px]"
              >
                <div className="flex-1 w-full flex items-center justify-center">
                  <img src="/images/achievements/achievement-g20-yea.png" alt="G20YEA" className="h-12 md:h-14 object-contain" />
                </div>
                <p className="mt-2 text-xs md:text-sm text-gray-900 text-center whitespace-nowrap">{honorText.g20yea}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white p-4 md:p-6 flex h-full flex-col min-h-[150px]"
              >
                <div className="flex-1 w-full flex items-center justify-center">
                  <img src="/images/achievements/achievement-apec.jpeg" alt="APEC" className="h-10 md:h-12 object-contain" />
                </div>
                <p className="mt-2 text-xs md:text-sm text-gray-900 text-center whitespace-nowrap">{honorText.apec}</p>
              </motion.div>
            </div>

            {/* 右列：上 WEF左右 logo 与共用文字；下并排 SDGs 与 TEDx */}
            <div className="space-y-8 lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white p-4 md:p-6 flex h-full flex-col min-h-[150px]"
              >
                <div className="flex-1 w-full flex items-center justify-center gap-6">
                  <img src="/images/achievements/achievement-wef-left.png" alt="WEF Left" className="h-14 md:h-16 object-contain" />
                  <img src="/images/achievements/achievement-wef-right.png" alt="WEF Right" className="h-14 md:h-16 object-contain" />
                </div>
                <p className="mt-2 text-xs md:text-sm text-center text-gray-900 whitespace-nowrap">{honorText.wef}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white p-4 md:p-6 flex h-full flex-col min-h-[150px]"
              >
                <div className="flex-1 w-full grid grid-cols-2 gap-6 items-center justify-items-center">
                  <img src="/images/achievements/achievement-youths-for-sdgs.png" alt="Youths for SDGs" className="h-16 md:h-20 object-contain" />
                  <img src="/images/achievements/achievement-tedx.png" alt="TEDx" className="h-6 md:h-10 object-contain" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <p className="mt-2 text-xs md:text-sm text-gray-900 text-center whitespace-nowrap">{honorText.sdgs}</p>
                  <p className="mt-2 text-xs md:text-sm text-gray-900 text-center whitespace-nowrap">{honorText.tedx}</p>
                </div>
              </motion.div>
            </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Offices */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-6">{labels.officesTitle}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{labels.officesDesc}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {offices.map((office, index) => (
            <motion.div
              key={language === 'en-US' ? office.cityEn : office.cityZh}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 * index }}
              className="bg-gray-50 border border-gray-200 p-6 md:p-6 w-full sm:basis-[48%] md:basis-[31%]"
            >
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {language === 'en-US' ? office.cityEn : language === 'zh-HK' ? convertToTraditional(office.cityZh) : office.cityZh}
              </h3>
              <p className="text-gray-700 leading-relaxed tracking-tight">
                {language === 'en-US' ? office.addressEn : language === 'zh-HK' ? convertToTraditional(office.addressZh) : office.addressZh}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gray-50 p-12"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-6">{labels.joinTitle}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{labels.joinDesc}</p>
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
