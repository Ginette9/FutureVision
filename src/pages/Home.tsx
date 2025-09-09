import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import RiskForm from '@/components/RiskForm';
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

export default function Home() {
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
   <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950 py-16 px-4 sm:px-6 lg:px-8">
     {/* 装饰元素 */}
     <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
       <div className="absolute top-20 left-10 w-64 h-64 bg-purple-400/10 dark:bg-purple-600/20 rounded-full blur-3xl"></div>
       <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/20 rounded-full blur-3xl"></div>
     </div>
     
     <div className="max-w-4xl mx-auto">
       {/* 页面标题 */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8, ease: "easeOut" }}
         className="text-center mb-12"
       >
         <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-400 dark:to-indigo-500 mb-4">
           {t("home.title")}
         </h1>
         <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
           {t("home.subtitle")}
         </p>
       </motion.div>
       
       {/* 表单卡片 */}
       <motion.div
         initial={{ opacity: 0, y: 30, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-slate-100 dark:border-slate-700"
       >
         <div className="p-6 sm:p-8">
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
       
       {/* 特性介绍 */}
       <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
         className="mt-16 grid md:grid-cols-3 gap-8"
       >
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-100 dark:border-slate-700 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
           <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-5">
             <i className="fa-solid fa-chart-line text-2xl text-purple-600 dark:text-purple-400"></i>
           </div>
           <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t("home.why.data.title")}</h3>
           <p className="text-slate-600 dark:text-slate-300">{t("home.why.data.desc")}</p>
         </div>
         
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-100 dark:border-slate-700 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
           <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-5">
             <i className="fa-solid fa-shield-alt text-2xl text-indigo-600 dark:text-indigo-400"></i>
           </div>
           <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t("home.why.comprehensive.title")}</h3>
           <p className="text-slate-600 dark:text-slate-300">{t("home.why.comprehensive.desc")}</p>
         </div>
         
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-100 dark:border-slate-700 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
           <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-5">
             <i className="fa-solid fa-lightbulb text-2xl text-purple-600 dark:text-purple-400"></i>
           </div>
           <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{t("home.why.custom.title")}</h3>
           <p className="text-slate-600 dark:text-slate-300">{t("home.why.custom.desc")}</p>
         </div>
       </motion.div>
       
       {/* 信任标志 */}
       <div className="mt-20">
         <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">受到全球企业的信任</p>
         <LogoCarousel />
       </div>
     </div>
     
     {/* 回到顶部按钮 */}
     <motion.button
       initial={{ opacity: 0, scale: 0.8 }}
       animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
       transition={{ duration: 0.3 }}
       onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
       className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all z-30"
       aria-label="Back to top"
     >
       <i className="fa-solid fa-arrow-up"></i>
     </motion.button>
   </div>
 );
}

