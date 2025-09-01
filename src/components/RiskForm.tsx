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
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 行业选择 */}
        <AnimatedFormField delay={0.1}>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t("form.industry")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                id="industry"
                value={industrySearch || formData.industry?.name || ''}
                onChange={(e) => setIndustrySearch(e.target.value)}
                onFocus={() => setShowIndustryDropdown(true)}
                placeholder={t("form.select.industry")}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <i className={`fa-solid ${showIndustryDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-400 transition-transform`}></i>
              </div>
            </div>
            
            {showIndustryDropdown && (
              <motion.div
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ opacity: 1, maxHeight: 300 }}
                exit={{ opacity: 0, maxHeight: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg z-10 overflow-hidden"
              >
                {filteredIndustries.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {filteredIndustries.map((industry) => (
                      <div
                        key={industry.id}
                        onClick={() => handleIndustrySelect(industry.id)}
                        className={`px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                          formData.industry?.id === industry.id ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : ''
                        }`}
                      >
                        {industry.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
                    {t("form.noMatchingIndustry")}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </AnimatedFormField>
        
        {/* 地区选择 */}
        <AnimatedFormField delay={0.2}>
          <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t("form.country")} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                id="country"
                value={countrySearch || formData.country?.name || ''}
                onChange={(e) => setCountrySearch(e.target.value)}
                onFocus={() => setShowCountryDropdown(true)}
                placeholder={t("form.select.country")}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <i className={`fa-solid ${showCountryDropdown ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-400 transition-transform`}></i>
              </div>
            </div>
            
            {showCountryDropdown && (
              <motion.div
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ opacity: 1, maxHeight: 300 }}
                exit={{ opacity: 0, maxHeight: 0 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg z-10 overflow-hidden"
              >
                {filteredCountries.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <div
                        key={country.id}
                        onClick={() => handleCountrySelect(country.id)}
                        className={`px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                          formData.country?.id === country.id ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : ''
                        }`}
                      >
                        {country.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
                    {t("form.noMatchingCountry")}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </AnimatedFormField>
      </div>
      
      <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6 flex items-center">
          <i className="fa-solid fa-user-circle mr-2 text-purple-500"></i>
          {t("form.contactInfo")}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 姓名 */}
          <AnimatedFormField delay={0.3}>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("form.name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder={t("form.placeholder.name")}
              required
            />
          </AnimatedFormField>
          
          {/* 邮箱 */}
          <AnimatedFormField delay={0.4}>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("form.email")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder={t("form.placeholder.email")}
              required
            />
          </AnimatedFormField>
        </div>
      </div>
      
      <AnimatedFormField delay={0.9}>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              {t("form.loading")}
            </>
          ) : (
            <>
              <i className="fa-solid fa-chart-pie mr-2"></i>
              {t("form.submit")}
            </>
          )}
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
          {t("form.terms")}
          <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline ml-1">{t("form.serviceTerms")}</a>
          {t("form.terms") === "By clicking \"Get ESG Risk Analysis Report\", you agree to our" ? " and " : " 和 "}
          <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline ml-1">{t("form.privacyPolicy")}</a>
        </p>
      </AnimatedFormField>
    </form>
  );
}

