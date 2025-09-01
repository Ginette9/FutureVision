import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// 语言选项类型
type LanguageOption = {
  code: 'en-US';
  nameKey: string;
  flag: string;
};

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false); // 控制下拉菜单显示状态

  // 语言选项配置
  const languageOptions: LanguageOption[] = [
    { code: 'en-US', nameKey: 'language.enUS', flag: '🇺🇸' },
    // 如果有更多语言，继续添加
  ];

  const currentLanguage = languageOptions.find(option => option.code === language);

  return (
    <div className="relative inline-block">
      {/* 当前选中的语言 */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700"
        aria-label="Select language"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="font-medium text-slate-900 dark:text-white">
          {t(currentLanguage?.nameKey || '')}
        </span>
        <i
          className={cn(
            "fa-solid fa-chevron-down text-xs text-slate-500 dark:text-slate-400 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        ></i>
      </button>

      {/* 语言下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden z-50 border border-slate-200 dark:border-slate-700"
          >
            {languageOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => {
                  setLanguage(option.code);
                  setIsOpen(false); // 切换后自动关闭
                }}
                className={cn(
                  "w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors duration-200",
                  language === option.code
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                <span className="text-xl">{option.flag}</span>
                <span className="font-medium text-slate-900 dark:text-white">{t(option.nameKey)}</span>
                {language === option.code && (
                  <i className="fa-solid fa-check ml-auto text-purple-600 dark:text-purple-400"></i>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
