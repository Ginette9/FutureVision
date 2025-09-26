import { motion } from 'framer-motion';

export default function About() {
  const team = [
    {
      name: '金夏',
      position: '创始人 & CEO',
      description: '拥有15年国际商务和ESG咨询经验，曾服务于多家世界500强企业',
      linkedin: 'https://www.linkedin.com/in/xia-jin-25267620'
    },
    {
      name: '王旭',
      position: '商业情报总监',
      description: '专注于全球商业情报分析，拥有丰富的市场研究和数据分析经验',
      linkedin: '#'
    },
    {
      name: '子璇',
      position: '内容与传播总监',
      description: '负责内容策略和社媒传播，擅长将复杂的ESG概念转化为易懂的内容',
      linkedin: '#'
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
      city: '香港',
      address: 'Room 1318-19, Hollywood Plaza 610 Nathan Road, Mong Kok, Kowloon',
      phone: '+852 4609 1687',
      email: 'hk@mscfv.com'
    },
    {
      city: '北京',
      address: 'Room 1805, Capital Mansion 6 Xinyuan South Road, Chaoyang District',
      phone: '+86 189 8948 5442',
      email: 'beijing@mscfv.com'
    },
    {
      city: '上海',
      address: '42/F, Magnolia Plaza, 501 East Da Ming Road, Hongkou District',
      phone: '+86 21 6888 8888',
      email: 'shanghai@mscfv.com'
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
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Future Vision - 您的首选智能咨询伙伴，致力于推动全球商业可持续发展
        </p>
      </motion.div>

      {/* Company Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
      >
        <div className="bg-gray-50 p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-6">
                我们的使命
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Future Vision 成立于2019年，是一家专注于ESG（环境、社会和治理）咨询的专业服务机构。
                我们致力于帮助企业在全球化进程中识别和管理ESG风险，实现可持续发展目标。
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                通过深度的行业洞察、前沿的分析工具和丰富的实践经验，我们为客户提供全方位的ESG解决方案，
                助力企业在复杂多变的全球商业环境中保持竞争优势。
              </p>
            </div>
            <div className="bg-white p-8 border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-6">核心数据</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">100+</div>
                  <div className="text-sm text-gray-600">服务客户</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">30+</div>
                  <div className="text-sm text-gray-600">覆盖国家</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">5年</div>
                  <div className="text-sm text-gray-600">专业经验</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">95%</div>
                  <div className="text-sm text-gray-600">客户满意度</div>
                </div>
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
        
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="text-center bg-white border border-gray-200 p-8"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {member.name}
              </h3>
              <p className="text-gray-600 font-medium mb-4">
                {member.position}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                {member.description}
              </p>
              <a
                href={member.linkedin}
                className="text-gray-900 hover:text-gray-700 font-medium"
              >
                LinkedIn →
              </a>
            </motion.div>
          ))}
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
        
        <div className="grid md:grid-cols-3 gap-8">
          {offices.map((office, index) => (
            <motion.div
              key={office.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-gray-50 p-8"
            >
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {office.city}
              </h3>
              <div className="space-y-3 text-gray-600">
                <p className="leading-relaxed">
                  {office.address}
                </p>
                <p>
                  <span className="font-medium">电话:</span> {office.phone}
                </p>
                <p>
                  <span className="font-medium">邮箱:</span> {office.email}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            发展历程
          </h2>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-24 text-right pr-8">
              <span className="text-lg font-medium text-gray-900">2019</span>
            </div>
            <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-1 mr-8"></div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">公司成立</h3>
              <p className="text-gray-600">Future Vision 在香港正式成立，专注于ESG咨询服务</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-24 text-right pr-8">
              <span className="text-lg font-medium text-gray-900">2020</span>
            </div>
            <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-1 mr-8"></div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">业务拓展</h3>
              <p className="text-gray-600">在北京和上海设立办公室，服务范围扩展至中国大陆</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-24 text-right pr-8">
              <span className="text-lg font-medium text-gray-900">2022</span>
            </div>
            <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-1 mr-8"></div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">国际认证</h3>
              <p className="text-gray-600">获得多项国际ESG咨询认证，成为行业领先的专业服务机构</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-24 text-right pr-8">
              <span className="text-lg font-medium text-gray-900">2024</span>
            </div>
            <div className="flex-shrink-0 w-4 h-4 bg-gray-900 rounded-full mt-1 mr-8"></div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">持续创新</h3>
              <p className="text-gray-600">推出智能ESG风险分析平台，为客户提供更高效的服务</p>
            </div>
          </div>
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
            加入我们的使命
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            与我们一起推动全球商业的可持续发展
          </p>
          <button className="inline-flex items-center px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium">
            联系我们
          </button>
        </motion.div>
      </div>
    </div>
  );
}