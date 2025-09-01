import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 固定语言类型为英文
type Language = 'en-US';

// 翻译资源接口
interface TranslationResources {
  [key: string]: string;
}

// 语言上下文接口
interface LanguageContextType {
  language: Language;
  t: (key: string) => string | string[];
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 固定加载英文翻译
const loadTranslations = async (): Promise<TranslationResources> => {
  return (await import('@/locales/en-US')).default;
};

// LanguageProvider组件
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [translations, setTranslations] = useState<TranslationResources>({});
  const [isLoading, setIsLoading] = useState(true);

  // 加载翻译资源（仅英文）
  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const trans = await loadTranslations();
        setTranslations(trans);
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  // 翻译函数
  const t = (key: string): string | string[] => {
    const value = translations[key] || key;

    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language: 'en-US', t }}>
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
