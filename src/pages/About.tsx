import { motion } from 'framer-motion';
import { useState } from 'react';
import ContactModal from '../components/ContactModal';

export default function About() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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

  // 团队荣誉（白底），每个 logo 与对应文字（来自 public/images/achievements）
  const achievementItems = [
    {
      src: '/images/achievements/achievement-forbes-under-30.png',
      label: '5人登上福布斯30位30岁以下精英'
    },
    {
      src: '/images/achievements/achievement-g20-yea.png',
      label: '2人入选G20YEA领军青年'
    },
    {
      src: '/images/achievements/achievement-apec.png',
      label: '2人入选APEC未来之声'
    },
    {
      src: '/images/achievements/achievement-wef-left.png',
      label: '2人入选世界经济论坛全球杰出青年'
    },
    {
      src: '/images/achievements/achievement-wef-right.png',
      label: '2人入选世界经济论坛全球杰出青年'
    },
    {
      src: '/images/achievements/achievement-youth-for-sdgs.png',
      label: '2人入选联合国可持续青年领袖'
    },
    {
      src: '/images/achievements/achievement-tedx.png',
      label: '2人登上TEDx演讲'
    }
  ];

  const values = [
    {
      title: '专业性',
      description: '基于深厚的行业知识和丰富的实践经验，为客户提供专业的解决方案'
    },
    {
      title: '创新性',
      description: '运用最新的技术和方法论，持续创新服务模式和解决方案'
    },
    {
      title: '可持续性',
      description: '致力于推动企业可持续发展，创造长期价值'
    },
    {
      title: '全球视野',
      description: '具备全球化视野和跨文化理解能力，助力企业国际化发展'
    }
  ];

  const offices = [
    {
      city: '杭州',
      address: '杭州市萧山区鸿宁路广孚联合国际中心2402室'
    },
    {
      city: '上海',
      address: '上海市虹口区东大名路501号白玉兰广场42层'
    },
    {
      city: '北京',
      address: '北京市朝阳区新源南路6号京城大厦 1805 室'
    },
    {
      city: '沈阳',
      address: '沈阳市沈抚新区彰武路李石经济区管委会大楼3层'
    },
    {
      city: '香港',
      address: '香港新界沙田安耀街3号汇达大厦2605室'
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
          关于我们
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
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* 左侧：上下两个块 */}
            <div className="space-y-8">
              <div className="bg-white p-8 border border-gray-200">
                <h3 className="text-xl font-medium text-gray-900 mb-4">我们的使命</h3>
                <p className="text-lg text-gray-700 leading-relaxed">洞悉新增长 普惠可持续</p>
              </div>
              <div className="bg-white p-8 border border-gray-200">
                <h3 className="text-xl font-medium text-gray-900 mb-4">我们相信</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 text-base leading-relaxed">
                  企业的利益和前途在于为社会创造福祉
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    社会问题中蕴藏着巨大的商业机会
                  </p>
                </div>
              </div>
            </div>
            {/* 右侧：一个块 */}
            <div className="bg-white p-8 border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-4">我们致力于</h3>
              <div className="space-y-3">
                <p className="text-gray-700 text-base leading-relaxed">
                  将可持续发展融入到企业战略与行为中，帮助企业获得增长的同时产生正向社会价值
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  融合管理咨询方法与AI技术，实现可持续发展咨询的普惠
                </p>
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
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            我们的价值观
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            这些核心价值观指导着我们的每一项服务和决策
          </p>
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
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            我们的团队
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            由资深专家组成的专业团队，为您提供卓越的咨询服务
          </p>
        </div>
        {/* 顾问毕业院校 */}
        <div className="bg-white border border-gray-200 p-8 mb-12">
          <h3 className="text-xl font-medium text-gray-900 mb-6">顾问毕业院校</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-x-8 gap-y-6 place-items-center">
            {universityLogos.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.02 * i }}
                className="w-full flex items-center justify-center p-2"
              >
                <img src={src} alt="university logo" className="h-12 md:h-14 lg:h-16 object-contain" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 顾问职业经历 */}
        <div className="bg-white border border-gray-200 p-8 mb-12">
          <h3 className="text-xl font-medium text-gray-900 mb-6">顾问职业经历</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-x-8 gap-y-6 place-items-center">
            {companyLogos.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.02 * i }}
                className="w-full flex items-center justify-center p-2"
              >
                <img src={src} alt="company logo" className="h-12 md:h-14 lg:h-16 object-contain" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 团队荣誉（白底） */}
        <div className="bg-white border border-gray-200 p-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">团队荣誉</h3>
          {/* 大屏尽量单行展示；小屏自动换行 */}
          <div className="flex flex-wrap items-start justify-between gap-y-8">
            {achievementItems.map((item, i) => (
              <motion.div
                key={item.src}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.02 * i }}
                className="flex flex-col items-center text-center basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-[12.5%] px-2"
              >
                <img src={item.src} alt="achievement logo" className="h-16 md:h-18 lg:h-20 object-contain" />
                <p className="mt-3 text-xs md:text-sm text-gray-700 leading-snug tracking-tight">{item.label}</p>
              </motion.div>
            ))}
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
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            我们的办公室
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            在主要商业中心设有办公室，为客户提供本地化服务
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {offices.map((office, index) => (
            <motion.div
              key={office.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 * index }}
              className="bg-gray-50 border border-gray-200 p-6 md:p-6 w-full sm:basis-[48%] md:basis-[31%]"
            >
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {office.city}
              </h3>
              <p className="text-gray-700 leading-relaxed tracking-tight">
                {office.address}
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
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            加入我们
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            与我们一起推动全球商业的可持续发展
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