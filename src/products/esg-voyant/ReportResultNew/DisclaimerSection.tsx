import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSectionsContent } from './sectionsContent';
import { convertToTraditional } from '@/locales/zh-HK';

export const DisclaimerSection: React.FC = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh-CN' || language === 'zh-HK';
  const toZhHK = (s: string) => (language === 'zh-HK' ? convertToTraditional(s) : s);
  const sectionTitle = isZh ? toZhHK('免责声明') : 'Disclaimer';

  const proseHTML = getSectionsContent(language).disclaimerHtml;

  return (
    <div className="space-y-8">
      {/* 简洁标题区域 */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-900">{sectionTitle}</h2>
          <p className="text-gray-600 mt-1">{isZh ? toZhHK('重要法律与使用信息') : 'Important legal and usage information'}</p>
        </div>
      </div>

      {/* 免责声明内容卡片 */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="space-y-6">
          {/* 重要提醒 */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">{isZh ? toZhHK('重要提示') : 'Important Notice'}</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  {isZh
                    ? toZhHK('本 ESG 风险检查仅供信息参考。用户使用本报告所产生的全部后果由其自行承担。对于重要商业决策，建议咨询具有资质的 ESG 专家。')
                    : 'This ESG Risk Check is provided for informational purposes only. Users assume sole responsibility for all outcomes arising from its application. For material business decisions, consultation with accredited ESG specialists is strongly advised.'}
                </p>
              </div>
            </div>
          </div>

          {/* 详细免责声明 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
              <h3 className="text-xl font-medium text-gray-900">{isZh ? toZhHK('法律声明') : 'Legal Disclaimer'}</h3>
            </div>
            
            <div
              className={[
                'prose prose-lg max-w-none text-gray-700 leading-relaxed',
                'prose-a:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
                '[&_strong]:text-gray-900 [&_strong]:font-semibold',
                '[&_p]:mb-6 [&_p]:leading-relaxed',
              ].join(' ')}
              dangerouslySetInnerHTML={{ __html: proseHTML }}
            />
          </div>
        </div>
      </div>

      {/* 数据来源和标准 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{isZh ? toZhHK('国际标准') : 'International Standards'}</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {isZh
              ? toZhHK('基于 OECD 指南与联合国商业与人权指导原则，确保与全球认可的 ESG 框架保持一致。')
              : 'Based on OECD Guidelines and UN Guiding Principles on Business and Human Rights, ensuring alignment with globally recognized ESG frameworks.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{isZh ? toZhHK('数据来源') : 'Data Sources'}</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {isZh
              ? toZhHK('信息来源于经核验的公开渠道，采用 ISO 3166 标准、联合国统计司分类与可靠性评估机制整理。')
              : 'Information compiled from verified public sources using ISO 3166 standards, UN Statistics Division classifications, and reliability-checked data.'}
          </p>
        </div>
      </div>
    </div>
  );
};
