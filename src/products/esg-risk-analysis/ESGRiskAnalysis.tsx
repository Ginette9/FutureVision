import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import RiskForm from './RiskForm';
import LogoCarousel from '@/components/LogoCarousel';
import { getCountryId, getProductId } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

// 定义表单验证模式
const contactSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
});

// 获取当前语言的行业数据
export const getIndustries = (t: (key: string) => string | string[]) => {
  const industryList = t("industries") as string[];
  return industryList.map(industry => {
    const industryId = getProductId(industry);
      
    return {
      id: industryId,
      name: industry,
      industryId: industryId // 添加国家ID映射
    };
  });
};

// 获取当前语言的地区数据
export const getCountries = (t: (key: string) => string | string[]) => {
  const countryList = t("countries") as unknown as string[];
  return countryList.map(country => {   
    const countryId = getCountryId(country);
      
    return {
      id: countryId,
      name: country,
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
   setIndustries(getIndustries(t));
   setCountries(getCountries(t));
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
     // 模拟API请求延迟
     await new Promise(resolve => setTimeout(resolve, 1500));
     
     // 清除之前的报告生成记录，确保新的报告会显示loading动画
     const reportGeneratedKey = `reportGenerated_${formData.industry.id}_${formData.country.id}`;
     localStorage.removeItem(reportGeneratedKey);
     
     // 将表单数据存储在localStorage中供结果页面使用
     localStorage.setItem('riskAnalysisData', JSON.stringify(formData));
     
     // 设置标记表示从首页跳转，用于控制AI加载器显示
     sessionStorage.setItem('showAILoader', 'true');
     
     // 导航到结果页面
     navigate('/report');
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
         ESG风险分析工具
       </h1>
       <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
         基于全球数据和先进算法，为您的企业出海提供精准的ESG风险评估和预警
       </p>
       
       {/* 核心价值主张 */}
       <div className="grid md:grid-cols-3 gap-8 mt-12">
         <div className="text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <i className="fa-solid fa-chart-line text-2xl text-gray-600"></i>
           </div>
           <h3 className="text-lg font-medium text-gray-900 mb-2">实时数据监测</h3>
           <p className="text-gray-600">全球ESG事件实时追踪，确保信息时效性</p>
         </div>
         
         <div className="text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <i className="fa-solid fa-shield-alt text-2xl text-gray-600"></i>
           </div>
           <h3 className="text-lg font-medium text-gray-900 mb-2">全面风险评估</h3>
           <p className="text-gray-600">多维度分析，覆盖环境、社会、治理各个层面</p>
         </div>
         
         <div className="text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <i className="fa-solid fa-lightbulb text-2xl text-gray-600"></i>
           </div>
           <h3 className="text-lg font-medium text-gray-900 mb-2">智能分析报告</h3>
           <p className="text-gray-600">AI驱动的深度分析，提供可操作的洞察建议</p>
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
           <h2 className="text-xl font-medium text-gray-900">开始您的风险分析</h2>
           <p className="text-gray-600 mt-1">请填写以下信息，我们将为您生成专业的ESG风险分析报告</p>
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
           <div className="text-3xl font-light text-blue-600 mb-2">50+</div>
           <div className="text-sm text-gray-600">覆盖国家和地区</div>
         </div>
         
         <div className="text-center p-6 bg-gray-50 rounded-lg">
           <div className="text-3xl font-light text-green-600 mb-2">24/7</div>
           <div className="text-sm text-gray-600">实时监测更新</div>
         </div>
         
         <div className="text-center p-6 bg-gray-50 rounded-lg">
           <div className="text-3xl font-light text-purple-600 mb-2">99%</div>
           <div className="text-sm text-gray-600">数据准确率</div>
         </div>
         
         <div className="text-center p-6 bg-gray-50 rounded-lg">
           <div className="text-3xl font-light text-orange-600 mb-2">5min</div>
           <div className="text-sm text-gray-600">快速生成报告</div>
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
           全球企业信赖之选
         </h3>
         <LogoCarousel />
       </motion.div>
     </div>
   </div>
 );
}

