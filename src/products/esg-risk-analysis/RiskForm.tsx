import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  const [industrySearch, setIndustrySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [filteredIndustries, setFilteredIndustries] = useState(industries);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // 过滤行业选项
  useEffect(() => {
    if (!industrySearch.trim()) {
      setFilteredIndustries(industries);
      return;
    }
    
    const searchTerm = industrySearch.toLowerCase();
    setFilteredIndustries(
      industries.filter(industry => 
        industry.name.toLowerCase().includes(searchTerm)
      )
    );
  }, [industrySearch, industries]);

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
  const handleIndustrySelect = (industryId: string) => {
    onSelectChange('industry', industryId);
    const selectedIndustry = industries.find(ind => ind.id === industryId);
    setIndustrySearch(selectedIndustry?.name || '');
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
            行业 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.industry?.name || industrySearch}
              onChange={(e) => {
                setIndustrySearch(e.target.value);
                setShowIndustryDropdown(true);
              }}
              onFocus={() => setShowIndustryDropdown(true)}
              placeholder="请选择或搜索行业"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            
            {showIndustryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredIndustries.map((industry) => (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => handleIndustrySelect(industry.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {industry.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </AnimatedFormField>

        {/* 地区选择 */}
        <AnimatedFormField delay={0.2}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目标地区 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.country?.name || countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setShowCountryDropdown(true);
              }}
              onFocus={() => setShowCountryDropdown(true)}
              placeholder="请选择或搜索地区"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            
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
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="请输入您的姓名"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </AnimatedFormField>

        <AnimatedFormField delay={0.4}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            placeholder="请输入您的邮箱"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </AnimatedFormField>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedFormField delay={0.5}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            职位
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={onInputChange}
            placeholder="请输入您的职位"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </AnimatedFormField>

        <AnimatedFormField delay={0.6}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            公司/组织
          </label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={onInputChange}
            placeholder="请输入您的公司或组织"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </AnimatedFormField>
      </div>

      <AnimatedFormField delay={0.7}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          联系电话
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onInputChange}
          placeholder="请输入您的联系电话"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <span>正在生成报告...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-chart-line"></i>
              <span>生成ESG风险分析报告</span>
            </>
          )}
        </button>
      </AnimatedFormField>

      {/* 说明文字 */}
      <AnimatedFormField delay={0.9}>
        <p className="text-sm text-gray-500 text-center">
          点击生成报告即表示您同意我们的
          <a href="#" className="text-gray-600 hover:text-gray-700 underline">服务条款</a>
          和
          <a href="#" className="text-gray-600 hover:text-gray-700 underline">隐私政策</a>
        </p>
      </AnimatedFormField>
    </form>
  );
}

