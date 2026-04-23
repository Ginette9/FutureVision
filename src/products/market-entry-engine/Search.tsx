import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiGet, apiPost } from '@/lib/utils';

const Search = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingDetails, setLoadingDetails] = useState('');
  const [selectedHsCode, setSelectedHsCode] = useState<string | null>(null);

  const productKeywords: { [key: string]: string } = {
    '香水': '330300',
    '化妆品': '330499',
    '洗发水': '330510',
    '香皂': '340111',
    '肥皂': '340120',
    '染料': '320411',
    '油漆': '320890',
    '尿素': '310210',
    '钾肥': '310420',
    '卤素灯': '853921',
    '荧光灯': '853931',
    '密封灯': '853910',
    '铜线': '854411',
    '同轴电缆': '854420',
    '光缆': '854470',
    '报警器': '853110',
    '聚乙烯': '390110',
    '聚丙烯': '390210'
  };

  const getProductDesc = (code: string) => {
    const descs: { [key: string]: string } = {
      '330300': language === 'en-US' ? 'Perfumes' : language === 'zh-HK' ? '香水' : '香水',
      '330499': language === 'en-US' ? 'Cosmetics' : language === 'zh-HK' ? '化妝品' : '化妆品',
      '330510': language === 'en-US' ? 'Shampoo' : language === 'zh-HK' ? '洗髮水' : '洗发水',
      '340111': language === 'en-US' ? 'Toilet Soap' : language === 'zh-HK' ? '香皂' : '香皂',
      '340120': language === 'en-US' ? 'Soap' : language === 'zh-HK' ? '肥皂' : '肥皂',
      '320411': language === 'en-US' ? 'Dyes' : language === 'zh-HK' ? '染料' : '染料',
      '320890': language === 'en-US' ? 'Paint' : language === 'zh-HK' ? '油漆' : '油漆',
      '310210': language === 'en-US' ? 'Urea' : language === 'zh-HK' ? '尿素' : '尿素',
      '310420': language === 'en-US' ? 'Potash' : language === 'zh-HK' ? '鉀肥' : '钾肥',
      '853921': language === 'en-US' ? 'Halogen Lamp' : language === 'zh-HK' ? '鹵素燈' : '卤素灯',
      '853931': language === 'en-US' ? 'Fluorescent Lamp' : language === 'zh-HK' ? '螢光燈' : '荧光灯',
      '853910': language === 'en-US' ? 'Sealed Beam' : language === 'zh-HK' ? '密封燈' : '密封灯',
      '854411': language === 'en-US' ? 'Copper Wire' : language === 'zh-HK' ? '銅線' : '铜线',
      '854420': language === 'en-US' ? 'Coaxial Cable' : language === 'zh-HK' ? '同軸電纜' : '同轴电缆',
      '854470': language === 'en-US' ? 'Optical Cable' : language === 'zh-HK' ? '光纜' : '光缆',
      '853110': language === 'en-US' ? 'Alarm' : language === 'zh-HK' ? '報警器' : '报警器',
      '390110': language === 'en-US' ? 'Polyethylene' : language === 'zh-HK' ? '聚乙烯' : '聚乙烯',
      '390210': language === 'en-US' ? 'Polypropylene' : language === 'zh-HK' ? '聚丙烯' : '聚丙烯'
    };
    return descs[code] || (language === 'en-US' ? 'Industrial Products' : language === 'zh-HK' ? '工業制品' : '工业制品');
  };

  const labels = {
    title: language === 'en-US' ? 'Smart Market Analysis' : language === 'zh-HK' ? '智能市場分析' : '智能市场分析',
    subtitle: language === 'en-US' 
      ? 'Enter your product HS code or keywords to access global market analysis reports' 
      : language === 'zh-HK' 
        ? '輸入產品HS編碼或關鍵詞，獲取全球市場分析報告' 
        : '输入产品HS编码或关键词，获取全球市场分析报告',
    placeholder: language === 'en-US' 
      ? 'Enter HS code (e.g., 851762) or product keywords (e.g., smartphone)...' 
      : language === 'zh-HK' 
        ? '輸入HS編碼（如：851762）或產品關鍵詞（如：手機）...' 
        : '输入HS编码（如：851762）或产品关键词（如：手机）...',
    searchButton: language === 'en-US' ? 'Analyze' : language === 'zh-HK' ? '開始分析' : '开始分析',
    searching: language === 'en-US' ? 'Searching...' : language === 'zh-HK' ? '搜索中...' : '搜索中...',
    hotSearch: language === 'en-US' ? 'Popular Searches' : language === 'zh-HK' ? '熱門搜索' : '热门搜索',
    loadingTitle: language === 'en-US' ? 'Analyzing Data' : language === 'zh-HK' ? '正在分析數據' : '正在分析数据',
    analyzingCountries: language === 'en-US' ? 'Analyzing Countries' : language === 'zh-HK' ? '分析國家' : '分析国家',
    dataPoints: language === 'en-US' ? 'Data Points' : language === 'zh-HK' ? '數據點' : '数据点',
    models: language === 'en-US' ? 'Models' : language === 'zh-HK' ? '計算模型' : '计算模型'
  };

  const hotKeywords = language === 'en-US' 
    ? ['Perfumes', 'Cosmetics', 'Shampoo', 'Soap', 'Dyes', 'Paint', 'Urea', 'Potash', 'Halogen Lamp', 'Copper Wire']
    : language === 'zh-HK' 
      ? ['香水', '化妝品', '洗髮水', '香皂', '染料', '油漆', '尿素', '鉀肥', '鹵素燈', '銅線']
      : ['香水', '化妆品', '洗发水', '香皂', '染料', '油漆', '尿素', '钾肥', '卤素灯', '铜线'];

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    let hsCode = searchTerm;
    
    if (productKeywords[searchTerm]) {
      hsCode = productKeywords[searchTerm];
    }
    
    setSelectedHsCode(hsCode);
    setShowLoading(true);
    setIsLoading(true);
    
    const loadingSteps = [
      { step: language === 'en-US' ? 'Retrieving Data' : language === 'zh-HK' ? '檢索數據' : '检索数据', details: language === 'en-US' ? `Loading HS Code ${hsCode} data` : language === 'zh-HK' ? `加載HS編碼 ${hsCode} 數據` : `加载HS编码 ${hsCode} 数据`, duration: 1500 },
      { step: language === 'en-US' ? 'Analyzing Market Trends' : language === 'zh-HK' ? '分析市場趨勢' : '分析市场趋势', details: language === 'en-US' ? 'Processing global market data' : language === 'zh-HK' ? '處理全球市場數據' : '处理全球市场数据', duration: 1800 },
      { step: language === 'en-US' ? 'AI Modeling' : language === 'zh-HK' ? 'AI建模分析' : 'AI建模分析', details: language === 'en-US' ? 'Building predictive models' : language === 'zh-HK' ? '建立預測模型' : '建立预测模型', duration: 2200 },
      { step: language === 'en-US' ? 'Generating Insights' : language === 'zh-HK' ? '生成洞察' : '生成洞察', details: language === 'en-US' ? 'Analyzing country-specific risks' : language === 'zh-HK' ? '分析國家特定風險' : '分析国家特定风险', duration: 1500 },
      { step: language === 'en-US' ? 'Finalizing Report' : language === 'zh-HK' ? '完成報告' : '完成报告', details: language === 'en-US' ? 'Preparing comprehensive analysis' : language === 'zh-HK' ? '準備綜合分析' : '准备综合分析', duration: 1000 }
    ];
    
    let progress = 0;
    const totalSteps = loadingSteps.length;
    const baseProgressPerStep = 100 / totalSteps;
    
    const runLoadingSteps = async () => {
      for (let i = 0; i < loadingSteps.length; i++) {
        const step = loadingSteps[i];
        setLoadingStep(step.step);
        setLoadingDetails(step.details);
        
        const stepProgress = baseProgressPerStep * (i + 1);
        const interval = setInterval(() => {
          progress += 1;
          setLoadingProgress(progress);
          if (progress >= stepProgress) {
            clearInterval(interval);
          }
        }, step.duration / baseProgressPerStep);
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
      }
      
      setLoadingProgress(100);
      setLoadingStep(language === 'en-US' ? 'Analysis Complete' : language === 'zh-HK' ? '分析完成' : '分析完成');
      setLoadingDetails(language === 'en-US' ? 'Preparing results...' : language === 'zh-HK' ? '準備結果...' : '准备结果...');
      await new Promise(resolve => setTimeout(resolve, 500));
    };
    
    try {
      // 先运行加载动画
      await runLoadingSteps();
      
      // 然后才发送API请求
      const data = await apiPost('/api/market-entry-engine/process', { 
        hs_code: hsCode, 
        mode: 'stable' 
      });
      
      setShowLoading(false);
      setIsLoading(false);
      
      if (data.message === '已找到已计算结果') {
        navigate('/market-entry-engine/results', { 
          state: { 
            hsCode: hsCode, 
            data: data 
          } 
        });
      } else if (data.error) {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setShowLoading(false);
      setIsLoading(false);
      alert(language === 'en-US' ? 'Search failed, please try again' : language === 'zh-HK' ? '搜索失敗，請重試' : '搜索失败，请重试');
    }
  };

  const handleSuggestionClick = (code: string) => {
    setSearchTerm(code);
    setSelectedHsCode(code);
    setSuggestions([]);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      try {
        const data = await apiGet('/api/market-entry-engine/hs-codes/search', { q: value });
        
        const suggestionsList = [];
        
        for (const [keyword, code] of Object.entries(productKeywords)) {
          if (keyword.includes(value) || value.includes(keyword)) {
            suggestionsList.push({
              type: 'keyword' as const,
              keyword: keyword,
              code: code,
              name: getProductDesc(code)
            });
          }
        }

        if (data.hs_codes) {
          data.hs_codes.forEach((item: any) => {
            suggestionsList.push({
              type: 'code' as const,
              code: item.code,
              name: item.name
            });
          });
        }

        const uniqueSuggestions = suggestionsList.slice(0, 6);
        setSuggestions(uniqueSuggestions);
      } catch (error) {
        console.error('Failed to get search suggestions:', error);
        const suggestionsList = [];
        for (const [keyword, code] of Object.entries(productKeywords)) {
          if (keyword.includes(value) || value.includes(keyword)) {
            suggestionsList.push({
              type: 'keyword' as const,
              keyword: keyword,
              code: code,
              name: getProductDesc(code)
            });
          }
        }
        setSuggestions(suggestionsList.slice(0, 6));
      }
    } else {
      setSuggestions([]);
    }
  };

  const quickSearch = (keyword: string) => {
    const code = productKeywords[keyword];
    if (code) {
      setSearchTerm(code);
      setSelectedHsCode(code);
      // 只填充HS code，不立即搜索
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (showLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white z-50 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md w-full"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="inline-block px-6 py-2.5 bg-black text-white text-xs font-mono tracking-widest uppercase rounded-full">
              {language === 'en-US' ? 'Market Entry Engine' : language === 'zh-HK' ? '市場進入引擎' : '市场进入引擎'}
            </div>
          </motion.div>
          
          {/* Animated Progress Ring */}
          <div className="relative w-32 h-32 mx-auto mb-12">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#000000"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: 283, strokeDashoffset: 283 }}
                animate={{ strokeDasharray: 283, strokeDashoffset: 283 - (283 * loadingProgress) / 100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Step Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-serif font-bold mb-3 text-black tracking-tight">
              {loadingStep}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {loadingDetails}
            </p>
          </motion.div>
          
          {/* Progress Bar */}
          <div className="w-full max-w-lg mx-auto mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-black rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              ></motion.div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400 font-mono">{loadingProgress}%</span>
              <span className="text-xs text-gray-400 font-mono">
                {language === 'en-US' ? 'Processing...' : language === 'zh-HK' ? '處理中...' : '处理中...'}
              </span>
            </div>
          </div>
          
          {/* Status Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-black mb-1">200+</div>
              <div className="text-xs text-gray-500">{language === 'en-US' ? 'Countries' : language === 'zh-HK' ? '國家' : '国家'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black mb-1">10M+</div>
              <div className="text-xs text-gray-500">{language === 'en-US' ? 'Data Points' : language === 'zh-HK' ? '數據點' : '数据点'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black mb-1">3</div>
              <div className="text-xs text-gray-500">{language === 'en-US' ? 'Models' : language === 'zh-HK' ? '模型' : '模型'}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <motion.section 
        className="flex-1 flex flex-col justify-center py-20 px-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="max-w-3xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-1.5 bg-gray-100 text-xs font-mono tracking-widest text-gray-500 uppercase mb-6 rounded-full">
              Market Entry Engine
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-black tracking-tight">
              {labels.title}
            </h1>
            <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
              {labels.subtitle}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-xl mx-auto"
          >
            <div className="flex shadow-lg">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={labels.placeholder}
                className="flex-1 px-8 py-5 text-base border border-gray-200 focus:outline-none focus:border-black transition-colors rounded-l-lg"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-10 py-5 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 rounded-r-lg"
              >
                {isLoading ? labels.searching : labels.searchButton}
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 mt-2 max-h-64 overflow-y-auto z-20 rounded-lg shadow-xl">
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(item.code)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-black">{item.code}</span>
                      {item.type === 'keyword' && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Keyword</span>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <div className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-5">
              {labels.hotSearch}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {hotKeywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => quickSearch(keyword)}
                  className="px-5 py-2.5 bg-gray-50 text-gray-700 text-sm rounded-full hover:bg-black hover:text-white transition-all border border-gray-200 hover:border-black"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Search;