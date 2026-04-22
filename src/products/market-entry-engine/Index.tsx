import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('toc');
  const [budget, setBudget] = useState(2000);

  const handleGetStarted = () => {
    navigate('/market-entry-engine/search');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(parseInt(e.target.value));
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatRange = (min: number, max: number): string => {
    const format = (num: number) => {
      if (num < 0) {
        return `-${Math.abs(num).toLocaleString()}`;
      }
      return `+${num.toLocaleString()}`;
    };
    return `${format(min)} ~ ${format(max)}万`;
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <motion.section 
        className="bg-[#0A0A0A] text-white py-15 px-15 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] pointer-events-none">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-green-500/8 to-blue-500/8 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center mt-16 mb-12">
            <div className="font-mono text-sm tracking-widest opacity-60">Maker Sustainability Consulting</div>
            <div className="text-xs text-white/30">For the Next 100 Sustainable Years</div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[clamp(32px,5vw,56px)] font-bold mb-5 max-w-4xl">
            不是帮你<span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">花钱出海</span>，<br />
            而是帮你找到<span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">最赚钱的出海方式</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mb-12 leading-relaxed">
            MSC 是增长导向的出海战略伙伴。我们用精准的市场研究和品牌定位，帮企业在花大钱之前，找到长期ROI最高的解。
          </p>
          <div className="flex border-b border-white/10 mb-16">
            <button
              onClick={() => setActiveTab('toc')}
              className={`px-10 py-4.5 text-base font-medium transition-all relative ${activeTab === 'toc' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              To C 消费品出海
              <span className="inline-block text-xs px-2 py-0.5 ml-2 bg-[rgba(232,101,46,0.2)] text-[#E8652E] font-mono">
                品牌增长
              </span>
              {activeTab === 'toc' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tob')}
              className={`px-10 py-4.5 text-base font-medium transition-all relative ${activeTab === 'tob' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              To B 工贸出海
              <span className="inline-block text-xs px-2 py-0.5 ml-2 bg-[rgba(13,127,187,0.2)] text-[#3AB5F4] font-mono">
                询盘倍增
              </span>
              {activeTab === 'tob' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
              )}
            </button>
          </div>
        </div>
      </motion.section>

      {/* To C Content */}
      {activeTab === 'toc' && (
        <>
          {/* ROI Section */}
          <section className="py-20 px-15 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-12 gap-15 items-center">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  className="md:col-span-5"
                >
                  <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                    Core Value
                  </div>
                  <h2 className="font-serif text-3xl font-bold mb-4 leading-relaxed">
                    别人的ROI在赌运气，<br />我们让你<span className="text-green-600">稳定在6倍以上</span>
                  </h2>
                  <p className="text-gray-500 mb-4 leading-relaxed">
                    大多数出海服务商在执行层面竞争——谁投放更便宜、谁建站更快。但方向错了，执行越快亏得越多。
                  </p>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    MSC的核心价值：在你投入2000万之前，用精准的市场调研和品牌定位，将你的ROI从行业平均的"亏3倍到赚2倍"的赌博，拉到<strong>6倍以上</strong>的确定性回报。
                  </p>
                  <div className="flex flex-wrap gap-10 mt-8">
                    <div>
                      <div className="text-3xl font-mono font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                        6.2×
                      </div>
                      <div className="text-sm text-gray-500 mt-1">客户平均ROI</div>
                    </div>
                    <div>
                      <div className="text-3xl font-mono font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                        67%
                      </div>
                      <div className="text-sm text-gray-500 mt-1">获客成本降幅</div>
                    </div>
                    <div>
                      <div className="text-3xl font-mono font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                        12
                      </div>
                      <div className="text-sm text-gray-500 mt-1">月回本周期</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="md:col-span-7"
                >
                  <div className="bg-gray-100 p-10">
                    <svg viewBox="0 0 540 360" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                      <defs>
                        <linearGradient id="cone-fill" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#D1D1D1" stopOpacity="0.1"></stop>
                          <stop offset="100%" stopColor="#D1D1D1" stopOpacity="0.35"></stop>
                        </linearGradient>
                        <linearGradient id="msc-glow" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#E8652E" stopOpacity="0.05"></stop>
                          <stop offset="100%" stopColor="#E8652E" stopOpacity="0.15"></stop>
                        </linearGradient>
                      </defs>
                      
                      {/* Y: -3× (y=286) to 8× (y=44).  0× baseline at y=220.  1× = ~22px */}
                      <line x1="55" y1="220" x2="500" y2="220" stroke="#999" strokeWidth="0.75"></line>
                      <line x1="55" y1="30" x2="55" y2="300" stroke="#D1D1D1" strokeWidth="0.75"></line>
                      <line x1="55" y1="176" x2="500" y2="176" stroke="#E6E6E6" strokeWidth="0.5" strokeDasharray="4,4"></line>
                      <line x1="55" y1="132" x2="500" y2="132" stroke="#E6E6E6" strokeWidth="0.5" strokeDasharray="4,4"></line>
                      <line x1="55" y1="88" x2="500" y2="88" stroke="#E6E6E6" strokeWidth="0.5" strokeDasharray="4,4"></line>
                      <line x1="55" y1="44" x2="500" y2="44" stroke="#E6E6E6" strokeWidth="0.5" strokeDasharray="4,4"></line>
                      <line x1="55" y1="264" x2="500" y2="264" stroke="#E6E6E6" strokeWidth="0.5" strokeDasharray="4,4"></line>
                      
                      <text x="48" y="48" textAnchor="end" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">8×</text>
                      <text x="48" y="92" textAnchor="end" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">6×</text>
                      <text x="48" y="136" textAnchor="end" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">4×</text>
                      <text x="48" y="180" textAnchor="end" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">2×</text>
                      <text x="48" y="224" textAnchor="end" fontFamily="DM Mono" fontSize="10" fill="#999" fontWeight="500">0×</text>
                      <text x="48" y="268" textAnchor="end" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">-2×</text>
                      <text x="48" y="294" textAnchor="end" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">-3×</text>
                      
                      <text x="55" y="318" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">0</text>
                      <text x="166" y="318" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">6个月</text>
                      <text x="278" y="318" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">12个月</text>
                      <text x="389" y="318" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">18个月</text>
                      <text x="500" y="318" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#7F7F7F">24个月</text>
                      
                      {/* Gray cone: -3× to +2× */}
                      <path d="M55,220 Q110,218 166,210 Q220,200 278,187 Q340,178 389,176 L500,176 L500,286 Q389,282 340,278 Q278,268 220,256 Q166,242 110,232 L55,220 Z" fill="url(#cone-fill)"></path>
                      <path d="M55,220 Q110,218 166,210 Q220,200 278,187 Q340,178 389,176 L500,176" fill="none" stroke="#D1D1D1" strokeWidth="1" opacity="0.6"></path>
                      <path d="M55,220 Q110,232 166,242 Q220,256 278,268 Q340,278 389,282 L500,286" fill="none" stroke="#D1D1D1" strokeWidth="1" opacity="0.6"></path>
                      
                      <rect x="360" y="232" width="110" height="20" rx="2" fill="#E6E6E6"></rect>
                      <text x="415" y="246" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#999" fontWeight="500">行业平均分布</text>
                      
                      <text x="510" y="180" fontFamily="DM Mono" fontSize="10" fill="#999">+2×</text>
                      <text x="510" y="290" fontFamily="DM Mono" fontSize="10" fill="#999">-3×</text>
                      <line x1="506" y1="178" x2="506" y2="288" stroke="#D1D1D1" strokeWidth="0.75"></line>
                      
                      {/* MSC orange line: 6×+ */}
                      <path d="M55,220 Q100,200 166,155 Q220,115 278,95 Q340,82 389,75 Q450,65 500,58" fill="none" stroke="#E8652E" strokeWidth="3.5" strokeLinecap="round"></path>
                      <path d="M55,220 Q100,200 166,155 Q220,115 278,95 Q340,82 389,75 Q450,65 500,58 L500,88 Q450,82 389,85 Q340,90 278,100 Q220,120 166,160 Q100,205 55,220 Z" fill="url(#msc-glow)"></path>
                      <circle cx="500" cy="58" r="5" fill="#E8652E"></circle>
                      <circle cx="500" cy="58" r="9" fill="none" stroke="#E8652E" strokeWidth="1" opacity="0.3"></circle>
                      
                      <rect x="370" y="55" width="90" height="24" rx="2" fill="#E8652E"></rect>
                      <text x="415" y="71" textAnchor="middle" fontFamily="DM Mono" fontSize="11" fill="white" fontWeight="500">MSC 路径</text>
                      
                      <line x1="55" y1="88" x2="500" y2="88" stroke="#E8652E" strokeWidth="0.5" strokeDasharray="6,4" opacity="0.4"></line>
                      <text x="500" y="62" fontFamily="DM Mono" fontSize="10" fill="#E8652E" fontWeight="500">6×+</text>
                      <text x="503" y="218" fontFamily="Noto Sans SC" fontSize="9" fill="#999">盈亏平衡线</text>
                    </svg>
                    <div className="flex gap-6 mt-5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-0.75 bg-[#E8652E]"></div>
                        <div className="text-sm text-gray-500">MSC精准定位路径（6×+ ROI）</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-300 opacity-40 rounded"></div>
                        <div className="text-sm text-gray-500">行业典型ROI分布（-3× ~ +2×）</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ROI Simulator Section */}
          <section className="py-20 px-15 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
              >
                <div className="bg-white p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
                    <div>
                      <div className="font-serif text-xl font-bold mb-2">投入产出模拟器</div>
                      <div className="text-sm text-gray-500">拖动滑块，预估你的出海ROI区间</div>
                    </div>
                    <div className="mt-6 md:mt-0 w-full md:w-1/2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-500">首年投入预算（万元）</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="500" 
                            max="5000" 
                            step="100" 
                            value={budget} 
                            onChange={handleBudgetChange}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{ accentColor: '#469A21' }}
                          />
                          <span className="text-lg font-mono font-medium min-w-[80px] text-green-600">{formatNumber(budget)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-100">
                      <div className="text-sm text-gray-500 mb-3">行业平均回报区间</div>
                      <div className="font-mono text-2xl text-gray-500 mb-2">{formatRange(-3 * budget, 2 * budget)}</div>
                      <div className="text-xs text-red-500">⚠ 亏损概率 &gt; 40%</div>
                    </div>
                    <div className="text-center p-6 bg-green-50">
                      <div className="text-sm text-green-600 mb-3">MSC精准路径预期回报</div>
                      <div className="font-mono text-2xl font-medium text-green-600 mb-2">{formatRange(6 * budget, 8 * budget)}</div>
                      <div className="text-xs text-green-600">✓ ROI 6×+，高确定性</div>
                    </div>
                    <div className="text-center p-6 bg-gray-100">
                      <div className="text-sm text-gray-500 mb-3">MSC路径预期首年销售额</div>
                      <div className="font-mono text-2xl font-medium mb-2">{formatRange(7 * budget, 9 * budget)}</div>
                      <div className="text-xs text-gray-500">基于MSC历史客户数据</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Process Section */}
          <section className="py-20 px-15 bg-white">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                  Service Process
                </div>
                <h2 className="font-serif text-3xl font-bold mb-2">
                  战略架构师 + 落地质量官
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  前两步MSC主导决策，后两步我们担任PMO确保执行不走样。
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-0.5">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-white p-9 relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.75 bg-green-600"></div>
                  <div className="text-5xl font-mono font-medium text-gray-200 mb-4">
                    01
                  </div>
                  <div className="text-xs font-mono text-green-600 mb-3 tracking-wider">
                    MSC 主导
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    精准市场调研
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    深度研究目标市场消费者行为、竞争格局、红利窗口。用数据找到"在哪里打"的最优解。
                  </p>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-9 relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.75 bg-green-400"></div>
                  <div className="text-5xl font-mono font-medium text-gray-200 mb-4">
                    02
                  </div>
                  <div className="text-xs font-mono text-green-600 mb-3 tracking-wider">
                    MSC 主导
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    品牌定位与策略
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    定义品牌价值主张、视觉体系、定价策略。决定"怎么打"——高性价比颠覆还是差异化创新。
                  </p>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-9 relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.75 bg-blue-600"></div>
                  <div className="text-5xl font-mono font-medium text-gray-200 mb-4">
                    03
                  </div>
                  <div className="text-xs font-mono text-green-600 mb-3 tracking-wider">
                    PMO 管控
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    建站与内容搭建
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    统筹独立站建设、内容体系搭建、素材制作。确保品牌策略在每个触点一致落地。
                  </p>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-9 relative"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.75 bg-blue-400"></div>
                  <div className="text-5xl font-mono font-medium text-gray-200 mb-4">
                    04
                  </div>
                  <div className="text-xs font-mono text-green-600 mb-3 tracking-wider">
                    PMO 管控
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    投放与增长运营
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    管理广告投放、KOL合作、社媒运营的执行质量，持续优化ROI至目标区间。
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Cases Section */}
          <section className="py-20 px-15 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                  Case Studies
                </div>
                <h2 className="font-serif text-3xl font-bold mb-2">
                  他们选对了方向，然后赢了
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  MSC如何通过前期精准定位，帮客户实现6倍以上ROI。
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-white p-8 border border-gray-200 hover:border-green-600 hover:-translate-y-0.5 transition-all"
                >
                  <div className="text-xs font-mono tracking-wider text-gray-500 mb-4 uppercase">
                    消费电子 · 东南亚
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-3 leading-relaxed">
                    充电品牌：聚焦两国市场，ROI达6.4倍
                  </h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    原计划6国铺货，MSC建议聚焦印尼+越南，定位"年轻人的第一个科技配件品牌"，预算缩减40%但销售额远超预期。
                  </p>
                  <div className="flex gap-6 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        6.4×
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">ROI</div>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        -40%
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">预算优化</div>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        8个月
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">回本</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-8 border border-gray-200 hover:border-green-600 hover:-translate-y-0.5 transition-all"
                >
                  <div className="text-xs font-mono tracking-wider text-gray-500 mb-4 uppercase">
                    美妆个护 · 北美
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-3 leading-relaxed">
                    避开红海，Clean Beauty蓝海ROI 7.2倍
                  </h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    MSC发现"Clean Beauty for Gen-Z"赛道空缺，重新定位后客单价翻倍，获客成本降50%。
                  </p>
                  <div className="flex gap-6 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        7.2×
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">ROI</div>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        +120%
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">客单价</div>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        -50%
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">CAC降幅</div>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-8 border border-gray-200 hover:border-green-600 hover:-translate-y-0.5 transition-all"
                >
                  <div className="text-xs font-mono tracking-wider text-gray-500 mb-4 uppercase">
                    家居生活 · 欧洲
                  </div>
                  <h3 className="font-serif text-lg font-bold mb-3 leading-relaxed">
                    ESG叙事打开欧洲高端渠道
                  </h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    用"低碳智能生活"定位切入欧洲可持续消费趋势，成功进入3家主流零售渠道。
                  </p>
                  <div className="flex gap-6 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        6.1×
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">ROI</div>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        3家
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">主流渠道</div>
                    </div>
                    <div>
                      <div className="text-xl font-mono font-bold text-green-600">
                        10个月
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">回本</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* To B Content */}
      {activeTab === 'tob' && (
        <>
          {/* Paths Section */}
          <section className="py-20 px-15 bg-white">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                  Two Paths, One Goal
                </div>
                <h2 className="font-serif text-3xl font-bold mb-4">
                  两条路径，都指向确定性增长
                </h2>
                <p className="text-gray-600 max-w-2xl mb-12">
                  我们敢和你的增长绑定，因为我们对自己的方法论有信心。
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-gray-100 p-12 border border-gray-200 relative overflow-hidden"
                >
                  <div className="text-xs font-mono tracking-wider text-green-600 mb-6 bg-green-50 inline-block px-3 py-1">
                    Path A
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">
                    轻启动模式
                  </h3>
                  <p className="text-gray-600 mb-8">
                    零服务费，按效果分成——我们和你的增长绑定
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-mono font-bold text-green-600">$0</span>
                    <span className="text-gray-500 ml-2 text-sm">服务费</span>
                  </div>
                  <p className="text-gray-600 mb-8 pb-6 border-b border-gray-200 text-sm leading-relaxed">
                    企业自付工具成本 <strong>$2-3万/年</strong><br />
                    MSC收取销售分成 <strong>8-10%</strong>
                  </p>
                  <div className="flex justify-between items-baseline py-4 border-b border-gray-200">
                    <span className="text-sm text-gray-500">适合谁</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">初次出海、预算有限、想先验证可行性</span>
                  </div>
                  <div className="flex justify-between items-baseline py-4 border-b border-gray-200">
                    <span className="text-sm text-gray-500">MSC提供</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">市场调研 + 品牌定位 + 网站搭建 + 询盘体系</span>
                  </div>
                  <div className="flex justify-between items-baseline py-4 border-b border-gray-200">
                    <span className="text-sm text-gray-500">预期效果</span>
                    <span className="text-sm font-bold text-green-600 text-right">询盘量 3-5 倍增长</span>
                  </div>
                  <ul className="mt-8 mb-8">
                    <li className="text-gray-600 mb-2 pl-5 relative text-sm leading-relaxed">
                      <span className="absolute left-0 text-green-600">→</span>
                      利益绑定：你不赚钱，我也不赚钱
                    </li>
                    <li className="text-gray-600 mb-2 pl-5 relative text-sm leading-relaxed">
                      <span className="absolute left-0 text-green-600">→</span>
                      AI赋能，服务效率是传统代运营3倍
                    </li>
                    <li className="text-gray-600 pl-5 relative text-sm leading-relaxed">
                      <span className="absolute left-0 text-green-600">→</span>
                      零试错成本，先看到效果再加码
                    </li>
                  </ul>
                  <button className="w-full py-4 bg-black text-white font-medium hover:opacity-85 transition-opacity text-sm">
                    查看完整服务清单与案例 →
                  </button>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900 text-white p-12 relative overflow-hidden"
                >
                  <div className="text-xs font-mono tracking-wider text-blue-300 mb-6 bg-blue-900/20 inline-block px-3 py-1">
                    Path B
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">
                    全托管模式
                  </h3>
                  <p className="text-gray-400 mb-8">
                    我们整体操盘，对赌业绩——不达标，退费
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-mono font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">200-300万</span>
                    <span className="text-gray-400 ml-2 text-sm">/年</span>
                  </div>
                  <p className="text-gray-400 mb-8 pb-6 border-b border-white/10 text-sm leading-relaxed">
                    对赌目标：年销售额 <strong>≥ 1,000万</strong><br />
                    未达标按比例退费，<strong>风险共担</strong>
                  </p>
                  <div className="flex justify-between items-baseline py-4 border-b border-white/10">
                    <span className="text-sm text-gray-400">适合谁</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">有出海意愿、追求快速规模化</span>
                  </div>
                  <div className="flex justify-between items-baseline py-4 border-b border-white/10">
                    <span className="text-sm text-gray-400">MSC提供</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">战略重构 + 全渠道运营 + 客户开发</span>
                  </div>
                  <div className="flex justify-between items-baseline py-4 border-b border-white/10">
                    <span className="text-sm text-gray-400">预期效果</span>
                    <span className="text-sm font-bold text-green-400 text-right">年销售额 1,000万+</span>
                  </div>
                  <ul className="mt-8 mb-8">
                    <li className="text-gray-400 mb-2 pl-5 relative text-sm leading-relaxed">
                      <span className="absolute left-0 text-blue-300">→</span>
                      从战略到执行全面操盘
                    </li>
                    <li className="text-gray-400 mb-2 pl-5 relative text-sm leading-relaxed">
                      <span className="absolute left-0 text-blue-300">→</span>
                      重新梳理整个B2B海外打法
                    </li>
                    <li className="text-gray-400 pl-5 relative text-sm leading-relaxed">
                      <span className="absolute left-0 text-blue-300">→</span>
                      对赌机制，利益完全绑定
                    </li>
                  </ul>
                  <button className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:opacity-85 transition-opacity text-sm">
                    查看18个月增长路线图 →
                  </button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Path A Deep Dive Section */}
          <section className="py-20 px-15 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                  Path A · Deep Dive
                </div>
                <h2 className="font-serif text-3xl font-bold mb-2">
                  "免费服务"的底层逻辑
                </h2>
                <p className="text-gray-600 max-w-2xl mb-12">
                  不是慈善，是利益对齐。AI降低成本 + 分成绑定增长。
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-gray-200">
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-white p-9"
                >
                  <div className="text-2xl mb-4">📊</div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    第1步：市场诊断与定位
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    AI驱动目标市场分析，2周内识别最大询盘转化潜力方向。
                  </p>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-9"
                >
                  <div className="text-2xl mb-4">🌐</div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    第2步：网站与内容搭建
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    搭建B2B专业网站，配合SEO策略和行业内容体系。
                  </p>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-9"
                >
                  <div className="text-2xl mb-4">🔍</div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    第3步：询盘体系建设
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Google Ads + LinkedIn + 行业展会线上化，多渠道获客。
                  </p>
                </motion.div>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeInUp}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-9"
                >
                  <div className="text-2xl mb-4">📈</div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    第4步：持续优化与分成
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    按月优化，MSC收取成交额8-10%分成。你的增长=我们的收入。
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* B2B ROI Section */}
          <section className="py-20 px-15 bg-white">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                variants={fadeInUp}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">
                  Track Record
                </div>
                <h2 className="font-serif text-3xl font-bold mb-12">
                  我们的B2B出海数据
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                    transition={{ delay: 0 }}
                    className="bg-white p-9 text-center border border-gray-200"
                  >
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-3">
                      4.2×
                    </div>
                    <p className="text-gray-600 text-sm">
                      全托管平均ROI
                    </p>
                  </motion.div>
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-9 text-center border border-gray-200"
                  >
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-3">
                      340%
                    </div>
                    <p className="text-gray-600 text-sm">
                      轻启动询盘增长
                    </p>
                  </motion.div>
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    variants={fadeInUp}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-9 text-center border border-gray-200"
                  >
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-3">
                      92%
                    </div>
                    <p className="text-gray-600 text-sm">
                      客户续约率
                    </p>
                  </motion.div>
                </div>
                <div className="bg-gray-900 text-white p-12 flex items-center gap-12">
                  <div className="text-6xl opacity-30">⛊</div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold mb-4">
                      我们敢对赌，因为我们对方法论有信心
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      全托管：年销售额≥1,000万对赌，未达标按比例退费。<br />
                      轻启动：你只付工具成本，MSC靠分成活着。带不来生意，一分钱不拿。
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* CTA Section */}
      <section className="py-20 px-15 bg-[#0A0A0A] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              出海这件事，方向比速度重要
            </h2>
            <p className="text-gray-400 mb-9 max-w-2xl mx-auto leading-relaxed">
              预约30分钟免费诊断，看看你的出海ROI还有多大提升空间。
            </p>
            <button 
              onClick={handleGetStarted}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium hover:opacity-85 transition-opacity hover:-translate-y-1"
            >
              预约免费出海诊断
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-15 bg-[#0A0A0A] border-t border-white/6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2026 Maker Sustainability Consulting
          </div>
          <div className="text-gray-500 text-sm font-mono tracking-wider">
            For the Next 100 Sustainable Years
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;