import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { warmupDatabases } from '@/lib/database';

// 支持的语言类型
type Language = 'en-US' | 'zh-CN' | 'zh-HK';

// 翻译资源接口（允许字符串或字符串数组）
interface TranslationResources {
  [key: string]: string | string[];
}

// 语言上下文接口
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | string[];
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 加载翻译资源，带英文默认回退：先加载 en-US，再用目标语言覆盖
const loadTranslations = async (lang: Language): Promise<TranslationResources> => {
  const base = (await import('@/locales/en-US')).default as TranslationResources;
  if (lang === 'zh-CN') {
    try {
      const zh = (await import('@/locales/zh-CN')).default as TranslationResources;
      return { ...base, ...zh };
    } catch (e) {
      console.error('Failed to load zh-CN translations, falling back to en-US:', e);
      return base;
    }
  }
  if (lang === 'zh-HK') {
    try {
      const zhHK = (await import('@/locales/zh-HK')).default as TranslationResources;
      return { ...base, ...zhHK };
    } catch (e) {
      console.error('Failed to load zh-HK translations, falling back to en-US:', e);
      return base;
    }
  }
  return base;
};

// LanguageProvider组件
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [translations, setTranslations] = useState<TranslationResources>({});
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en-US' || saved === 'zh-HK' || saved === 'zh-CN') ? (saved as Language) : 'zh-CN';
  });

  // 根据当前语言加载翻译资源
  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const trans = await loadTranslations(language);
        setTranslations(trans);
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();

    try {
      const root = document.documentElement;
      root.classList.remove('lang-en', 'lang-zh-cn', 'lang-zh-hk');
      if (language === 'en-US') root.classList.add('lang-en');
      else if (language === 'zh-HK') root.classList.add('lang-zh-hk');
      else root.classList.add('lang-zh-cn');
      // 将当前语言同步到全局与本地存储，确保其他模块（如数据库加载）立即读取正确语言
      localStorage.setItem('language', language);
      (window as any).__fvLanguage = language;
      void warmupDatabases();
    } catch {}
  }, [language]);

  // 翻译函数
  const t = (key: string): string | string[] => {
    const value = translations[key];
    if (value === undefined) return key;
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage: (lang: Language) => {
      setLanguageState(lang);
      try {
        localStorage.setItem('language', lang);
        // 暴露到全局，部分工具可读取
        (window as any).__fvLanguage = lang;
      } catch {}
    } }}>
      {!isLoading && children}
    </LanguageContext.Provider>
  );
};

// useLanguage hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
