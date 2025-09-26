import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      category: "中小企业",
      title: "中小企业出海服务",
      description: "为中小企业提供全方位的海外市场拓展支持",
      services: [
        "海外产品销售代理",
        "产品出海策略",
        "全球资源链接"
      ]
    },
    {
      category: "跨国公司",
      title: "跨国企业ESG管理",
      description: "为跨国公司提供专业的ESG风险管理和可持续发展解决方案",
      services: [
        "ESG出海风险管理",
        "可持续战略",
        "企业智能情报系统",
        "全球资源链接",
        "MSCI评级提升"
      ]
    },
    {
      category: "上市公司",
      title: "上市公司ESG提升",
      description: "为上市公司提供ESG评级提升和可持续发展战略服务",
      services: [
        "可持续战略",
        "企业智能情报系统",
        "全球资源链接",
        "MSCI评级提升"
      ]
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
          为不同规模的企业提供专业的出海服务和ESG风险管理解决方案
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
              className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Card Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {service.category}
                  </div>
                  <h3 className="text-2xl font-medium text-gray-900">
                    {service.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Services List */}
              <div className="p-8">
                <h4 className="font-medium text-gray-900 mb-6">服务内容</h4>
                <ul className="space-y-4">
                  {service.services.map((item, idx) => (
                    <li key={idx} className="flex items-start text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button className="w-full py-3 px-6 text-gray-900 border border-gray-300 hover:border-gray-400 transition-colors duration-300 font-medium">
                    了解详情
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
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            需要定制化服务？
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            我们的专业团队将根据您的具体需求，为您量身定制最适合的ESG解决方案
          </p>
          <button className="inline-flex items-center px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-300 font-medium">
            联系我们
          </button>
        </motion.div>
      </div>
    </div>
  );
}