import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';
import IndustryTreeSelect from './IndustryTreeSelect';

interface RiskFormProps {
  formData: {
    industry: { id: string; name: string } | null;
    country: { id: string; name: string } | null;
    name: string;
    position: string;
    organization: string;
    email: string;
    phone: string;
  };
  industries: Array<{ id: string; name: string }>;
  countries: Array<{ id: string; name: string }>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

// 表单字段动画组件
const AnimatedFormField = ({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function RiskForm({
  formData,
  industries,
  countries,
  onInputChange,
  onSelectChange,
  onSubmit,
  isLoading,
}: RiskFormProps) {
  const { language } = useLanguage();
  const labels = {
    industry: language === 'en-US' ? 'Industry' : language === 'zh-HK' ? '行業' : '行业',
    industryPh: language === 'en-US' ? 'Please select or search industry' : language === 'zh-HK' ? '請選擇或搜索行業' : '请选择或搜索行业',
    clearIndustry: language === 'en-US' ? 'Clear industry' : language === 'zh-HK' ? '清除行業' : '清除行业',
    country: language === 'en-US' ? 'Target Country/Region' : language === 'zh-HK' ? '目標地區' : '目标地区',
    countryPh: language === 'en-US' ? 'Please select or search region' : language === 'zh-HK' ? '請選擇或搜索地區' : '请选择或搜索地区',
    clearCountry: language === 'en-US' ? 'Clear region' : language === 'zh-HK' ? '清除地區' : '清除地区',
    name: language === 'en-US' ? 'Name' : language === 'zh-HK' ? '姓名' : '姓名',
    namePh: language === 'en-US' ? 'Please enter your name' : language === 'zh-HK' ? '請輸入您的姓名' : '请输入您的姓名',
    email: language === 'en-US' ? 'Email' : language === 'zh-HK' ? '郵箱' : '邮箱',
    emailPh: language === 'en-US' ? 'Please enter your email' : language === 'zh-HK' ? '請輸入您的郵箱' : '请输入您的邮箱',
    position: language === 'en-US' ? 'Position' : language === 'zh-HK' ? '職位' : '职位',
    positionPh: language === 'en-US' ? 'Please enter your position' : language === 'zh-HK' ? '請輸入您的職位' : '请输入您的职位',
    organization: language === 'en-US' ? 'Company/Organization' : language === 'zh-HK' ? '公司/組織' : '公司/组织',
    organizationPh: language === 'en-US' ? 'Please enter your company or organization' : language === 'zh-HK' ? '請輸入您的公司或組織' : '请输入您的公司或组织',
    phone: language === 'en-US' ? 'Phone' : language === 'zh-HK' ? '聯繫電話' : '联系电话',
    phonePh: language === 'en-US' ? 'Please enter your phone number' : language === 'zh-HK' ? '請輸入您的聯繫電話' : '请输入您的联系电话',
    submit: language === 'en-US' ? 'Generate ESG Risk Analysis Report' : language === 'zh-HK' ? '生成ESG風險分析報告' : '生成ESG风险分析报告',
    loading: language === 'en-US' ? 'Generating report...' : language === 'zh-HK' ? '正在生成報告...' : '正在生成报告...'
  };
  const terms = {
    prefix: language === 'en-US' ? 'By clicking “Generate Report”, you agree to our ' : language === 'zh-HK' ? '點擊生成報告即表示您同意我們的' : '点击生成报告即表示您同意我们的',
    tos: language === 'en-US' ? 'Terms of Service' : language === 'zh-HK' ? '服務條款' : '服务条款',
    and: language === 'en-US' ? ' and ' : language === 'zh-HK' ? '和' : '和',
    privacy: language === 'en-US' ? 'Privacy Policy' : language === 'zh-HK' ? '隱私政策' : '隐私政策'
  };
  const [industrySearch, setIndustrySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  // 行业改为分级组件控制（保留搜索输入用于过滤）
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // 行业列表由分级组件内部处理，不在此处过滤

  // 过滤地区选项
  useEffect(() => {
    if (!countrySearch.trim()) {
      setFilteredCountries(countries);
      return;
    }
    
    const searchTerm = countrySearch.toLowerCase();
    setFilteredCountries(
      countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm)
      )
    );
  }, [countrySearch, countries]);

  // 选择行业处理函数
  const handleIndustrySelect = (industryId: string, label?: string) => {
    onSelectChange('industry', industryId);
    setIndustrySearch(label || '');
    setShowIndustryDropdown(false);
  };

  // 选择地区处理函数
  const handleCountrySelect = (countryId: string) => {
    onSelectChange('country', countryId);
    const selectedCountry = countries.find(reg => reg.id === countryId);
    setCountrySearch(selectedCountry?.name || '');
    setShowCountryDropdown(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 行业和地区选择 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 行业选择 */}
        <AnimatedFormField delay={0.1}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.industry} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.industry?.name || industrySearch}
              onChange={(e) => {
                setIndustrySearch(e.target.value);
                setShowIndustryDropdown(true);
                // 若已选中行业，则清空以便继续输入或重新选择
                if (formData.industry) {
                  onSelectChange('industry', '');
                }
              }}
              onFocus={() => setShowIndustryDropdown(true)}
              placeholder={labels.industryPh}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {(formData.industry || industrySearch) && (
              <button
                type="button"
                aria-label={labels.clearIndustry}
                onClick={() => {
                  setIndustrySearch('');
                  onSelectChange('industry', '');
                  setShowIndustryDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 8.586l3.536-3.536a1 1 0 111.414 1.414L11.414 10l3.536 3.536a1 1 0 01-1.414 1.414L10 11.414l-3.536 3.536a1 1 0 01-1.414-1.414L8.586 10 5.05 6.464a1 1 0 111.414-1.414L10 8.586z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {showIndustryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                <IndustryTreeSelect
                  searchTerm={industrySearch}
                  onSelect={(id, label) => handleIndustrySelect(id, label)}
                  selectedId={formData.industry?.id || undefined}
                />
              </div>
            )}
          </div>
        </AnimatedFormField>

        {/* 地区选择 */}
        <AnimatedFormField delay={0.2}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.country} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.country?.name || countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setShowCountryDropdown(true);
                // 若已选中地区，则清空以便继续输入或重新选择
                if (formData.country) {
                  onSelectChange('country', '');
                }
              }}
              onFocus={() => setShowCountryDropdown(true)}
              placeholder={labels.countryPh}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {(formData.country || countrySearch) && (
              <button
                type="button"
                aria-label={labels.clearCountry}
                onClick={() => {
                  setCountrySearch('');
                  onSelectChange('country', '');
                  setShowCountryDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 8.586l3.536-3.536a1 1 0 111.414 1.414L11.414 10l3.536 3.536a1 1 0 01-1.414 1.414L10 11.414l-3.536 3.536a1 1 0 01-1.414-1.414L8.586 10 5.05 6.464a1 1 0 111.414-1.414L10 8.586z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {showCountryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => handleCountrySelect(country.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {country.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </AnimatedFormField>
      </div>

      {/* 联系信息 */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedFormField delay={0.3}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder={labels.namePh}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </AnimatedFormField>

        <AnimatedFormField delay={0.4}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.email} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder={labels.emailPh}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </AnimatedFormField>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedFormField delay={0.5}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.position} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={onInputChange}
            placeholder={labels.positionPh}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </AnimatedFormField>

        <AnimatedFormField delay={0.6}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.organization} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={onInputChange}
            placeholder={labels.organizationPh}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </AnimatedFormField>
      </div>

      <AnimatedFormField delay={0.7}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {labels.phone} <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onInputChange}
          placeholder={labels.phonePh}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          required
        />
      </AnimatedFormField>

      {/* 提交按钮 */}
      <AnimatedFormField delay={0.8}>
        <button
          type="submit"
          disabled={isLoading || !formData.industry || !formData.country || !formData.name || !formData.email}
          className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{labels.loading}</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-chart-line"></i>
              <span>{labels.submit}</span>
            </>
          )}
        </button>
      </AnimatedFormField>

      {/* 说明文字 */}
      <AnimatedFormField delay={0.9}>
        <p className="text-sm text-gray-500 text-center">
          {terms.prefix}
          <a href="#" className="text-gray-600 hover:text-gray-700 underline">{terms.tos}</a>
          {terms.and}
          <a href="#" className="text-gray-600 hover:text-gray-700 underline">{terms.privacy}</a>
        </p>
      </AnimatedFormField>
    </form>
  );
}
