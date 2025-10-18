import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LogoCarousel from '@/components/LogoCarousel';

export default function ESGRiskAnalysisNew() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/esg-risk-analysis');
  };

  const handleGetUnlimitedPlan = () => {
    // 处理无限计划订购
    console.log('订购无限计划');
  };

  const handleBuyWhitepaper = () => {
    // 处理白皮书购买
    console.log('购买白皮书');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 核心价值主张 */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-light text-slate-900 mb-8 tracking-tight leading-tight">
              停止在海外交学费
            </h1>
            <h2 className="text-xl md:text-2xl font-light text-slate-600 mb-6">
              避免出现下一个"巴西比亚迪"
            </h2>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed">
              —— 已经累计帮助客户节省 <span className="font-semibold text-slate-900">XX亿美金</span>
            </p>
            
            {/* 添加主要CTA按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="bg-slate-900 text-white px-8 py-4 rounded-lg hover:bg-slate-800 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
              >
                立即开始分析
              </button>
              <button
                onClick={() => document.getElementById('usage-flow')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-slate-300 text-slate-700 px-8 py-4 rounded-lg hover:bg-slate-50 transition-colors font-medium text-lg"
              >
                了解使用流程
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Usage Flow Section - 移到前面突出使用流程 */}
      <section id="usage-flow" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-20"
          >
            <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-8">4步获得完整ESG风险分析</h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              简单快速的操作流程，让您轻松获得专业的ESG风险分析报告
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { step: 'Step 1', title: '选择你的行业', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { step: 'Step 2', title: '选择目标地区', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { step: 'Step 3', title: '获得综合预警', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              { step: 'Step 4', title: '获得完整报告', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="bg-slate-50 rounded-2xl p-8 mb-4 hover:bg-slate-100 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="text-base font-medium text-slate-900 mb-3">{item.step}</h4>
                  <p className="text-sm text-slate-600">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <button
              onClick={handleGetStarted}
              className="bg-slate-900 text-white px-12 py-4 rounded-lg hover:bg-slate-800 transition-colors font-medium text-base shadow-lg hover:shadow-xl"
            >
              开始试用
            </button>
          </motion.div>
        </div>
      </section>

      {/* Product Introduction Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-20"
          >
            <h3 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
              ESGVoyant
            </h3>
            <p className="text-xl text-slate-600 mb-3 leading-relaxed">
              人工智能驱动的全球ESG风险识别工具
            </p>
            <p className="text-sm text-slate-400">
              （产品名称TBD）
            </p>
          </motion.div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <h4 className="text-xl font-medium text-slate-900 mb-4">不再需要支付</h4>
              <p className="text-slate-600 leading-relaxed text-lg">数十万美金的咨询费用</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <h4 className="text-xl font-medium text-slate-900 mb-4">不再需要担心项目停工、</h4>
              <p className="text-slate-600 leading-relaxed text-lg">产品召回、人权关系等未知风险</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <h4 className="text-xl font-medium text-slate-900 mb-4">不再需要交千万美金的</h4>
              <p className="text-slate-600 leading-relaxed text-lg">在地学费</p>
            </motion.div>
          </div>

          {/* Core Value Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="text-2xl md:text-3xl font-light text-slate-900 mb-12 leading-relaxed">
              现在只需1%的费用，就可以提前避免所有这些风险
            </h3>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-16 text-slate-600 text-lg mb-12">
              <div>覆盖 <span className="font-semibold text-slate-900">XX</span> 国家与政策</div>
              <div>覆盖 <span className="font-semibold text-slate-900">99%</span> NGO与在地机构</div>
              <div>覆盖 <span className="font-semibold text-slate-900">XX</span></div>
            </div>
            
            {/* 添加第二个CTA */}
            <button
              onClick={handleGetStarted}
              className="bg-slate-900 text-white px-10 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium text-base shadow-lg hover:shadow-xl"
            >
              免费试用产品
            </button>
          </motion.div>
        </div>
      </section>

      {/* Data Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-6 gap-8 text-center mb-20"
          >
            <div>
              <div className="text-3xl md:text-4xl font-light text-slate-900 mb-3">252</div>
              <div className="text-sm md:text-base text-slate-500">覆盖国家与政策</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-light text-slate-900 mb-3">471</div>
              <div className="text-sm md:text-base text-slate-500">合作伙伴</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-light text-slate-900 mb-3">4,000+</div>
              <div className="text-sm md:text-base text-slate-500">合规数据源</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-light text-slate-900 mb-3">5,500+</div>
              <div className="text-sm md:text-base text-slate-500">风险案例</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-light text-slate-900 mb-3">10,000+</div>
              <div className="text-sm md:text-base text-slate-500">全球ESG数据源</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-light text-slate-900 mb-3">30,000+</div>
              <div className="text-sm md:text-base text-slate-500">可持续发展数据</div>
            </div>
          </motion.div>

          {/* Icon Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-20"
          >
            {[
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: '合规检查' },
              { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', title: '趋势分析' },
              { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: '数据统计' },
              { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z', title: '风险预警' },
              { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: '报告生成' },
              { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: '团队协作' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors mb-3">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <p className="text-xs md:text-sm text-slate-600 text-center">{item.title}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Customer Logos Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-light text-slate-900 mb-6">已获得这些知名企业信任</h3>
            <p className="text-base text-slate-500 mb-8">（logo动态展示）</p>
            
            {/* 添加第三个CTA */}
            <div className="mb-8">
              <button
                onClick={handleGetStarted}
                className="bg-white border-2 border-slate-900 text-slate-900 px-8 py-3 rounded-lg hover:bg-slate-900 hover:text-white transition-colors font-medium text-base shadow-sm"
              >
                加入他们，立即体验
              </button>
            </div>
          </motion.div>
          <LogoCarousel />
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
            <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-8">获取我们的服务</h3>
          </motion.div>

          {/* Unlimited Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 md:p-12 mb-12 shadow-lg"
          >
            <div className="text-center mb-8">
              <h4 className="text-xl md:text-2xl font-medium text-slate-900 mb-4">无限计划 (Unlimited Plan)</h4>
              <div className="flex items-center justify-center mb-6">
                <span className="text-4xl md:text-5xl font-light text-slate-900">$50,000</span>
                <span className="text-lg text-slate-500 ml-2">/年</span>
              </div>
              <p className="text-slate-600 mb-8">一个产品包，全面覆盖您的ESG风险分析需求</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: '无限地区', desc: '覆盖全球所有地区' },
                { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: '不限次数', desc: '无限制使用次数' },
                { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: '月度情报', desc: '每月最新情报更新' },
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: '专业保障', desc: '专业团队全程支持' }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                    </svg>
                  </div>
                  <h5 className="text-base font-medium text-slate-900 mb-2">{feature.title}</h5>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button 
                onClick={handleGetUnlimitedPlan}
                className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                立即订购
              </button>
            </div>
          </motion.div>

          {/* Whitepaper Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-lg"
          >
            <div className="text-center mb-8">
              <h4 className="text-xl md:text-2xl font-medium text-slate-900 mb-6">或直接购买我们的白皮书</h4>
              <div className="flex items-center justify-center space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl text-slate-400 line-through mb-2">$1,000</div>
                  <div className="text-4xl font-light text-slate-900">$800</div>
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <div className="text-center">
                  <div className="w-32 h-40 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600">报告封面预览</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-40 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-600">目录预览</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button 
                onClick={handleBuyWhitepaper}
                className="bg-slate-100 text-slate-900 px-8 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                购买白皮书
              </button>
            </div>
          </motion.div>
        </div>
       </section>

       {/* Report Examples Section */}
       <section className="py-24 bg-white">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 1.9 }}
             className="text-center mb-20"
           >
             <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-8">报告示例</h3>
             <p className="text-lg text-slate-600 max-w-2xl mx-auto">
               查看我们的报告预览和完整报告示例，了解详细的ESG风险分析内容
             </p>
           </motion.div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* Step 3 - Report Preview */}
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 2.0 }}
               className="bg-slate-50 rounded-2xl p-8"
             >
               <div className="text-center mb-8">
                 <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4">
                   <span className="text-slate-600 font-medium">Step 3</span>
                 </div>
                 <h4 className="text-xl font-medium text-slate-900 mb-2">报告预览示例</h4>
                 <p className="text-slate-600">摘要 + 目录</p>
               </div>
               
               <div className="bg-white rounded-lg p-6 shadow-sm">
                 <div className="flex items-center mb-4">
                   <svg className="w-6 h-6 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <h5 className="font-medium text-slate-900">ESG风险分析报告摘要</h5>
                 </div>
                 
                 <div className="space-y-3 text-sm text-slate-600">
                   <div className="flex justify-between">
                     <span>1. 执行摘要</span>
                     <span className="text-slate-400">...</span>
                   </div>
                   <div className="flex justify-between">
                     <span>2. 风险评估概览</span>
                     <span className="text-slate-400">...</span>
                   </div>
                   <div className="flex justify-between">
                     <span>3. 关键发现</span>
                     <span className="text-slate-400">...</span>
                   </div>
                   <div className="flex justify-between">
                     <span>4. 建议措施</span>
                     <span className="text-slate-400">...</span>
                   </div>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-slate-200">
                   <button 
                     onClick={handleGetStarted}
                     className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                   >
                     立即获取完整报告
                   </button>
                 </div>
               </div>
             </motion.div>

             {/* Step 4 - Full Report */}
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 2.1 }}
               className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8"
             >
               <div className="text-center mb-8">
                 <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 text-white rounded-full mb-4">
                   <span className="font-medium">Step 4</span>
                 </div>
                 <h4 className="text-xl font-medium text-slate-900 mb-2">完整报告示例</h4>
                 <p className="text-slate-600">5~10页详细分析</p>
               </div>
               
               <div className="bg-white rounded-lg p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center">
                     <svg className="w-6 h-6 text-slate-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     <h5 className="font-medium text-slate-900">完整ESG风险报告</h5>
                   </div>
                   <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">付费解锁</span>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="bg-slate-50 rounded-lg p-4">
                     <h6 className="font-medium text-slate-800 mb-2">详细内容包括：</h6>
                     <ul className="text-sm text-slate-600 space-y-1">
                       <li>• 深度风险分析与评估</li>
                       <li>• 行业对比与基准测试</li>
                       <li>• 具体改进建议与行动计划</li>
                       <li>• 合规性检查与法规解读</li>
                       <li>• 可持续发展路径规划</li>
                     </ul>
                   </div>
                   
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">报告页数：5-10页</span>
                     <span className="text-slate-600">格式：PDF</span>
                   </div>
                 </div>
                 
                 <div className="mt-6 pt-4 border-t border-slate-200">
                   <button 
                     onClick={handleGetUnlimitedPlan}
                     className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 px-4 rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all text-sm font-medium"
                   >
                     升级获取完整报告
                   </button>
                 </div>
               </div>
             </motion.div>
           </div>
         </div>
        </section>

        {/* Additional Services Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
              className="text-center mb-20"
            >
              <h3 className="text-3xl md:text-4xl font-light text-slate-900 mb-8">专业服务支持</h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                我们提供全方位的专业服务，确保您获得最佳的ESG风险分析体验
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Multi-language Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.3 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-slate-900 mb-2">多语言支持</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">中文（简体/繁体）</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">English</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">日本語</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">한국어</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 text-center">
                    支持多种语言的报告生成和客户服务
                  </p>
                </div>
              </motion.div>

              {/* 24-Hour Service Team */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.4 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-slate-900 mb-2">24小时服务团队</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">全天候技术支持</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">实时在线咨询</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">紧急问题快速响应</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">专业客服团队</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 text-center">
                    随时为您提供专业的技术支持和咨询服务
                  </p>
                </div>
              </motion.div>

              {/* Deep Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.5 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-slate-900 mb-2">深度陪跑</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-600">一对一专家指导</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-600">定制化解决方案</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-600">实施过程全程跟踪</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-600">持续优化建议</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 text-center">
                    专业团队全程陪伴，确保ESG目标顺利达成
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.6 }}
              className="text-center mt-16"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h4 className="text-xl font-medium text-slate-900 mb-4">需要更多帮助？</h4>
                <p className="text-slate-600 mb-6">
                  联系我们的专业团队，获取个性化的ESG风险分析解决方案
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleGetStarted}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                  >
                    立即开始分析
                  </button>
                  <button 
                    onClick={handleGetStarted}
                    className="bg-slate-100 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    预约演示
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }