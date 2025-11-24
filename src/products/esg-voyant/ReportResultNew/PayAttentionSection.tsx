import React, { useMemo, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToTraditional } from '@/locales/zh-HK';
import { getConsiderationIdsByCountryAndIndustry, getConsiderationsByIds } from '@/lib/database';

type CardData = {
  title: string;
  content: string;
  content_html?: string;
};

interface Props {
  countryName: string;
  industryName: string;
}

export const PayAttentionSection: React.FC<Props> = ({ countryName, industryName }) => {
  const { language } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isZh = language === 'zh-CN' || language === 'zh-HK';

  useEffect(() => {
    const loadConsiderations = async () => {
      try {
        setIsLoading(true);
        
        // 获取 consideration_ids
        const considerationIds = await getConsiderationIdsByCountryAndIndustry(countryName, industryName);
        
        if (considerationIds) {
          // 获取具体的 considerations 内容
          const considerations = await getConsiderationsByIds(considerationIds);
          
          // 转换为卡片数据格式
          const cardData: CardData[] = considerations.map((consideration) => {
            if (consideration.content_html) {
              // 如果有 HTML 内容，从中提取标题用于显示
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = consideration.content_html;
              const firstHeading = tempDiv.querySelector('h1, h2, h3, h4, h5, h6');
              const title = firstHeading ? firstHeading.textContent || '' : '';
              
              return {
                title: title.replace(/CSR/g, 'ESG'),
                content: '',
                content_html: consideration.content_html
              };
            } else {
              // 从 content 中提取标题和内容
              const lines = consideration.content.split('\n').filter(line => line.trim());
              const title = lines[0] || 'Important Consideration';
              const content = lines.slice(1).join('\n').trim() || consideration.content;
              
              return {
                title: title.replace(/CSR/g, 'ESG'),
                content: content.replace(/CSR/g, 'ESG'),
                content_html: consideration.content_html
              };
            }
          });
          
          setCards(cardData);
        }
      } catch (error) {
        console.error('Failed to load considerations:', error);
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (countryName && industryName) {
      loadConsiderations();
    }
  }, [countryName, industryName, language]);

  const toZhHK = (s: string) => (language === 'zh-HK' ? convertToTraditional(s) : s);
  const sectionTitle = isZh ? toZhHK('重要注意事项') : 'Important to Consider';
  const sectionSubtitle = isZh ? toZhHK('ESG 风险评估中的关键考量') : 'Critical factors for your ESG risk assessment';
  const introParagraph = isZh
    ? toZhHK('以下是与您选择的国家和行业组合相关的关键注意事项。这些因素需要在您的 ESG 风险评估中进行仔细考量。')
    : 'Below are important considerations specific to your selected country and industry combination. These factors should be carefully evaluated in your ESG risk assessment.';

  // 没有数据时兜底
  if (!introParagraph && (!cards || cards.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">{sectionSubtitle}</p>
        </div>
      </div>

      {/* 引言段落 */}
      {introParagraph && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium">{introParagraph}</p>
          </div>
        </div>
      )}

      {/* 卡片列表 */}
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-sm font-semibold text-white">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-light text-gray-900 group-hover:text-gray-600 transition-colors">
                  {card.title}
                </h3>
              </div>
            </div>
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed ml-14"
            >
              {card.content_html ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: card.content_html }} 
                  className="[&_h1]:hidden [&_h2]:hidden [&_h3]:hidden [&_h4]:hidden [&_h5]:hidden [&_h6]:hidden"
                />
              ) : (
                <p>{card.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
