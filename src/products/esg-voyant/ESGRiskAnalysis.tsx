import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import RiskForm from './RiskForm';
import LogoCarousel from '@/components/LogoCarousel';
import { getCountryId, getProductId } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import zhCNTranslations from '@/locales/zh-CN';
import { convertToTraditional } from '@/locales/zh-HK';

// 定义表单验证模式
const contactSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
});

// 获取当前语言的行业数据
export const getIndustries = (
  t: (key: string) => string | string[],
  language?: string
) => {
  const ensureArray = (val: string | string[]) => {
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(String(val));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const enList = ensureArray(t('industries'));
  let zhList: string[] = [];
  if (language === 'zh-CN') {
    // 直接使用当前语言的中文列表
    zhList = ensureArray(t('industries.zh'));
  } else if (language === 'zh-HK') {
    // 优先使用 zh-HK 的中文列表；若不完整则回退到 zh-CN 完整列表
    const zhHK = ensureArray(t('industries.zh'));
    const zhCN = Array.isArray((zhCNTranslations as any)["industries.zh"]) ? (zhCNTranslations as any)["industries.zh"] as string[] : [];
    zhList = zhHK.length === enList.length ? zhHK : (zhCN.length === enList.length ? zhCN : []);
  }
  const displayList = (language === 'zh-CN' || language === 'zh-HK') && zhList.length === enList.length ? zhList : enList;

  return displayList.map((label, idx) => {
    const enName = enList[idx] ?? label;
    const industryId = getProductId(enName);
    return {
      id: industryId,
      name: label,
      industryId
    };
  });
};

// 获取当前语言的地区数据
export const getCountries = (
  t: (key: string) => string | string[],
  language?: string
) => {
  const ensureArray = (val: string | string[]) => {
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(String(val));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const enList = ensureArray(t('countries'));
  let zhList: string[] = [];
  if (language === 'zh-CN') {
    zhList = ensureArray(t('countries.zh'));
  } else if (language === 'zh-HK') {
    const zhHK = ensureArray(t('countries.zh'));
    const zhCN = Array.isArray((zhCNTranslations as any)["countries.zh"]) ? (zhCNTranslations as any)["countries.zh"] as string[] : [];
    zhList = zhHK.length === enList.length ? zhHK : (zhCN.length === enList.length ? zhCN : []);
  }
  const displayList = (language === 'zh-CN' || language === 'zh-HK') && zhList.length === enList.length ? zhList : enList;

  return displayList.map((label, idx) => {
    const enName = enList[idx] ?? label;
    const countryId = getCountryId(enName);
    return {
      id: countryId,
      name: label,
      countryId
    };
  });
};

type FormData = z.infer<typeof contactSchema> & {
  industry: { id: string; name: string } | null;
  country: { id: string; name: string } | null;
  position: string;
  organization: string;
  phone: string;
};

export default function ESGRiskAnalysis() {
 const navigate = useNavigate();
 const { t, language } = useLanguage();
 const [isLoading, setIsLoading] = useState(false);
 const [industries, setIndustries] = useState<Array<{ id: string; name: string }>>([]);
 const [countries, setCountries] = useState<Array<{ id: string; name: string }>>([]);
 
 // 根据语言更新行业和地区数据
 useEffect(() => {
   setIndustries(getIndustries(t, language));
   setCountries(getCountries(t, language));
 }, [language, t]);
  const [formData, setFormData] = useState<FormData>({
    industry: null,
    country: null,
    name: '',
    email: '',
    position: '',
    organization: '',
    phone: '',
  });
 const [isVisible, setIsVisible] = useState(false);

 // 添加滚动动画效果
 useEffect(() => {
   const handleScroll = () => {
     const scrollPosition = window.scrollY;
     setIsVisible(scrollPosition > 50);
   };

   window.addEventListener('scroll', handleScroll);
   return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
   const { name, value } = e.target;
   setFormData(prev => ({ ...prev, [name]: value }));
 };

 const handleSelectChange = (name: string, value: string) => {
  // 支持清空：当 value 为空时，将对应字段置为 null
  if (!value) {
    if (name === 'industry') {
      setFormData((prev) => ({ ...prev, industry: null }));
    } else if (name === 'country') {
      setFormData((prev) => ({ ...prev, country: null }));
    }
    return;
  }

  if (name === 'industry') {
    const selected = industries.find((i) => i.id === value);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        industry: { id: selected.id, name: selected.name },
      }));
    }
  } else if (name === 'country') {
    const selected = countries.find((r) => r.id === value);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        country: { id: selected.id, name: selected.name },
      }));
    }
  }
};

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   
   // 验证表单数据
    const result = contactSchema.safeParse({
      name: formData.name,
      email: formData.email,
    });
   
   if (!result.success) {
     const errorMessage = result.error.issues.map(issue => issue.message).join(', ');
     toast.error(`${t("error.formValidation")}: ${errorMessage}`);
     return;
   }
   
   if (!formData.industry || !formData.country) {
     toast.error(t("error.selectIndustryCountry"));
     return;
   }
   
   setIsLoading(true);
   
  try {
    const payload = {
      name: formData.name,
      email: formData.email,
      position: formData.position,
      organization: formData.organization,
      phone: formData.phone,
      industry: formData.industry,
      country: formData.country
    } as any;
    const endpoints = ['/api/esg-form', 'http://123.56.247.231:3001/api/esg-form', 'http://localhost:3001/api/esg-form', 'http://localhost:3002/api/esg-form'];
    let saved = false;
    for (const ep of endpoints) {
      try {
        const resp = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (resp.ok) { saved = true; break; }
        if (resp.status === 405) {
          const u = new URL(ep, window.location.origin);
          Object.entries(payload).forEach(([k, v]) => u.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')));
          const r2 = await fetch(u.toString(), { method: 'GET' });
          if (r2.ok) { saved = true; break; }
        }
      } catch {}
    }
    if (!saved) {
      //toast.error('信息保存失败');
    }
     
     // 清除之前的报告生成记录，确保新的报告会显示loading动画
     const reportGeneratedKey = `reportGenerated_${formData.industry.id}_${formData.country.id}`;
     localStorage.removeItem(reportGeneratedKey);
     
    // 将表单数据存储在localStorage中供结果页面使用
    localStorage.setItem('riskAnalysisData', JSON.stringify(formData));
     
     // 设置标记表示从首页跳转，用于控制AI加载器显示
     sessionStorage.setItem('showAILoader', 'true');
     
     // 导航到结果页面
     navigate('/esg-voyant/report');
   } catch (error) {
     toast.error('生成报告失败，请重试');
   } finally {
     setIsLoading(false);
   }
 };

 return (
   <div className="min-h-screen bg-white pt-24 pb-16">
     {/* Hero Section */}
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.8 }}
       className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16"
     >
       <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
         ESGVoyant
       </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
        {language === 'en-US' ? (
          <>
            Powered by trusted global data sources and leading algorithms, covering compliant and hidden ESG risks
            <br />
            Provides accurate assessments, alerts and recommendations
          </>
        ) : language === 'zh-HK' ? (
          <>
            {convertToTraditional('基於全球可靠數據來源及領先算法，全面覆蓋合規及隱性ESG風險')}
            <br />
            {convertToTraditional('為您提供全面、精準的評估、預警及建議')}
          </>
        ) : (
          <>基于全球可靠数据来源及领先算法，全面覆盖合规及隐性ESG风险<br />为您提供全面、精准的评估、预警及建议</>
        )}
      </p>
       
       {/* 核心价值主张 */}
       <div className="grid md:grid-cols-3 gap-8 mt-12">
         <div className="text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <i className="fa-solid fa-chart-line text-2xl text-gray-600"></i>
           </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'en-US' ? 'Real-time Data Monitoring' : language === 'zh-HK' ? '實時數據監測' : '实时数据监测'}
          </h3>
          <p className="text-gray-600">
            {language === 'en-US' ? 'Track global ESG events in real time to ensure timeliness' : language === 'zh-HK' ? convertToTraditional('全球ESG事件實時追蹤，確保信息時效性') : '全球ESG事件实时追踪，确保信息时效性'}
          </p>
         </div>
         
         <div className="text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <i className="fa-solid fa-shield-alt text-2xl text-gray-600"></i>
           </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'en-US' ? 'Comprehensive Risk Assessment' : language === 'zh-HK' ? '全面風險評估' : '全面风险评估'}
          </h3>
          <p className="text-gray-600">
            {language === 'en-US' ? 'Multi-dimensional analysis covering environmental, social and governance' : language === 'zh-HK' ? convertToTraditional('多維度分析，覆蓋環境、社會、治理各個層面') : '多维度分析，覆盖环境、社会、治理各个层面'}
          </p>
         </div>
         
         <div className="text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <i className="fa-solid fa-lightbulb text-2xl text-gray-600"></i>
           </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'en-US' ? 'Intelligent Analysis Reports' : language === 'zh-HK' ? '智能分析報告' : '智能分析报告'}
          </h3>
          <p className="text-gray-600">
            {language === 'en-US' ? 'AI-driven deep analysis with actionable insights' : language === 'zh-HK' ? convertToTraditional('AI驅動的深度分析，提供可操作的洞察建議') : 'AI驱动的深度分析，提供可操作的洞察建议'}
          </p>
         </div>
       </div>
     </motion.div>
     
     {/* 表单区域 */}
     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
       <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, delay: 0.2 }}
         className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
       >
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-medium text-gray-900">
              {language === 'en-US' ? 'Start Your Risk Analysis' : language === 'zh-HK' ? '開始您的風險分析' : '开始您的风险分析'}
            </h2>
            <p className="text-gray-600 mt-1">
              {language === 'en-US' ? 'Please fill in the information below and we will generate a professional ESG risk analysis report for you' : language === 'zh-HK' ? convertToTraditional('請填寫以下信息，我們將為您生成專業的ESG風險分析報告') : '请填写以下信息，我们将为您生成专业的ESG风险分析报告'}
            </p>
          </div>
         
         <div className="p-6">
           <RiskForm 
             formData={formData}
             industries={industries}
             countries={countries}
             onInputChange={handleInputChange}
             onSelectChange={handleSelectChange}
             onSubmit={handleSubmit}
             isLoading={isLoading}
           />
         </div>
       </motion.div>
       
       {/* 产品特性 */}
       <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, delay: 0.4 }}
         className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
       >
         <div className="text-center p-6 bg-gray-50 rounded-lg">
           <div className="text-3xl font-light text-blue-600 mb-2">252</div>
           <div className="text-sm text-gray-600">{language === 'en-US' ? 'Countries & Regions' : language === 'zh-HK' ? '國家與地區' : '国家与地区'}</div>
         </div>
         
         <div className="text-center p-6 bg-gray-50 rounded-lg">
           <div className="text-3xl font-light text-green-600 mb-2">471</div>
           <div className="text-sm text-gray-600">{language === 'en-US' ? 'GICS Industries' : language === 'zh-HK' ? 'GICS行業' : 'GICS行业'}</div>
         </div>
         
         <div className="text-center p-6 bg-gray-50 rounded-lg">
           <div className="text-3xl font-light text-purple-600 mb-2">22</div>
           <div className="text-sm text-gray-600">{language === 'en-US' ? 'Core ESG Topics' : language === 'zh-HK' ? 'ESG核心主題' : 'ESG核心主题'}</div>
         </div>
         
         <div className="text-center p-6 bg-gray-50 rounded-lg">
           <div className="text-3xl font-light text-orange-600 mb-2">80%</div>
           <div className="text-sm text-gray-600">{language === 'en-US' ? 'Proportion of Hidden ESG Risks' : language === 'zh-HK' ? '隱性ESG風險占比' : '隐性ESG风险占比'}</div>
         </div>
       </motion.div>
       
       {/* 信任标志 */}
       <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, delay: 0.6 }}
         className="mt-20"
       >
         <h3 className="text-center text-lg font-medium text-gray-900 mb-8">
           {language === 'en-US' ? 'Trusted by Global Enterprises' : language === 'zh-HK' ? '全球企業信賴之選' : '全球企业信赖之选'}
         </h3>
         <LogoCarousel />
       </motion.div>
     </div>
   </div>
 );
}
